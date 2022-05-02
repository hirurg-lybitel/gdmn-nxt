import TreeItem from '@mui/lab/TreeItem/TreeItem';
import treeItemClasses from '@mui/lab/TreeItem/treeItemClasses';
import TreeView from '@mui/lab/TreeView/TreeView';
import { alpha, styled } from '@mui/material/styles';
import { gdmnTheme } from '../../theme/gdmn-theme';
import './styled-tree-view.module.less';

export const StyledTreeView = styled(TreeView)(({ theme }) => ({
  color:
    theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.85)',
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  WebkitFontSmoothing: 'auto',
  letterSpacing: 'normal',
}));

export const StyledTreeItem = styled(TreeItem)({
  [`& .${treeItemClasses.selected}`]: {
    fontSize: gdmnTheme.typography.largeUI.fontSize,
    backgroundColor: gdmnTheme.palette.primary.main
  },
  [`& .${treeItemClasses.content}`]: {
    fontSize: gdmnTheme.typography.largeUI.fontSize,
    fontFamily: 'inherit',
    whiteSpace: 'nowrap'
  },
  [`& .${treeItemClasses.label}`]: {
    fontSize: gdmnTheme.typography.largeUI.fontSize,
    fontFamily: 'inherit',
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
    color: gdmnTheme.palette.grey['600'],
    width: 12,
    fontSize: gdmnTheme.typography.largeUI.fontSize,
    fontFamily: 'inherit'
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 13,
    paddingLeft: 4,
    borderLeft: `1px dotted ${alpha(gdmnTheme.palette.text.primary, 0.4)}`,
  },
});

