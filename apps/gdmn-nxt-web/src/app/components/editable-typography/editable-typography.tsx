import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, TextField, Tooltip, Typography, TypographyProps, styled } from '@mui/material';
import styles from './editable-typography.module.less';
import { ChangeEvent, KeyboardEvent, useState } from 'react';

export interface EditableTypographyProps extends TypographyProps {
  name?: string;
  value: string;
  editComponent?: React.ReactNode;
  deleteable?: boolean;
  onDelete?: () => void;
}

export const EditableTypography = styled(({
  value,
  name,
  onDelete,
  onChange,
  editComponent,
  deleteable = false,
  ...props
}: EditableTypographyProps) => {
  const [editText, setEditText] = useState(!value);

  const handleEdit = () => {
    setEditText(true);
  };

  const onClose = () => {
    setEditText(false);
  };

  const handleDelete = () => {
    onDelete && onDelete();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    e.key === 'Escape' && onClose();
  };

  return (
    <div
      aria-label="editable-typography"
      className={styles['container']}
      onKeyDown={onKeyDown}
    >
      {editText
        ? editComponent ??
          <TextField
            variant="standard"
            value={value}
            name={name}
            fullWidth
            onChange={onChange}
          />
        : <Typography
          {...props}
          className={styles['title']}
          autoFocus
        >
          {value}
        </Typography>
      }
      <div
        className={`${styles['actions']} ${editText ? styles['visible'] : styles['hidden']}`}
      >
        {editText
          ? <Tooltip arrow title="Закрыть окно редактирования">
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" color="primary" />
            </IconButton >
          </Tooltip>
          : <Tooltip arrow title="Редактировать">
            <IconButton size="small" onClick={handleEdit}>
              <EditIcon fontSize="small" color="primary" />
            </IconButton >
          </Tooltip>
        }
        {deleteable &&
          <Tooltip arrow title="Удалить">
            <IconButton size="small" onClick={handleDelete}>
              <DeleteIcon fontSize="small" color="primary" />
            </IconButton >
          </Tooltip>
        }
      </div>
    </div>
  );
})(() => ({}));

export default EditableTypography;
