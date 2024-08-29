import { styled } from '@mui/material';

export const GroupHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '-10px',
  padding: '4px 10px',
  backgroundColor: 'var(--color-card-bg)',
  zIndex: 1
}));

export const GroupItems = styled('ul')({
  padding: 0,
});
