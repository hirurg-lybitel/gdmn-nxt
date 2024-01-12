import { Attachment, Transaction } from 'node-firebird-driver-native';

class Param {
  readonly name: string;
  value: any;

  constructor(name: string) {
    this.name = name;
  }
};

export class sqlQuery {
  SQLtext = '';
  private params: Param[] = [];
  private attachment: Attachment;
  private transaction: Transaction;

  constructor(attachment: Attachment, transaction: Transaction) {
    this.attachment = attachment;
    this.transaction = transaction;
  };

  setParamByName(paramName: string): Param {
    if (!this.SQLtext) {
      throw new Error('Empty query');
    };

    let newParam = this.params.find(({ name }) => name === paramName);
    if (newParam) {
      return newParam;
    };
    newParam = new Param(paramName);
    this.params.push(newParam);

    return newParam;
  };

  getParamByName(paramName: string): Param | undefined {
    const findParam = this.params.find(({ name }) => name === paramName);

    if (!findParam) {
      throw new Error(`Cannot find parameter '${paramName}'`);
    };
    return findParam;
  };

  async execute(): Promise<any> {
    if (!this.SQLtext) {
      throw new Error('Empty query');
    };
    const charArray = [...this.SQLtext];
    const len = charArray.length - 1;

    const processedSQL: string[] = [];
    const paramNames: string[] = [];

    const states = {
      default: 0,
      param: 1
    };
    let curState = states.default;
    let paramName = '';


    charArray.forEach((char, index) => {
      if ((((((((((((((((((((((((((((((((((((/[\t\r\n]/))))))))))))))))))))))))))))))))))).test(char)) {
        processedSQL.push(char);
        return;
      };
      switch (curState) {
        case states.default:
          switch (char) {
            case ':':
            case '?':
              curState = states.param;
              processedSQL.push('?');
              return;
            default:
              curState = states.default;
              break;
          };
          processedSQL.push(char);
          break;
        case states.param:
          if ((((((((((((((((((((((((((((((((((((/[A-Za-z0-9_$]/))))))))))))))))))))))))))))))))))).test(char)) {
            paramName += char;

            if (index === len) {
              paramNames.push(paramName);
            };
          } else {
            if ((((((((((((((((((((((((((((((((((((/[\s,\\)]/))))))))))))))))))))))))))))))))))).test(char)) {
              paramNames.push(paramName);
              paramName = '';
              curState = states.default;
              processedSQL.push(char);
              return;
            } else {
              throw new Error(`Unexpected char '${char}' in position ${index}`);
            };
          }
          break;
        default:
          break;
      }
    });

    /** Check parameters */
    this.params.forEach(param => {
      if (!paramNames.includes(param.name)) {
        throw new Error(`Cannot find parameter '${param.name}'`);
      };
    });

    const processedParams = paramNames.map(paramName => {
      const findParam = this.params.find(({ name }) => name === paramName);

      const test = [...paramName];

      if (!findParam) {
        throw new Error(`No value set for parametr '${paramName}'`);
      };

      return findParam.value;
    });

    const statement = await this.attachment.prepare(this.transaction, processedSQL.join(''));
    try {
      if (statement.hasResultSet) {
        const resultSet = await statement.executeQuery(this.transaction, processedParams);
        try {
          return await resultSet.fetchAsObject();
        } finally {
          await resultSet.close();
        }
      } else {
        return await statement.executeSingletonAsObject(this.transaction, processedParams);
      };
    } finally {
      await statement.dispose();
    }
  };

  clear() {
    this.SQLtext = '';
    this.params = [];
  };
};
