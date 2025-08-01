import { Dialog, IconButton } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';

export function useImageDialog() {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<string>();

  const openImage = useCallback((image: string) => {
    setImage(image);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const imageDialog = useMemo(() => {
    return (
      <Dialog
        sx={{
          '& .MuiPaper-root': {
            overflow: 'visible'
          }
        }}
        open={open}
        onClose={handleClose}
      >
        <div style={{ position: 'absolute', top: '-34px', right: '-34px' }}>
          <IconButton onClick={handleClose}>
            <CloseIcon fontSize="medium" />
          </IconButton>
        </div>
        <img
          style={{ borderRadius: 'var(--border-radius)', background: 'white' }}
          src={image}
          alt={'image'}
        />
      </Dialog>
    );
  }, [handleClose, image, open]);

  return { imageDialog, openImage };
}
