import { isImage } from '../helpers';
import { FileObject } from '../types';
import styles from './preview.module.less';
import { Box, Fab } from '@mui/material';
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
    onRemove && onRemove(index);
  };

  const handleDownload = (file: FileObject) => (e: any) => {
    // Create a new link
    const anchor = document.createElement('a');
    anchor.href = file.data as string;
    anchor.download = file.file.name;

    // Append to the DOM
    document.body.appendChild(anchor);

    // Trigger `click` event
    anchor.click();

    // Remove element from DOM
    document.body.removeChild(anchor);
    e.stopPropagation();
  };

  return (
    <Box
      aria-label="dropzone-preview"
      className={styles['container']}
    >
      {files?.map((file, idx) => (
        <Box
          key={idx}
          className={styles['imageContainer']}
          onClick={handleDownload(file)}
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
      ))}
    </Box>
  );
};
