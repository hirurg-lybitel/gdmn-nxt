import { colors } from '@mui/material';

export interface styledTheme {
  color: typeof colors,
  drawerWidth: number,
  headColor?: string,
  textColor?: string,
  captionTextColor?: string;
  fontFamily?: string;
  menu?: {
    backgroundColor?: string,
    color?: string;
  }
  mainContent: {
    backgroundColor?: string,
    width?: string,
    minHeight?: string,
    flexGrow?: number,
    padding?: string,
    marginTop?: string,
    marginRight?: string,
    borderRadius?: string,
    borderColor?: string,
    buttonTextColor?: string
  };
}
