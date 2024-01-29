import { Card } from '@mui/material';
import './customized-card.module.less';
import { styled, Theme } from '@mui/material/styles';
import { ColorMode } from '@gsbelarus/util-api-types';

interface ICustomizedCardProps {
  theme?: Theme
  borders?: boolean;
  boxShadows?: boolean;
  direction?: 'row' | 'column';
};

const CustomizedCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'borders' && prop !== 'boxShadows'
})<ICustomizedCardProps>(({ theme, borders = theme.palette.mode === ColorMode.Light, boxShadows = false, direction = 'column' }) => ({
  ...(borders ? { border: `1px solid ${theme.mainContent.borderColor }` } : {}),
  ...(boxShadows ? { boxShadow: `${(theme.shadows as Array<any>)[1]}` } : { boxShadow: 'none' }),
  display: 'flex',
  flexDirection: direction,
  '.MuiCardHeader-root': {
    paddingTop: '10px',
    paddingBottom: '10px',
    height: '50px',
    justifyContent: 'space-between',
  },
  '.MuiCardContent-root': {
    flex: 1
  },
  '.card-toolbar': {
    padding: '12px 24px 12px 24px'
  },
  '.MuiCardHeader-content': {
    flex: 0,
    textWrap: 'nowrap',
  },
  '.MuiCardHeader-action': {
    flex: 'auto',
  },

}));

export default CustomizedCard;
