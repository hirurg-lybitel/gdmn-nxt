import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, TextField, Tooltip, Typography, TypographyProps } from '@mui/material';
import styles from './editable-typography.module.less';
import { CSSProperties, KeyboardEvent, cloneElement, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import { ErrorTooltip } from '../Styled/error-tooltip/error-tooltip';

export interface EditableTypographyProps<Value extends React.ReactNode> extends TypographyProps {
  name?: string;
  value: Value;
  editComponent?: React.ReactElement;
  deleteable?: boolean;
  onDelete?: () => void;
  container?: (value: Value) => React.ReactNode;
  containerStyle?: CSSProperties;
  error?: boolean;
  helperText?: string;
  /**
   * @default true
   */
  closeOnBlur?: boolean;
  onClose?: () => void;
  /**
   *  If `true`, the edit mode will turn off when `value` is empty
   * @default true
   */
  editEmpty?: boolean;
}

const EditableTypography = <Value extends React.ReactNode>({
  value,
  name,
  onDelete,
  onChange,
  editComponent,
  deleteable = false,
  container,
  error = false,
  helperText,
  closeOnBlur = true,
  onClose: handleOnClose,
  containerStyle,
  editEmpty = true,
  ...props
}: EditableTypographyProps<Value>) => {
  const [editText, setEditText] = useState(editEmpty ? !value : false);

  const clonedElement = useMemo(() => editComponent
    ? cloneElement(editComponent, {
      onClick: (e: any) => {
        e.preventDefault();
      },
      onBlur: (e: any) => {
        closeOnBlur && onClose(e);
      },
      style: {
        flex: 1
      }
    })
    : editComponent,
  [editComponent]);

  const handleEdit = (e: any) => {
    e.preventDefault();
    setEditText(true);
  };

  const onClose = (e?: any) => {
    e?.preventDefault();
    if (!value?.toString().trim()) {
      onDelete && onDelete();
    }
    handleOnClose && handleOnClose();
    setEditText(false);
  };

  const handleDelete = (e: any) => {
    e.preventDefault();
    onDelete && onDelete();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    e.key === 'Escape' && onClose(e);
  };

  return (
    <div
      aria-label="editable-typography"
      className={styles['container']}
      style={containerStyle}
      onKeyDown={onKeyDown}
    >
      <ErrorTooltip
        open={!!helperText}
        title={helperText}
      >
        <div style={{ width: '100%' }}>
          {editText
            ? clonedElement ??
          <TextField
            variant="standard"
            value={value}
            name={name}
            fullWidth
            onChange={onChange}
            onBlur={onClose}
          />
            :
            <Typography
              {...props}
              className={styles['title']}
              autoFocus
            >
              {container ? container(value) : value}
            </Typography>
          }
        </div>
      </ErrorTooltip>
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
};

export default EditableTypography;
