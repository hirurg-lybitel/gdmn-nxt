import { isImage } from '../helpers';
import { FileObject } from '../types';
import styles from './preview.module.less';
import { Box, Fab, Tooltip } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { MouseEvent } from 'react';

const getPreviewIcon = (
  fileObject: FileObject
): JSX.Element => {
  const { data, file } = fileObject || {};
  if (isImage(file)) {
    const src = typeof data === 'string' ? data : undefined;

    return (
      <img
        role="presentation"
        alt="file"
        src={src}
      />);
  }

  return (
    <Box
      sx={{
        height: 100,
        minWidth: 100,
        maxWidth: '100%',
        padding: '12px 0',
        transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        boxSizing: 'border-box',
        boxShadow: 'rgba(0, 0, 0, 0.12) 0 1px 6px, rgba(0, 0, 0, 0.12) 0 1px 4px',
        borderRadius: 'var(--border-radius)',
        backgroundColor: 'var(--color-card-bg)',
      }}
    >
      <AttachFileIcon
        sx={{
          height: '100%',
          width: 'initial',
          color: 'text.primary',
        }}
      />
    </Box>
  );
};

interface PreviewListProps {
  files?: FileObject[]
  onRemove?: (index: number) => void;
};

export function PreviewList({
  files,
  onRemove
}: PreviewListProps) {
  const handleRemove = (index: number) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove && onRemove(index);
  };

  const handleDownload = (file: File) => URL.createObjectURL(file);

  return (
    <Box
      aria-label="dropzone-preview"
      className={styles['container']}
    >
      {files?.map((file, idx) => (
        <Tooltip key={idx} title={file.file.name}>
          <Box
            className={styles['imageContainer']}
            component="a"
            href={handleDownload(file.file)}
            download={file.file.name}
            onClick={(e) => e.stopPropagation()}
          >
            {getPreviewIcon(file)}
            <Fab
              aria-label="Delete"
              size="small"
              className={styles['removeButton']}
              onClick={handleRemove(idx)}
            >
              <DeleteIcon />
            </Fab>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
};
