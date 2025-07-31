import styles from './dropzone.module.less';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DropzoneBase, { DropzoneProps as DropzoneBaseProps, ErrorCode } from 'react-dropzone';
import { Box, Typography } from '@mui/material';
import { useEffect, useReducer, useState } from 'react';
import { FileObject } from './types';
import { convertBytesToMbsOrKbs, readFile } from './helpers';
import { useSnackbar } from '@gdmn-nxt/helpers/hooks/useSnackbar';
import { PreviewList } from './components/PreviewList';

const getFileAddedMessage = (fileName: string) =>
  `Файл ${fileName} успешно добавлен.`;

const getFileLimitExceedMessage = (filesLimit: number) =>
  `Превышено максимально допустимое количество файлов.\nРазрешено только ${filesLimit}`;

const getFileRemovedMessage = (fileName: string) =>
  `Файл ${fileName} удалён.`;

export interface DropzoneProps {
  disabled?: boolean;
  acceptedFiles?: string[];
  filesLimit?: number;
  showPreviews?: boolean;
  maxFileSize?: number;
  maxTotalFilesSize?: number;
  dropzoneText?: string;
  initialFiles?: File[];
  heightFitContent?: boolean,
  disableSnackBar?: boolean,
  onChange: (loadedFiles: File[]) => void,
}

export function Dropzone({
  acceptedFiles = [],
  disabled = false,
  filesLimit = 3,
  maxFileSize,
  showPreviews,
  initialFiles,
  dropzoneText = 'Перетащите файл сюда или нажмите',
  heightFitContent = false,
  disableSnackBar = false,
  maxTotalFilesSize,
  onChange
}: Readonly<DropzoneProps>) {
  const { addSnackbar } = useSnackbar();
  const [fileObjects, setFileObjects] = useState<FileObject[]>([]);
  const [initialized, toggleInitialized] = useReducer((v: boolean) => !v, false);

  useEffect(() => {
    if (initialized) return;
    if (disabled) return;

    if (!initialFiles) {
      setFileObjects([]);
      return;
    }

    const getFiles = async () => {
      const res = await Promise.all(
        initialFiles?.map(async (file) => {
          const data = await readFile(file);
          return {
            file,
            data,
          };
        })
      );
      toggleInitialized();
      setFileObjects(res);
    };

    getFiles();
  }, [initialFiles, disabled]);

  useEffect(() => {
    if (disabled) return;

    onChange(fileObjects.map(({ file }) => file));
  }, [onChange, fileObjects, disabled]);


  const acceptFiles = acceptedFiles.reduce((obj, item) => {
    obj[item] = [];
    return obj;
  }, {} as Record<string, string[]>);

  const isMultiple = filesLimit > 1;
  const previewsVisible = showPreviews && fileObjects.length > 0;

  const handleDropAccepted: DropzoneBaseProps['onDropAccepted'] = async (
    files,
    evt
  ) => {
    if ((files.length + fileObjects.length) > filesLimit) {
      addSnackbar(`${getFileLimitExceedMessage(filesLimit)}.`, { variant: 'error' });
      return;
    }

    let totalSize = 0;

    fileObjects.forEach(({ file }) => totalSize += file.size);

    const acceptedFileObjects = await Promise.all(
      files.map(async (file) => {
        const data = await readFile(file);
        totalSize += file.size;
        return {
          file,
          data,
        };
      })
    );

    if (maxTotalFilesSize && totalSize > maxTotalFilesSize) {
      addSnackbar(`Общий размер файлов превышает ${convertBytesToMbsOrKbs(maxTotalFilesSize ?? 0)}.`, { variant: 'error' });
      return;
    }

    setFileObjects(prev => [
      ...prev,
      ...acceptedFileObjects
    ]);

    !disableSnackBar && acceptedFileObjects.forEach(({ file }) => addSnackbar(getFileAddedMessage(file.name), { variant: 'success' }));
  };

  const handleDropRejected: DropzoneBaseProps['onDropRejected'] = async (
    rejectedFiles,
    evt
  ) => {
    rejectedFiles.forEach(({ file: { name: fileName }, errors }) => {
      const message = errors.reduce((msg, { code }) => {
        switch (code) {
          case ErrorCode.FileInvalidType:
            return msg + `\nТип файла должен быть ${acceptedFiles.join(', ')}.`;
          case ErrorCode.FileTooLarge:
            return msg + `\nРазмер файла превышает ${convertBytesToMbsOrKbs(maxFileSize ?? 0)}.`;
          case ErrorCode.TooManyFiles:
            return msg + `\n${getFileLimitExceedMessage(filesLimit)}.`;
          default:
            return msg + '';
        }
      }, `Файл ${fileName} отклонён.`);

      addSnackbar(message, { variant: 'error' });
    });
  };

  const handleRemove = (fileIndex: number) => {
    const removedFileObj = fileObjects[fileIndex];

    const newFileObjects = [...fileObjects];
    newFileObjects.splice(fileIndex, 1);

    setFileObjects(newFileObjects);

    !disableSnackBar && addSnackbar(getFileRemovedMessage(removedFileObj.file.name), { variant: 'info' });
  };

  return (
    <DropzoneBase
      accept={acceptFiles}
      onDropAccepted={handleDropAccepted}
      onDropRejected={handleDropRejected}
      multiple={isMultiple}
      maxSize={maxFileSize}
      maxFiles={filesLimit}
      disabled={disabled}
    >
      {({ getRootProps, getInputProps, isDragActive, isDragReject }) => {
        const isActive = isDragActive;
        const isInvalid = isDragReject;

        return (
          <Box
            className={`
                ${styles['container']}
                ${isActive ? styles['active'] : ''}
                ${isInvalid ? styles['invalid'] : ''}
                ${disabled ? styles['disabled'] : ''}
                `}
            {...getRootProps()}
            style={{
              minHeight: heightFitContent ? 'fit-content' : undefined,
              overflow: heightFitContent ? 'visible' : 'hidden'
            }}
          >
            <input {...getInputProps()} />
            <Box className={styles['textContainer']}>
              <Typography
                variant="h6"
                component="p"
                className={styles['text']}
              >
                {dropzoneText}
              </Typography>
              <CloudUploadIcon className={styles['icon']} />
            </Box>
            {previewsVisible
              ? (
                <PreviewList
                  files={fileObjects}
                  onRemove={handleRemove}
                />
              )
              : null}
          </Box>
        );
      }}
    </DropzoneBase>
  );
}

export default Dropzone;
