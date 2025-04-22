import { Box, Button, DialogActions, DialogContent, DialogTitle, Stack, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import CustomizedDialog from '../Styled/customized-dialog/customized-dialog';
import ButtonWithConfirmation from '../button-with-confirmation/button-with-confirmation';
import ItemButtonDelete from '../customButtons/item-button-delete/item-button-delete';
import styles from './edit-dialog.module.css';
import { ReactNode } from 'react';

interface EditDialogProps {
  open: boolean,
  title?: string | ReactNode,
  children: ReactNode,
  confirmation?: boolean,
  form?: string,

  // cancelButtonProps
  onClose: (event?: object, reason?: 'backdropClick' | 'escapeKeyDown' | 'swipe') => void,
  cancelConfirmTitle?: string,
  cancelConfirmText?: string,

  // deleteButtonProps
  onDeleteClick?: () => void,
  deleteButton?: boolean,
  deleteConfirmTitle?: string,
  deleteConfirmText?: string,
  deleteButtonDisabled?: boolean
  deleteButtoHint?: string
  showDeleteButtonHintAnyway?: boolean

  // sumbitButtonProps
  onSubmitClick?: () => void,
  submitButtonDisabled?: boolean,
  submitButton?: boolean
  submitHint?: string

  // DealogProps
  fullwidth?: boolean,
  disableEscape?: boolean,
  width?: number | string,
  selectDialog?: boolean
}

export default function EditDialog(props: Readonly<EditDialogProps>) {
  const {
    open,
    onClose,
    title,
    form,
    children,
    confirmation = false,
    onDeleteClick,
    deleteButton = false,
    fullwidth = false,
    disableEscape,
    width,
    cancelConfirmTitle = 'Внимание',
    cancelConfirmText = 'Изменения будут утеряны. Продолжить?',
    deleteConfirmTitle,
    deleteConfirmText,
    onSubmitClick,
    deleteButtoHint = 'Удалить',
    showDeleteButtonHintAnyway = false,
    deleteButtonDisabled = false,
    submitButtonDisabled = false,
    submitButton = true,
    submitHint = '',
    selectDialog = false
  } = props;

  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <CustomizedDialog
      open={open}
      onClose={onClose}
      confirmation={confirmation}
      disableEscape={disableEscape}
      fullwidth={fullwidth}
      width={width}
    >
      <DialogTitle sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {title}
      </DialogTitle>
      <DialogContent dividers style={{ display: 'grid' }}>
        {children}
      </DialogContent>
      <DialogActions>
        {deleteButton && (
          <ItemButtonDelete
            button
            hint={deleteButtoHint}
            title={deleteConfirmTitle}
            text={deleteConfirmText}
            onClick={onDeleteClick}
            showHintAnyway={showDeleteButtonHintAnyway}
            disabled={deleteButtonDisabled}
          />
        )}
        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          sx={{
            gap: { xs: '10px', sm: '14px' },
            width: { xs: '100%', sm: 'fin-content' } }}
          justifyContent={'flex-end'}
        >
          {selectDialog ?
            (
              <Button
                className={styles.button}
                variant="outlined"
                onClick={onClose}
              >
                Закрыть
              </Button>
            )
            : <>
              <ButtonWithConfirmation
                className={styles.button}
                variant="outlined"
                onClick={onClose}
                title={cancelConfirmTitle}
                text={cancelConfirmText}
                confirmation={confirmation}
              >
                Отменить
              </ButtonWithConfirmation>
              {submitButton && (
                <Tooltip title={submitHint}>
                  <div>
                    <Button
                      className={styles.button}
                      type="submit"
                      form={form}
                      variant="contained"
                      onClick={onSubmitClick}
                      disabled={submitButtonDisabled}
                    >
                      Сохранить
                    </Button>
                  </div>
                </Tooltip>
              )}
            </>}
        </Stack>
      </DialogActions>
    </CustomizedDialog>
  );
}
