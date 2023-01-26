import { Card } from '@mui/material';
import { styled } from '@mui/system';
import './customized-card.module.less';

interface ICustomizedCardProps {
  borders?: boolean;
  boxShadows?: boolean;
};

const CustomizedCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'borders' && prop !== 'boxShadows'
})<ICustomizedCardProps>(({ theme, borders = false, boxShadows = false }) => ({
  ...(borders ? { border: theme.palette.mode === 'dark' ? '1px solid #212121' : '1px solid #E0E3E7' } : {}),
  ...(boxShadows ? { boxShadow: `${(theme.shadows as Array<any>)[1]}` } : {})
}));

export default CustomizedCard;
