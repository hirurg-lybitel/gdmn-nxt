import { useEffect, useState } from 'react';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import { Fab } from '@mui/material';

export interface ScrollToTopProps {
  offset?: number;
}

export function ScrollToTop(props: ScrollToTopProps) {
  const { offset = 200 } = props;

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => {
    if (window.scrollY > offset) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    };
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <Fab
      size="small"
      color='info'
      style={{
        opacity: isVisible ? 1 : 0,
        position: 'fixed',
        zIndex: 1,
        bottom: '20px',
        right: '20px',
        cursor: 'pointer',
        transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      }}
      onClick={scrollToTop}
    >
      <VerticalAlignTopIcon />
    </Fab>
  );
}

export default ScrollToTop;
