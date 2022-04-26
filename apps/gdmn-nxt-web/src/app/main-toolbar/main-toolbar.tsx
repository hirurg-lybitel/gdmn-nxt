import { styled } from '@mui/styles';
import { gdmnTheme } from '../theme/gdmn-theme';
import styles from './main-toolbar.module.less';

/* eslint-disable-next-line */
export interface MainToolbarProps {}

export function MainToolbar(props: MainToolbarProps) {
  const Toolbar = styled('div')({
    width: '100%',
    marginTop: 4,
    height: 72,
    backgroundColor: gdmnTheme.palette.grey['100'],
    borderColor: gdmnTheme.palette.grey['400'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 5,
  });
  return <Toolbar />;
};
