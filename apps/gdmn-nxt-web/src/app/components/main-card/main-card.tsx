import { Card } from '@mui/material';
import { styled } from '@mui/system';
import './main-card.module.less';

/* eslint-disable-next-line */
export interface MainCardProps {}

interface IMainCardProps {
  borders?: boolean;
  boxShadows?: boolean;
};

const MainCard = styled(Card)<IMainCardProps>(({theme, borders=false, boxShadows=false}) => ({
  ...(borders ? { border: '1px solid #E0E3E7' } : {}),
  ...(boxShadows ? { boxShadow: `${(theme.shadows as Array<any>)[1]}` } : {})
}));

export default MainCard;
