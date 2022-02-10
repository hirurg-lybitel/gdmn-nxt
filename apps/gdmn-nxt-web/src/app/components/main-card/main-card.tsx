import { Card } from '@mui/material';
import { styled } from '@mui/system';
import './main-card.module.less';

/* eslint-disable-next-line */
export interface MainCardProps {}

interface IMainCardProps {
  border?: boolean;
  boxShadow?: boolean ;

}

const MainCard = styled(Card)<IMainCardProps>(({theme, border, boxShadow}) => ({
  ...(border && { border: '1px solid #E0E3E7' }),
  ...(boxShadow && { boxShadow:  `${(theme.shadows as Array<any>)[1]}` })


}))

export default MainCard;
