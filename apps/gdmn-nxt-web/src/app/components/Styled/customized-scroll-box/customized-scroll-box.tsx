import styles from './customized-scroll-box.module.less';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { ReactNode } from 'react';
import PerfectScrollbar, { ScrollBarProps } from 'react-perfect-scrollbar';

export interface CustomizedScrollBoxProps extends ScrollBarProps {
  children: ReactNode;
}

const CustomizedScrollBox = (props: CustomizedScrollBoxProps) => {
  const { children, ...style} = props;
  return (
    <div
      aria-label="CustomizedScrollBox"
      className={styles.container}
    >
      <div
        className={styles.scrollBox}
      >
        <PerfectScrollbar {...style}>
          {children}
        </PerfectScrollbar>
      </div>
    </div>
  );
};


export default CustomizedScrollBox;
