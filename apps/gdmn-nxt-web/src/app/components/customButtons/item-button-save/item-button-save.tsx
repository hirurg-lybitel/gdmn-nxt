import { IconButton, IconButtonProps, Stack, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useMemo } from 'react';
import { styled } from '@mui/material/styles';

interface IItemButtonSaveProps extends IconButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement & HTMLDivElement, MouseEvent>) => void,
  label?: string,
  hint?: string,
  button?: boolean
}

export default function ItemButtonSave({
  label = '',
  hint = 'Редактировать',
  disabled,
  button = false,
  color,
  onClick,
  style,
  ...rest
}: Readonly<IItemButtonSaveProps>) {
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
            <SaveIcon fontSize="small" />
            {label && <span>{label}</span>}
          </Stack>
        </span>
      </Tooltip>
    </Container>
  );
}
