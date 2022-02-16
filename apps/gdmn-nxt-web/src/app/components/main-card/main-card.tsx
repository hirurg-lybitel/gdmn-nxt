import { Card } from '@mui/material';
import { styled } from '@mui/system';
import './main-card.module.less';

export const CardWithBorderShadow = styled(Card)(({ theme }) => ({
  border: '1px solid #E0E3E7',
  boxshadow: `${(theme.shadows as Array<any>)[1]}`
}));

export const CardWithBorder = styled(Card)(({ theme }) => ({
  border: '1px solid #E0E3E7',
  boxshadow: 'none'
}));

