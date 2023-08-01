import styles from './customized-scroll-box.module.less';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { ReactNode, useEffect, useRef, useState } from 'react';
import PerfectScrollbar, { ScrollBarProps } from 'react-perfect-scrollbar';
import { useTheme } from '@mui/material';

interface IScrollBlurs {
  top: boolean;
  bottom: boolean;
}
export interface CustomizedScrollBoxProps extends ScrollBarProps {
  children: ReactNode;
  withBlur?: boolean;
  backgroundColor?: string;
}

const CustomizedScrollBox = (props: CustomizedScrollBoxProps) => {
  const { children, withBlur = false, backgroundColor = 'rgba(0, 0, 0, 0)', ...style } = props;

  const theme = useTheme();
  const containerRef = useRef<HTMLElement | null>(null);
  const [showScrollBlurs, setShowScrollBlurs] = useState<IScrollBlurs>({ top: false, bottom: false });

  const handleScroll = () => {
    if (!withBlur) return;
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;

    const showTop = scrollTop > 0;
    const showBottom = clientHeight + scrollTop < scrollHeight ;

    setShowScrollBlurs({ top: showTop, bottom: showBottom });
  };

  useEffect(() => {
    handleScroll();
  }, []);

  return (
    <div
      aria-label="CustomizedScrollBox"
      className={styles.container}
    >
      <div
        aria-label="scroller-top"
        className={styles.scrollerTop}
        style={{
          /** There is no way to pass system color to less file */
          background: `linear-gradient(to bottom,${backgroundColor} 0% 20%, rgba(0,0,0,0) 100%)`
        }}
        hidden={!showScrollBlurs.top}
      />
      <div
        className={styles.scrollBox}
      >
        <PerfectScrollbar
          {...style}
          containerRef={(ref) => containerRef.current = ref}
          onScrollY={handleScroll}
        >
          {children}
        </PerfectScrollbar>
      </div>
      <div
        aria-label="scroller-bottom"
        className={styles.scrollerBottom}
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, ${backgroundColor} 70% 100%)`
        }}
        hidden={!showScrollBlurs.bottom}
      />
    </div>
  );
};


export default CustomizedScrollBox;
