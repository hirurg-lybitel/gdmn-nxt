import AddCircleIcon from '@mui/icons-material/AddCircle';
import { IconButton, Tooltip } from '@mui/material';

interface Props {
  disabled?: boolean;
  onClick?: () => void;
  label?: string

}

export default function CustomAddButton({
  label = '',
  disabled = false,
  onClick = () => {}
}: Props) {
  return (
    <IconButton
      size="small"
      disabled={disabled}
      onClick={onClick}
    >
      <Tooltip arrow title={label}>
        <AddCircleIcon color={disabled ? 'disabled' : 'primary'} />
      </Tooltip>
    </IconButton>
  );
}
