import { styled } from '@mui/material';

const CardToolbar = styled('div', {
  name: 'CardToolbar',
  shouldForwardProp: prop => prop !== 'direction'
})<{
  direction?: 'row' | 'column'
}>(({
  direction = 'row'
}) => ({
  display: 'flex',
  flexDirection: direction,
  padding: '20px 20px',
  gap: '8px',
  className: 'card-toolbar'
}));

export default CardToolbar;
