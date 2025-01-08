import { IconButton, IconButtonProps, Stack, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useMemo } from 'react';
import { styled } from '@mui/material/styles';

interface IItemButtonVisibleProps extends IconButtonProps {
  selected: boolean,
  onClick: () => void,
  activeTitle?: string
  disabledTitle?: string,
  label?: string,
  hint?: string,
  button?: boolean
}

export default function ItemButtonVisible({
  onClick,
  selected,
  activeTitle,
  disabledTitle,
  disabled,
  label = '',
  hint,
  button,
  color,
  ...rest
}: Readonly<IItemButtonVisibleProps>) {
  const Container = useMemo(() =>
    button
      ? styled(IconButton)(({ theme }) => ({
        color: color ?? (!selected ? 'gray' : theme.palette.primary.main),
        ...rest,
      }))
      : styled('div')(({ theme }) => ({
        color: color ?? (!selected ? 'gray' : theme.palette.primary.main),
      }))
  , [button, selected]);

  const defaultTitle = selected ? (disabledTitle ?? 'Отключить') : (activeTitle ?? 'Включить');

  return (
    <Container
      disabled={disabled}
      size="small"
      className="StyledVisibleButton"
      onClick={onClick as any}
    >
      <Tooltip title={(label || disabled) ? '' : (hint ?? defaultTitle)}>
        <span>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            {selected ? <VisibilityIcon/> : <VisibilityOffOutlinedIcon fontSize="small" />}
            {label && <span>{label}</span>}
          </Stack>
        </span>
      </Tooltip>
    </Container>
  );
}
