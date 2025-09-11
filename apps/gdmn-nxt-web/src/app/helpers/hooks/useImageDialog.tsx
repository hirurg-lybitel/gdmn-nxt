import { Dialog, IconButton, Theme, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosOutlinedIcon from '@mui/icons-material/ArrowBackIosOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  arrow: {
    '&:hover': {
      color: 'white !important'
    },
    cursor: 'pointer',
    position: 'absolute', top: 0, height: '100%',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '0px 20px', color: '#afafaf',
  }
}));

export function useImageDialog() {
  const [open, setOpen] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const image = useMemo(() => images[currentIndex], [currentIndex, images]);

  const [imageSize, setImageSize] = useState<number[]>();

  const classes = useStyles();

  const openImage = useCallback((image: string) => {
    setImages([image]);
    setCurrentIndex(0);
    setOpen(true);
  }, []);

  const openMany = useCallback((images: string[], currentIndex: number) => {
    setImages(images);
    setCurrentIndex(currentIndex);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const getImageSize = (image: string) => {
    const img = new Image();
    img.src = image;

    return img.onload = () => {
      const indent = matchDownSm ? 30 : 100;
      const screenWidth = window.innerWidth - (indent * 2);
      const screenHeight = window.innerHeight - (50 * 2);

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const screenRatio = screenWidth / screenHeight;

      if (imgRatio > screenRatio) {
        return [screenWidth / imgRatio, screenWidth];
      } else {
        return [screenHeight, screenHeight * imgRatio];
      }
    };
  };

  useEffect(() => {
    const setSize = () => {
      if (image) {
        setImageSize(getImageSize(image));
      }
    };
    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, [image]);

  useEffect(() => {
    if (image) {
      setImageSize(getImageSize(image));
    }
  }, [image]);

  const clickPrev = useCallback(() => {
    if (currentIndex === 0) return;
    setCurrentIndex(currentIndex - 1);
    setImageSize(getImageSize(images[currentIndex - 1]));
  }, [currentIndex, images]);

  const clickNext = useCallback(() => {
    if (currentIndex === images.length - 1) return;
    setCurrentIndex(currentIndex + 1);
    setImageSize(getImageSize(images[currentIndex + 1]));
  }, [currentIndex, images]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        clickNext();
      }
      if (event.key === 'ArrowLeft') {
        clickPrev();
      }
    };

    window.addEventListener('keydown', keyDown);
    return () => window.removeEventListener('keydown', keyDown);
  }, [clickNext, clickPrev]);

  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const imageDialog = useMemo(() => {
    return (
      <Dialog
        sx={{
          '& .MuiPaper-root': {
            overflow: 'visible',
            height: 'fit-content',
            maxWidth: 'none',
            background: 'none',
            position: 'static',
            boxShadow: 'none'
          }
        }}
        open={open}
        onClose={handleClose}
      >
        <div
          style={{
            left: 0,
            position: matchDownSm ? 'absolute' : undefined,
            visibility: currentIndex === 0 ? 'hidden' : undefined,
            width: matchDownSm ? '30%' : undefined,
            zIndex: 1300
          }}
          className={classes.arrow}
          onClick={clickPrev}
        >
          <div style={{ display: 'flex', padding: '6px', background: 'rgb(0 0 0 / 50%)', borderRadius: '100%' }}>
            <ArrowBackIosOutlinedIcon fontSize="medium" />
          </div>
        </div>
        <div
          style={{
            right: 0,
            position: matchDownSm ? 'absolute' : undefined,
            visibility: currentIndex === images.length - 1 ? 'hidden' : undefined,
            width: matchDownSm ? '30%' : undefined,
            zIndex: 1300
          }}
          className={classes.arrow}
          onClick={clickNext}
        >
          <div style={{ display: 'flex', padding: '6px', background: 'rgb(0 0 0 / 50%)', borderRadius: '100%' }}>
            <ArrowForwardIosOutlinedIcon fontSize="medium" />
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-32px', right: '-32px' }}>
            <IconButton onClick={handleClose}>
              <CloseIcon fontSize="medium" />
            </IconButton>
          </div>
          <img
            style={{
              borderRadius: 'var(--border-radius)',
              maxHeight: '100%', objectFit: 'contain', width: '100%'
            }}
            src={image}
            height={imageSize?.[0]}
            width={imageSize?.[1]}
            alt={'image'}
          />
        </div>

      </Dialog>
    );
  }, [classes.arrow, handleClose, image, imageSize, open]);

  return { imageDialog, openImage, openMany };
}
