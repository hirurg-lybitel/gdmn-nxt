import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import CancelIcon from '@mui/icons-material/Close';

interface IItemButtonCancelProps extends IconButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  title?: string,
}

export default function ItemButtonCancel({ onClick, title, ...rest }: IItemButtonCancelProps) {
  return (
    <Tooltip title={title || 'Отменить'}>
      <IconButton
        {...rest}
        color="primary"
        size="small"
        onClick={onClick}
      >
        <CancelIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
