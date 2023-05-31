import styles from './customized-scroll-box.module.less';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { styled } from '@mui/styles';

export interface CustomizedScrollBoxProps {
  // children: ReactNode;
}

const CustomizedScrollBox = styled(PerfectScrollbar)({});

export default CustomizedScrollBox;
