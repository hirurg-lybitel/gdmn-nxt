import { Card } from '@mui/material';
import { styled } from '@mui/system';
import './customized-card.module.less';
import { Theme } from '@mui/material/styles';

interface ICustomizedCardProps {
  theme?: Theme
  borders?: boolean;
  boxShadows?: boolean;
};

const CustomizedCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'borders' && prop !== 'boxShadows'
})<ICustomizedCardProps>(({ theme, borders = false, boxShadows = false }) => ({
  ...(borders ? { border: `1px solid ${theme.mainContent.borderColor }` } : {}),
  ...(boxShadows ? { boxShadow: `${(theme.shadows as Array<any>)[1]}` } : { boxShadow: 'none' })
}));

export default CustomizedCard;
