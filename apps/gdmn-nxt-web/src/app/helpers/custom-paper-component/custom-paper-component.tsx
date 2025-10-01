/* eslint-disable react/display-name */

import { Paper } from '@mui/material';
import { GridFooter } from '@mui/x-data-grid-pro';
import { HTMLAttributes, ReactElement } from 'react';
import styles from './custom-paper-component.module.less';

interface CustomPaperComponentProps {
  header?: ReactElement;
  footer?: ReactElement;
}

const CustomPaperComponent = ({ header, footer }: CustomPaperComponentProps) => (props: HTMLAttributes<HTMLElement>) => {
  const { children, ...rest } = props;

  return (
    <Paper
      elevation={0}
      {...rest}
      onMouseDown={(event) => {
        // Prevent blur for footer
        event.preventDefault();
      }}

    >
      {header && <div>{header}</div>}
      {children}
      {footer && <div className={styles.footer}>{footer}</div>}
    </Paper>
  );
};

export default CustomPaperComponent;
