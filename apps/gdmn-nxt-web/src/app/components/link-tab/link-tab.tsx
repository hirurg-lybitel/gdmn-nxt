import { Tab, TabProps } from '@mui/material';
import styles from './link-tab.module.less';
import { Link } from 'react-router-dom';
import { ForwardedRef, forwardRef } from 'react';

export interface LinkTabProps extends TabProps {
  href?: string;
  selected?: boolean;
}

export function LinkTab({
  href = '',
  label,
  selected,
  ...props
}: LinkTabProps) {
  const MyLink = <Link to={href ?? ''} />;

  const detailsComponent = {
    // eslint-disable-next-line react/display-name
    component: forwardRef((props, ref: ForwardedRef<any>) => (
      <Link
        ref={ref}
        {...props}
        to={href}
        target="_self"
      />
    ))
  };

  return (
    <Tab
      {...detailsComponent}
      aria-current={selected && 'page'}
      label={label}
      {...props}
    />
  );
}

export default LinkTab;
