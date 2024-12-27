import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

interface IItemButtonSaveProps extends IconButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  title?: string,
}

export default function ItemButtonSave({ onClick, title, ...rest }: IItemButtonSaveProps) {
  return (
    <Tooltip title={title || 'Сохранить'}>
      <IconButton
        {...rest}
        color="primary"
        size="small"
        onClick={onClick}
      >
        <SaveIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
