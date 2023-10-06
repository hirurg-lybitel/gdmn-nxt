import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export interface ItemButtonDeleteProps extends IconButtonProps {}

export function ItemButtonDelete(props: ItemButtonDeleteProps) {
  return (
    <IconButton {...props}>
      <Tooltip title="Удалить" arrow>
        <DeleteForeverIcon fontSize="small" />
      </Tooltip>
    </IconButton>
  );
}

export default ItemButtonDelete;
