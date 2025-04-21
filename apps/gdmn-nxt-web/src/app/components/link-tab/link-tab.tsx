import { Tab, TabProps } from '@mui/material';
import styles from './link-tab.module.less';
import { Link } from 'react-router-dom';
import { ForwardedRef, forwardRef, useMemo } from 'react';

export interface LinkTabProps extends TabProps {
  href?: string;
  selected?: boolean;
}

export function LinkTab({
  href = '',
  label,
  ...props
}: Readonly<LinkTabProps>) {
  const detailsComponent = useMemo(() => {
    // eslint-disable-next-line react/display-name
    return forwardRef((props, ref: ForwardedRef<any>) => (
      <Link
        ref={ref}
        {...props}
        to={href}
        target="_self"
      />
    ));
  }, [href]);

  return (
    <Tab
      {...detailsComponent}
      aria-current={props.selected && 'page'}
      label={label}
      {...props}
    />
  );
}

export default LinkTab;
