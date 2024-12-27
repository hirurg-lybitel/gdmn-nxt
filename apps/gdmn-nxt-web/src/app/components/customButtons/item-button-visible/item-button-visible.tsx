import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

interface IItemButtonVisibleProps extends IconButtonProps {
  selected: boolean,
  onClick: () => void,
  activeTitle?: string
  disabledTitle?: string
}

export default function ItemButtonVisible({ onClick, selected, activeTitle, disabledTitle, ...rest }: IItemButtonVisibleProps) {
  return (
    <Tooltip title={selected ? (disabledTitle || 'Отключить') : (activeTitle || 'Включить')}>
      <IconButton
        {...rest}
        color={'primary'}
        style={!selected ? { color: 'gray' } : {}}
        size="small"
        onClick={onClick}
      >
        {selected ? <VisibilityIcon/> : <VisibilityOffOutlinedIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
