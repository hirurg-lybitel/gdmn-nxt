import { ILabel } from '@gsbelarus/util-api-types';
import { Box, Divider, Grid, IconButton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import styles from './label-list-item.module.less';
import { CSSProperties, useCallback, useState } from 'react';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { useAddLabelMutation, useDeleteLabelMutation, useUpdateLabelMutation } from '../../../features/labels';
import LabelListItemEdit from '../label-list-item-edit/label-list-item-edit';
import { makeStyles } from '@mui/styles';
import LabelMarker from '../label-marker/label-marker';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';

export interface LabelListItemProps {
  data: ILabel;
}

export function LabelListItem(props: LabelListItemProps) {
  const { data } = props;
  const { ID } = data;

  const [openEditForm, setOpenEditForm] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [deleteLabel] = useDeleteLabelMutation();
  const [addLabel] = useAddLabelMutation();
  const [updateLabel] = useUpdateLabelMutation();

  const handleEditClick = useCallback(() => {
    setOpenEditForm(true);
  }, []);

  const handleDeleteClick = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const handleOnSubmit = (label: ILabel) => {
    setOpenEditForm(false);

    if (label.ID) {
      updateLabel(label);
      return;
    };

    addLabel(label);
  };

  const handleCancelClick = useCallback(() => {
    setOpenEditForm(false);
  }, []);

  const handleConfirmOkClick = useCallback(() => {
    setConfirmOpen(false);
    deleteLabel(ID);
  }, [ID]);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  return (
    <Box className={styles['Box-row']}>
      <Grid container alignItems="center">
        <Grid item xs={4} paddingLeft={2} paddingRight={2}>
          <LabelMarker label={data} />
        </Grid>
        <Grid item flex={1}>
          {data.USR$DESCRIPTION}
        </Grid>
        <Grid item xs={2} md={1}>
          <Box display={'inline-flex'} width="100%" justifyContent={'center'}>
            <PermissionsGate actionCode={6}>
              <IconButton onClick={handleEditClick}>
                <EditOutlinedIcon fontSize="small" color="primary" />
              </IconButton>
            </PermissionsGate>
            <PermissionsGate actionCode={7}>
              <IconButton onClick={handleDeleteClick}>
                <DeleteForeverIcon fontSize="small" color="primary" />
              </IconButton>
            </PermissionsGate>
          </Box>
        </Grid>
      </Grid>
      <LabelListItemEdit
        open={openEditForm}
        label={data}
        onSubmit={handleOnSubmit}
        onCancelClick={handleCancelClick}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Удаление метки"
        text="Вы уверены, что хотите продолжить?"
        dangerous
        confirmClick={handleConfirmOkClick}
        cancelClick={handleConfirmCancelClick}
      />
    </Box>
  );
}

export default LabelListItem;
