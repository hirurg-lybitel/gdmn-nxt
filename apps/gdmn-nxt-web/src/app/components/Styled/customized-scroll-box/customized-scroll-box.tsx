import styles from './customized-scroll-box.module.less';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PerfectScrollbar, { ScrollBarProps } from 'react-perfect-scrollbar';
import { CSSProperties } from '@mui/styles';

interface IScrollBlurs {
  top: boolean;
  bottom: boolean;
}
export interface CustomizedScrollBoxProps extends ScrollBarProps {
  children: ReactNode;
  withBlur?: boolean;
  backgroundColor?: string;
  container?: {
    style?: CSSProperties;
    className?: string;
  },
  externalScrollLock?: boolean
}

const CustomizedScrollBox = (props: CustomizedScrollBoxProps) => {
  const {
    children,
    withBlur = false,
    backgroundColor = 'rgba(0, 0, 0, 0)',
    container,
    externalScrollLock = false,
    ...style
  } = props;

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

  const preventDefault = useCallback((e: Event) => {
    console.log(e);
    e.preventDefault();
  }, []);
  const wheelEvent = useCallback((mobile: boolean) => mobile ? 'touchmove' : 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel', []);

  const keys: { [key: string]: number } = { 'ArrowUp': 1, 'ArrowDown': 1 };
  const preventDefaultForScrollKeys = useCallback((e: KeyboardEvent) => {
    if (keys[e.key]) {
      preventDefault(e);
      return false;
    }
    return true;
  }, []);

  const onScrollStart = (mobile: boolean) => (e: any) => {
    if (!externalScrollLock) return;
    window.addEventListener(wheelEvent(mobile), preventDefault, { passive: false });
  };

  const onScrollEnd = (mobile: boolean) => () => {
    if (!externalScrollLock) return;
    window.removeEventListener(wheelEvent(mobile), preventDefault, false);
  };

  return (
    <div
      aria-label="CustomizedScrollBox"
      className={`${styles.container} ${container?.className}`}
      style={container?.style}
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
          onMouseEnter={onScrollStart(false)}
          onMouseLeave={onScrollEnd(false)}
          onTouchStart={onScrollStart(true)}
          onTouchEnd={onScrollEnd(true)}
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
