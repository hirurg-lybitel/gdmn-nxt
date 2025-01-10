import { IconButton, IconButtonProps, Stack, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useMemo } from 'react';
import { styled } from '@mui/material/styles';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

interface IItemButtonPowerProps extends IconButtonProps {
  selected: boolean,
  onClick: (e: React.MouseEvent<HTMLButtonElement & HTMLDivElement, MouseEvent>) => void,
  activeTitle?: string
  disabledTitle?: string,
  label?: string,
  hint?: string,
  button?: boolean
}

export default function ItemButtonPower({
  onClick,
  selected,
  activeTitle,
  disabledTitle,
  disabled,
  label = '',
  hint,
  button,
  color,
  style,
  ...rest
}: Readonly<IItemButtonPowerProps>) {
  const Container = useMemo(() =>
    button
      ? styled(IconButton)(({ theme }) => ({
        color: color ?? theme.palette.primary.main,
        ...rest,
      }))
      : styled('div')(({ theme }) => ({
        color: color ?? theme.palette.primary.main,
      }))
  , [button, selected]);

  const defaultTitle = selected ? (disabledTitle ?? 'Отключить') : (activeTitle ?? 'Включить');

  return (
    <Container
      disabled={disabled}
      size="small"
      className="StyledPowerButton"
      onClick={onClick}
      style={style}
    >
      <Tooltip title={(label || disabled) ? '' : (hint ?? defaultTitle)} arrow>
        <span>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <PowerSettingsNewIcon fontSize="small"/>
            {label && <span>{label}</span>}
          </Stack>
        </span>
      </Tooltip>
    </Container>
  );
}
