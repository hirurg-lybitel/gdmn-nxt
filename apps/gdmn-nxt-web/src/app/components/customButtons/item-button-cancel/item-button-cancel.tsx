import { IconButton, IconButtonProps, Stack, Tooltip } from '@mui/material';
import CancelIcon from '@mui/icons-material/Close';
import { MouseEventHandler, useMemo } from 'react';
import { styled } from '@mui/material/styles';

interface IItemButtonCancelProps extends IconButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement & HTMLDivElement, MouseEvent>) => void,
  label?: string,
  hint?: string,
  button?: boolean
}

export default function ItemButtonCancel({
  label = '',
  hint = 'Редактировать',
  disabled,
  button = false,
  color,
  onClick,
  style,
  ...rest
}: Readonly<IItemButtonCancelProps>) {
  const Container = useMemo(() =>
    button
      ? styled(IconButton)(({ theme }) => ({
        color: color ?? (button ? theme.palette.primary.main : 'inherit'),
        ...rest
      }))
      : styled('div')(({ theme }) => ({
        color: color ?? (button ? theme.palette.primary.main : 'inherit'),
      }))
  , [button]);

  return (
    <Container
      disabled={disabled}
      size="small"
      className="StyledEditButton"
      onClick={onClick}
      style={style}
    >
      <Tooltip title={(label || disabled) ? '' : hint} arrow>
        <span>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <CancelIcon fontSize="small" />
            {label && <span>{label}</span>}
          </Stack>
        </span>
      </Tooltip>
    </Container>
  );
}
