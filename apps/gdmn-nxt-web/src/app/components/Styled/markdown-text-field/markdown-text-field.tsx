import { TabContext, TabList } from '@mui/lab';
import { Box, Chip, Tab, TextField, TextFieldProps, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { CSSProperties, useState, ReactNode, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import InfoIcon from '@mui/icons-material/Info';
import DropzoneBase, { DropzoneProps as DropzoneBaseProps, ErrorCode } from 'react-dropzone';
import { FileObject } from '@gdmn-nxt/components/dropzone/types';
import { convertBytesToMbsOrKbs, readFile } from '@gdmn-nxt/components/dropzone/helpers';
import styles from './mardown-text-filed.module.less';
import { useSnackbar } from '@gdmn-nxt/helpers/hooks/useSnackbar';

type IMarkdownTextfieldProps = TextFieldProps & {
  containerStyle?: CSSProperties;
  fullHeight?: boolean;
  smallHintBreakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'laptop' | 'ultraWide';
  fileUpload?: boolean;
  onLoadFiles?: (value: File[]) => void;
  maxFileSize?: number;
  filesLimit?: number;
  maxTotalFilesSize?: number;
};

export default function MarkdownTextfield(props: IMarkdownTextfieldProps) {
  const { containerStyle, fullHeight = false, smallHintBreakpoint = 'md', fileUpload = false, onLoadFiles, maxFileSize, filesLimit, maxTotalFilesSize, ...rest } = props;
  const [tab, setTab] = useState('1');

  const theme = useTheme();
  const matchDown = useMediaQuery(theme.breakpoints.down(smallHintBreakpoint));

  const textField = (
    <TextField
      {...rest}
      sx={{
        opacity: tab === '2' ? 0 : 1,
        visibility: tab === '2' ? 'hidden' : 'visible',
        height: fullHeight ? '100%' : undefined,
        '& .MuiInputBase-root': {
          height: fullHeight ? '100%' : undefined
        },
        '& .MuiInputBase-input': {
          height: fullHeight ? '100% !important' : undefined
        },
        ...rest.sx
      }}
      multiline
      fullWidth
    />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: fullHeight ? '100%' : undefined, gap: rest.label ? '10px' : 0, ...containerStyle }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TabContext value={tab}>
          <TabList
            style={{ paddingLeft: '8px' }}
            onChange={(e, value) => setTab(value)}
          >
            <Tab
              label="Изменение"
              value="1"
            />
            <Tab
              label="Просмотр"
              value="2"
            />
          </TabList>
        </TabContext>
        <Tooltip title={matchDown ? 'Поддерживаются стили Markdown' : ''}>
          <a
            href="https://www.markdownguide.org/basic-syntax/"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Chip
              icon={<InfoIcon />}
              label={matchDown ? '' : 'Поддерживаются стили Markdown'}
              variant="outlined"
              sx={{ border: 'none', cursor: 'pointer', width: matchDown ? '20px' : undefined }}
            />
          </a>
        </Tooltip>
      </div>
      <div style={{ width: '100%', position: 'relative', flex: fullHeight ? 1 : undefined }}>
        {fileUpload ? <Container
          onChange={onLoadFiles}
          fullHeight={fullHeight}
          maxFileSize={maxFileSize}
          filesLimit={filesLimit}
          maxTotalFilesSize={maxTotalFilesSize}
        >
          {textField}
        </Container>
          : textField}
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)', position: 'absolute',
            inset: 0, opacity: tab === '2' ? '1' : '0',
            visibility: tab === '2' ? 'visible' : 'hidden',
            padding: '8.5px 14px', lineHeight: 1.3, wordWrap: 'break-word',
            borderRadius: 'var(--border-radius)', border: '1px solid var(--color-borders)',
            '& > :first-of-type': {
              marginTop: 0
            },
            '& > :last-of-type': {
              marginBottom: 0
            }
          }}
        >
          <ReactMarkdown>
            {rest.value?.toString() ?? ''}
          </ReactMarkdown>
        </Box>
      </div>
    </div >
  );
}

interface IContainerProps {
  children: ReactNode;
  fullHeight: boolean;
  onChange?: (value: File[]) => void;
  maxFileSize?: number;
  filesLimit?: number;
  maxTotalFilesSize?: number;
}

const Container = ({ children, fullHeight, onChange, maxFileSize, filesLimit, maxTotalFilesSize }: IContainerProps) => {
  const [fileObjects, setFileObjects] = useState<FileObject[]>([]);

  useEffect(() => {
    onChange && onChange(fileObjects.map(({ file }) => file));
    setFileObjects([]);
  }, [JSON.stringify(fileObjects), onChange]);

  const handleDropAccepted: DropzoneBaseProps['onDropAccepted'] = async (
    files,
    evt
  ) => {
    if (filesLimit && (files.length + fileObjects.length) > filesLimit) {
      addSnackbar(`Превышено максимально допустимое количество файлов.\nРазрешено только ${filesLimit}`, { variant: 'error' });
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
  };

  const { addSnackbar } = useSnackbar();

  const handleDropRejected: DropzoneBaseProps['onDropRejected'] = async (
    rejectedFiles,
    evt
  ) => {
    rejectedFiles.forEach(({ file: { name: fileName }, errors }) => {
      const message = errors.reduce((msg, { code }) => {
        switch (code) {
          case ErrorCode.FileTooLarge:
            return msg + `\nРазмер файла превышает ${convertBytesToMbsOrKbs(maxFileSize ?? 0)}.`;
          case ErrorCode.TooManyFiles:
            return msg + `\nПревышено максимально допустимое количество файлов.\nРазрешено только ${filesLimit}.`;
          default:
            return msg + '';
        }
      }, `Файл ${fileName} отклонён.`);

      addSnackbar(message, { variant: 'error' });
    });
  };

  return (
    <DropzoneBase
      onDropAccepted={handleDropAccepted}
      onDropRejected={handleDropRejected}
      maxSize={maxFileSize}
      maxFiles={filesLimit}
    >
      {({ getRootProps, getInputProps, isDragActive, isDragReject }) => {
        const isActive = isDragActive;

        return (
          <Box
            className={`${isActive ? styles.active : ''}`}
            {...getRootProps()}
            onClick={undefined}
            style={{
              height: fullHeight ? '100%' : undefined
            }}
          >
            <input {...getInputProps()} />
            {children}
          </Box>
        );
      }}
    </DropzoneBase>
  );
};
