import { Tab, TabProps } from '@mui/material';
import styles from './link-tab.module.less';
import { Link, useNavigate } from 'react-router-dom';
import { ForwardedRef, forwardRef, MouseEventHandler, useMemo } from 'react';

export interface LinkTabProps extends TabProps {
  href?: string;
  selected?: boolean;
}

export function LinkTab({
  href = '',
  label,
  ...props
}: Readonly<LinkTabProps>) {
  const navigate = useNavigate();

  return (
    <Tab
      onClick={(e) => {
        navigate(href);
        props.onClick?.(e);
      }}
      aria-current={props.selected && 'page'}
      label={label}
      {...props}
    />
  );
}

export default LinkTab;
