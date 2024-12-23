import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import styles from './content-container.module.less';

/* eslint-disable-next-line */
export interface ContentContainerProps {}

const ContentContainer = styled(Box)(() => ({
  display: 'flex',
  width: '100%',
  marginLeft: 'auto',
  marginRight: 'auto',
  boxSizing: 'border-box',
  padding: '0',
  maxWidth: '1200px'
}));

export default ContentContainer;
