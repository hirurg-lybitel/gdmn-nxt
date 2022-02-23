import TreeItem, { TreeItemProps } from '@mui/lab/TreeItem/TreeItem';
import treeItemClasses from '@mui/lab/TreeItem/treeItemClasses';
import TreeView from '@mui/lab/TreeView/TreeView';
import { alpha, styled } from '@mui/material/styles';
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

export const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  '& .MuiTreeItem-label': {
    fontSize: 14,
    fontWeight: 400,
    fontFamily: 'inherit'
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
    color: theme.palette.grey['600'],
    fontSize: 14,
    width: 12,
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 13,
    paddingLeft: 4,
    borderLeft: `1px dotted ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

