import { Box, Button, DialogActions, DialogContent, DialogTitle, Stack, useMediaQuery, useTheme } from '@mui/material';
import CustomizedDialog from '../Styled/customized-dialog/customized-dialog';
import ButtonWithConfirmation from '../button-with-confirmation/button-with-confirmation';
import ItemButtonDelete from '../customButtons/item-button-delete/item-button-delete';
import styles from './edit-dialog.module.css';
import { ReactNode, useCallback } from 'react';

interface EditDialogProps {
  open: boolean,
  onClose: (event?: object, reason?: 'backdropClick' | 'escapeKeyDown' | 'swipe') => void,
  title?: string,
  children: ReactNode,
  confirmation?: boolean,
  onDeleteClick?: () => void,
  deleteButton?: boolean,
  fullwidth?: boolean,
  disableEscape?: boolean,
  width?: number | string,
  deleteConfirmText?: string
}

export default function EditDialog(props: EditDialogProps) {
  const {
    open,
    onClose,
    title,
    children,
    confirmation = false,
    onDeleteClick,
    deleteButton,
    fullwidth,
    disableEscape,
    width,
    deleteConfirmText
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
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent dividers style={{ display: 'grid' }}>
        {children}
      </DialogContent>
      <DialogActions>
        {deleteButton && (
          <ItemButtonDelete
            button
            onClick={onDeleteClick}
          />
        )}
        <Box flex={1}/>
        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          sx={{
            gap: { xs: '10px', sm: '16px' },
            width: { xs: '100%', sm: '256px' } }}
        >
          <ButtonWithConfirmation
            className={styles.button}
            variant="outlined"
            onClick={onClose}
            title="Внимание"
            text={'Изменения будут утеряны. Продолжить?'}
            confirmation={confirmation}
          >
          Отменить
          </ButtonWithConfirmation>
          <Button
            className={styles.button}
            type="submit"
            form="contactEditForm"
            variant="contained"
          >
          Сохранить
          </Button>
        </Stack>
      </DialogActions>
    </CustomizedDialog>
  );
}
