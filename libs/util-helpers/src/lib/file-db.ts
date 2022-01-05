import { FSWatcher, watch, mkdirSync, existsSync, writeFileSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { ILogger } from './log';

export interface IData<T> {
  [key: string]: T;
};

interface IDataEnvelope<T> {
  /** Версия структуры файла базы данных */
  version: string;
  /** Версия структуры данных */
  dataVersion: string;
  data: IData<T>;
};

type MigrateFn<T extends Object> = (loadedDataVersion: string, loadedData: IData<any>, neededDataVersion: string) => IData<T>;

interface IFileDBParams<T extends Object> {
  fn: string;
  dataVersion?: string;
  logger?: ILogger;
  initData?: IData<T>;
  migrate?: MigrateFn<T>;
  check?: (data: IData<T>) => boolean;
  ignore?: boolean;
  watch?: boolean;
  space?: number;
};

export class FileDB<T extends Object> {
  private _data: IData<T> | undefined;
  private _dataVersion: string;
  private _fn: string;
  private _modified: boolean = false;
  private _initData: IData<T>;
  private _migrate?: MigrateFn<T>;
  private _check?: (data: IData<T>) => boolean;
  private _ignore?: boolean;
  private _logger: ILogger;
  private _watcher: FSWatcher | undefined;
  private _watch?: boolean;
  private _needReload?: boolean;
  private _space?: number;

  /**
   * Конструктор.
   * @param fn Имя файла с данными.
   * @param initData Начальные данные, если файла нет или в нем данные неверного формата.
   * @param check Функция для проверки считанных из файла данных на корректность.
   * @param ignore Если true, то при наличии в файле некорректных данных не будет выдаваться исключение.
   */
  constructor ({ fn, dataVersion, initData, check, ignore, logger, migrate, watch, space }: IFileDBParams<T>)
  {
    this._fn = fn;
    this._dataVersion = dataVersion || '1.0';
    this._initData = initData ?? {};
    this._check = check;
    this._ignore = ignore;
    this._logger = logger ?? console;
    this._migrate = migrate;
    this._watch = watch;
    this._space = space;
  }

  #getEnvelope(): IDataEnvelope<T> {
    return {
      version: '1.0',
      dataVersion: this._dataVersion,
      data: this._data
    };
  }

  private _setWatcher() {
    if (this._watch) {
      this._watcher = watch(this._fn, (event) => {
        /**
          * Если файл поменялся на диске, перечитаем его данные при следующем обращении.
          * Но, если данные были изменены в памяти, то не будем перечитывать и предупредим
          * пользователя, что он потеряет свои изменения, сделанные на диске.
          */
        if (!this._needReload && event === 'change' && this._data) {
          if (this._modified) {
            this._logger.warn(`Changes on the disk for file ${this._fn} will be overwritten.`);
          } else {
            this._needReload = true;
            this._logger.info(`File ${this._fn} has been changed on disk. Data will be re-read on next access.`);
          }
        }
      });
    }
  }

  private async _load(): Promise<IData<T>> {
    if (!this._data || this._needReload) {
      this._needReload = false;

      if (existsSync(this._fn)) {
        let emptyFile = false;

        try {
          const start = Date.now();
          const raw = await readFile(this._fn, { encoding: 'utf8' });
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.version === '1.0' && typeof parsed.dataVersion === 'string' && typeof parsed.data === 'object') {

              if (!this._migrate && this._dataVersion !== parsed.dataVersion) {
                throw new Error(`Invalid data structure version in file ${this._fn}`);
              }

              // we allegedly call _migrate even if loaded dataVersion matches needed dataVersion
              const data = this._migrate?.(parsed.dataVersion, parsed.data, this._dataVersion) ?? parsed.data;

              if (!this._check || this._check(data)) {
                this._logger.info(`Data has been loaded from ${this._fn}. Keys: ${Object.keys(parsed.data).length}. Time: ${Date.now() - start}ms...`);
                this._data = data;
                this._setWatcher();
              }
            }
          } else {
            emptyFile = true;
          }
        }
        catch (e) {
          // ошибки парсинга JSON, мы просто выводим в лог
          // потому что может быть ситуация, когда пользователь
          // выполнил частичное редактирование JSON и сохранил
          // промежуточную версию
          if (this._watch || this._ignore) {
            this._logger.error(`File: ${this._fn}, error: ${e}`);
          } else {
            throw e;
          }
        }

        if (!this._data && !this._ignore && !emptyFile) {
          throw new Error(`Invalid data in file: ${this._fn}`);
        }
      }

      if (!this._data) {
        this._data = this._initData;
      }
    }

    return this._data;
  }

  public isEmpty() {
    return !Object.keys(this.getMutable(false)).length;
  }

  public getMutable(forWrite: boolean) {
    if (forWrite) {
      this._modified = true;
    }
    return this._load();
  }

  public clear() {
    this._data = {};
    this._modified = true;
  }

  public async read(key: string): Promise<T | undefined> {
    return (await this._load())[key];
  }

  public async write(key: string, data: T, force = false) {
    (await this._load())[key] = data;
    if (force) {
      this.flush(true);
    } else {
      this._modified = true;
    }
  }

  public async delete(key: string) {
    await this._load();

    if (this._data && this._data[key]) {
      delete this._data[key];
      this._modified = true;
    }
  }

  public async has(key: string) {
    await this._load();
    return this._data && key in this._data;
  }

  public async findOne(f: (rec: T) => boolean): Promise<T | undefined> {
    await this._load();
    const found = this._data && Object.entries(this._data).find( ([_, rec]) => f(rec) );
    return found && found[1];
  }

  public put(data: IData<T>, flush = true): Promise<void> {
    this._data = data;
    if (flush) {
      return this.flush(true);
    } else {
      this._modified = true;
    }
  }

  public async merge(key: string, data: Partial<T>, omit?: (keyof T)[]) {
    const prev = (await this._load())[key];
    this._data![key] = {...prev, ...data};
    if (omit) {
      const obj = this._data![key] as any;
      for (const omitProp of omit) {
        delete obj[omitProp];
      }
    }
    this._modified = true;
  }

  public async flush(force = false) {
    if (this._data && (force || this._modified)) {
      const dirName = dirname(this._fn);

      try {
        if (!existsSync(dirName)) {
          // создадим папку, если она не существует
          mkdirSync(dirName, { recursive: true });
        }

        this._watcher?.close();
        await writeFile(this._fn, JSON.stringify(this.#getEnvelope(), undefined, this._space), { encoding: 'utf8' });
        this._setWatcher();
        this._modified = false;
        this._logger.info(`Data has been written to ${this._fn}. Keys: ${Object.keys(this._data).length}...`);
      } catch (e) {
        this._logger.error(`Error writting to file ${this._fn}. ${e}`);
      }
    } else {
      this._logger.info(`Appempt to flush ${this._fn} has been made. There are no data or changes to be written...`);
    }
  }

  public done() {
    if (this._data && this._modified) {
      const dirName = dirname(this._fn);

      try {
        if (!existsSync(dirName)) {
          // создадим папку, если она не существует
          mkdirSync(dirName, { recursive: true });
        }

        if (!existsSync(dirName)) {
          this._logger.error(`Can't create folder ${dirName}`);
        } else {
          this._watcher?.close();
          writeFileSync(this._fn, JSON.stringify(this.#getEnvelope(), undefined, this._space), { encoding: 'utf8' });
          this._modified = false;
          this._logger.info(`Data has been written to ${this._fn}. Keys: ${Object.keys(this._data).length}...`);
        }
      } catch (e) {
        this._logger.error(`Error writting to file ${this._fn}. ${e}`);
      }
    } else {
      this._logger.info(`Appempt to flush ${this._fn} has been made. There are no data or changes to be written...`);
    }

    this._data = undefined;
  }
};