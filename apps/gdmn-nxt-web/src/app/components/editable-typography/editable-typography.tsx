import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, TextField, Tooltip, TooltipProps, Typography, TypographyProps, tooltipClasses } from '@mui/material';
import styles from './editable-typography.module.less';
import { KeyboardEvent, cloneElement, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';

export interface EditableTypographyProps<Value extends React.ReactNode> extends TypographyProps {
  name?: string;
  value: Value;
  editComponent?: React.ReactElement;
  deleteable?: boolean;
  onDelete?: () => void;
  container?: (value: Value) => React.ReactNode;
  error?: boolean;
  helperText?: string;
  closeOnBlur?:boolean
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
  ...props
}: EditableTypographyProps<Value>) => {
  const [editText, setEditText] = useState(!value);

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

  const onClose = (e: any) => {
    e.preventDefault();
    if (!value?.toString().trim()) {
      onDelete && onDelete();
    }
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
      onKeyDown={onKeyDown}
    >
      <StyledToolTip
        open={!!helperText}
        title={helperText}
      >
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
      </StyledToolTip>
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

const StyledToolTip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip
    arrow
    placement="bottom-start"
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -7],
            },
          },
        ],
      },
    }}
    {...props}
    classes={{ popper: className }}
  />
))(() => ({
  [`& .${tooltipClasses.arrow}`]: {
    transform: 'none !important',
    left: '10px !important',
    color: 'rgb(143, 64, 64)',
  },
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: '0.75rem',
    backgroundColor: 'rgb(143, 64, 64)',
  }
}));

export default EditableTypography;
