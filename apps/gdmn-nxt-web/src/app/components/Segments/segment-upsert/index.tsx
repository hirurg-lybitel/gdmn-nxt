import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import Confirmation from '@gdmn-nxt/components/helpers/confirmation';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import { Box, Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useState } from 'react';

export interface SegmentUpsertProps {
  segment?: any;
  open: boolean;
  onSubmit: (newSegment: any, deleting?: boolean) => void;
  onCancel: () => void;
}

export function SegmentUpsert({
  open,
  segment,
  onSubmit,
  onCancel
}: SegmentUpsertProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = () => {
    setDeleting(true);
  };

  const onClose = () => {
    onCancel();
    // formik.resetForm();
  };

  const handleSubmit = async () => {
    // await formik.submitForm();

    // if (!formik.isValid) return;
    // onSubmit(formik.values, deleting);
  };

  return (
    <CustomizedDialog
      open={open}
      onClose={onClose}
      width="calc(100% - var(--menu-width))"
    >
      <DialogTitle>
        {segment ? `Редактирование: ${segment}` : 'Добавление нового сегмента'}
      </DialogTitle>
      <DialogContent dividers>
        <div>динамический (по умолчанию)/статический</div>
        <div>фильтры</div>
      </DialogContent>
      <DialogActions>
        {segment &&
          <Confirmation
            key="delete"
            title="Удаление клиента"
            // text={`Вы действительно хотите удалить клиента ${customer?.NAME}?`}
            dangerous
            onConfirm={handleDeleteClick}
          >
            <ItemButtonDelete button />
          </Confirmation>
        }
        <Box flex={1}/>
        <Button
          // className={styles.button}
          onClick={onCancel}
          variant="outlined"
          color="primary"
        >
          Отменить
        </Button>
        {/* <PermissionsGate actionAllowed={userPermissions?.customers?.PUT} show> */}
        <Confirmation
          key="save"
          title="Сохранение клиента"
          text={'Вы действительно хотите сохранить изменения?'}
          onConfirm={handleSubmit}
        >
          <Button
            // className={styles.button}
            variant="contained"
            // disabled={!userPermissions?.customers?.PUT}
          >
            Сохранить
          </Button>
        </Confirmation>
        {/* </PermissionsGate> */}
      </DialogActions>
    </CustomizedDialog>
  );
};
