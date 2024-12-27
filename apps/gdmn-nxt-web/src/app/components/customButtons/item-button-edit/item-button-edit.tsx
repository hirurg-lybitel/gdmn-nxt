import EditIcon from '@mui/icons-material/Edit';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

export interface ItemButtonEditProps extends IconButtonProps {}

export function ItemButtonEdit(props: ItemButtonEditProps) {
  return (
    <IconButton size="small" {...props}>
      <Tooltip title="Редактировать" arrow>
        <EditIcon fontSize="small" />
      </Tooltip>
    </IconButton>
  );
}

export default ItemButtonEdit;
