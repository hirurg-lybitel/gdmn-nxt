import { IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

interface IItemButtonVisibleProps {
  selected: boolean,
  onClick: () => void,
  title?: {
    active: string,
    disable: string
  }
  disabled?: boolean
}
export default function ItemButtonVisible({ onClick, selected, title, disabled }: IItemButtonVisibleProps) {
  return (
    <Tooltip title={selected ? (title?.disable || 'Отключить') : (title?.active || 'Включить')}>
      <IconButton
        color={'primary'}
        style={!selected ? { color: 'gray' } : {}}
        size="small"
        disabled={disabled}
        onClick={onClick}
      >
        {selected ? <VisibilityIcon/> : <VisibilityOffOutlinedIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
