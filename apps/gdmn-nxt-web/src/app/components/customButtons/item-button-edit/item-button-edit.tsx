import EditIcon from '@mui/icons-material/Edit';
import { IconButton, IconButtonProps, Stack, Tooltip } from '@mui/material';
import { useMemo } from 'react';
import { styled } from '@mui/material/styles';

export interface ItemButtonEditProps extends IconButtonProps {
  label?: string,
  hint?: string,
  button?: boolean
}

export function ItemButtonEdit({
  label = '',
  hint = 'Редактировать',
  disabled,
  button = false,
  color,
  onClick,
  ...rest
}: Readonly<ItemButtonEditProps>) {
  const Container = useMemo(() =>
    button
      ? styled(IconButton)(({ theme }) => ({
        color: color ?? theme.palette.primary.main,
        ...rest,
      }))
      : styled('div')(({ theme }) => ({
        color: color ?? theme.palette.primary.main,
      }))
  , [button]);

  return (
    <Container
      disabled={disabled}
      size="small"
      className="StyledEditButton"
      onClick={onClick as any}
    >
      <Tooltip title={(label || disabled) ? '' : hint} arrow>
        <span>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <EditIcon fontSize="small" />
            {label && <span>{label}</span>}
          </Stack>
        </span>
      </Tooltip>
    </Container>
  );
}

export default ItemButtonEdit;
