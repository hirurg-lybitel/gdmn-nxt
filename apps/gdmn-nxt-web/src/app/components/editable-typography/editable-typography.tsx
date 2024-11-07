import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ClickAwayListener, IconButton, TextField, Tooltip, Typography, TypographyProps } from '@mui/material';
import styles from './editable-typography.module.less';
import { CSSProperties, KeyboardEvent, cloneElement, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import { ErrorTooltip } from '../Styled/error-tooltip/error-tooltip';
import SaveIcon from '@mui/icons-material/Save';
import useConfirmation from '../helpers/hooks/useConfirmation';

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
   * If `true`, the edit mode will turn off when `value` is empty
   * @default true
   */
  editEmpty?: boolean;
  cancellable?: boolean,
  onSave?: () => void;
  closeOnClickAway?: boolean,
  buttonDirection?: 'column' | 'column-reverse' | 'row' | 'row-reverse'
}

const EditableTypography = <Value extends React.ReactNode>({
  value,
  name,
  onDelete,
  onChange,
  editComponent,
  deleteable = false,
  cancellable = false,
  container,
  error = false,
  helperText,
  closeOnBlur = false,
  onClose: handleOnClose,
  onSave: handleSave,
  containerStyle,
  editEmpty = true,
  closeOnClickAway = false,
  buttonDirection = 'row',
  ...props
}: EditableTypographyProps<Value>) => {
  const [editText, setEditText] = useState(editEmpty ? !value : false);
  const [oldvalue, setOldValue] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [confirmDialog] = useConfirmation();

  const clonedElement = useMemo(() => editComponent
    ? cloneElement(editComponent, {
      onClick: (e: any) => {
        e.preventDefault();
      },
      onBlur: (e: any) => {
        closeOnBlur && onClose(e);
      },
      onChange: (e: any) => {
        editComponent.props.onChange && editComponent.props.onChange(e);
        setNewValue(e.target?.value || '');
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
    setOldValue(value as string);
    setNewValue(value as string);
  };

  const onConfirm = (e?: any) => {
    e?.preventDefault();
    if (!value?.toString().trim()) {
      onDelete && onDelete();
    }
    handleOnClose && handleOnClose();
    setEditText(false);
  };

  const onClose = (e?: any) => {
    if (cancellable && oldvalue !== newValue) {
      confirmDialog.setOpen(true);
      confirmDialog.setOptions({
        title: 'Внимание',
        text: 'Изменения будут утеряны. Продолжить?',
        dangerous: true,
        confirmClick: () => {
          confirmDialog.setOpen(false);
          onConfirm(e);
        },
      });
      return;
    }
    onConfirm(e);
  };

  const onSave = (e?: any) => {
    e?.preventDefault();
    if (!value?.toString().trim()) {
      onDelete && onDelete();
    }
    handleSave && handleSave();
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
    <ClickAwayListener onClickAway={editText && closeOnClickAway ? onClose : () => {}}>
      <div
        aria-label="editable-typography"
        className={styles['container']}
        style={containerStyle}
        onKeyDown={onKeyDown}
      >
        {confirmDialog.dialog}
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
            onChange={(e: any) => {
              onChange && onChange(e);
              setNewValue(e.target.value);
            }}
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
          style={{ flexDirection: buttonDirection }}
          className={`${styles['actions']} ${editText ? styles['visible'] : styles['hidden']}`}
        >
          {editText
            ? cancellable ? <Tooltip arrow title="Сохранить">
              <IconButton size="small" onClick={onSave}>
                <SaveIcon fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>
              : <Tooltip arrow title="Закрыть окно редактирования">
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
          {(cancellable && editText) && <Tooltip arrow title="Отменить">
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" color="primary" />
            </IconButton >
          </Tooltip>}
        </div>
      </div>
    </ClickAwayListener>
  );
};

export default EditableTypography;
