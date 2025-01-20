import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { Stack, Tooltip } from '@mui/material';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  disabled: boolean;
  hint?: string;
  onClick: () => void;
}

export function MenuItemDisable({
  label,
  disabled,
  hint = '',
  onClick,
  ...rest
}: Readonly<Props>) {
  return (
    <div className="menu-item-disable" {...rest}>
      <Tooltip title={hint} arrow>
        <span>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            onClick={onClick}
          >
            <PowerSettingsNewIcon color={disabled ? 'success' : 'error'} />
            <span>{label ?? (disabled ? 'Включить' : 'Отключить')}</span>
          </Stack>
        </span>
      </Tooltip>
    </div>
  );
}
