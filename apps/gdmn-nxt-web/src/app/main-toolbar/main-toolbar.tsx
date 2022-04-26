import { gdmnTheme } from '../theme/gdmn-theme';
import styles from './main-toolbar.module.less';

/* eslint-disable-next-line */
export interface MainToolbarProps {}

export function MainToolbar(props: MainToolbarProps) {
  return (
    <div style={{
      width: '100%',
      backgroundColor: gdmnTheme.palette.grey['200'],
      paddingLeft: 8,
      paddingRight: 8,
      paddingBottom: 6,
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: gdmnTheme.palette.grey['400'],
    }}>
      <div style={{
        width: '100%',
        height: 74,
        backgroundColor: gdmnTheme.palette.grey['100'],
        borderColor: gdmnTheme.palette.grey['400'],
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 5,
      }}>
      </div>
    </div>
  );
};
