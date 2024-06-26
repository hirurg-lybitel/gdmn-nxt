import { ILabel, Permissions } from '@gsbelarus/util-api-types';
import { Box, Grid, Typography } from '@mui/material';
import styles from './label-list-item.module.less';
import { useCallback, useState } from 'react';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { useDeleteLabelMutation, useUpdateLabelMutation } from '../../../features/labels';
import LabelListItemEdit from '../label-list-item-edit/label-list-item-edit';
import LabelMarker from '../label-marker/label-marker';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import ItemButtonEdit from '@gdmn-nxt/components/item-button-edit/item-button-edit';

export interface LabelListItemProps {
  data: ILabel;
  onEdit?: (label: ILabel) => void;
  onDelete?: (id: number) => void;
}


export function LabelListItem(props: LabelListItemProps) {
  const { data, onEdit, onDelete } = props;
  const { ID } = data;

  const [openEditForm, setOpenEditForm] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [deleteLabel, { isLoading: deleteIsLoading }] = useDeleteLabelMutation();
  const [updateLabel, { isLoading: editIsLoading }] = useUpdateLabelMutation();

  const handleEditClick = useCallback(() => {
    setOpenEditForm(true);
  }, []);

  const handleOnSubmit = (label: ILabel) => {
    setOpenEditForm(false);

    if (label.ID) {
      onEdit && onEdit(label);
      return;
    };
  };

  const handleCancelClick = useCallback(() => {
    setOpenEditForm(false);
  }, []);

  const handleDelete = useCallback(() => {
    setConfirmOpen(false);
    onDelete && onDelete(ID);
  }, [ID]);

  function hexToRGB(h: any) {
    let r = 0, g = 0, b = 0;

    if (!h) return { r, g, b };

    // 3 digits
    if (h.length === 4) {
      r = h[1] + h[1];
      g = h[2] + h[2];
      b = h[3] + h[3];

    // 6 digits
    } else if (h.length === 7) {
      r = parseInt(h[1] + h[2], 16);
      g = parseInt(h[3] + h[4], 16);
      b = parseInt(h[5] + h[6], 16);
    }

    return { r, g, b };
  }

  function RGBToHSL(r: number, g: number, b: number) {
    // Make r, g, and b fractions of 1
    r /= 255;
    g /= 255;
    b /= 255;

    // Find greatest and smallest channel values
    const cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin;
    let h = 0,
      s = 0,
      l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return { h, s, l };
  };

  const rgb = hexToRGB(data.USR$COLOR);
  const hsl = RGBToHSL(rgb.r, rgb.g, rgb.b);
  // const labelR = 0;
  // const labelG = 117;
  // const labelB = 202;
  const labelH = hsl.h;
  const labelS = hsl.s;
  const labelL = hsl.l;
  const backgroundAlpha = 0.2;
  const borderAlpha = 0.3;

  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);


  return (
    <Box style={{ padding: '4px 0px' }}>
      <Grid container alignItems="center">
        <Grid
          item
          xs={4}
          paddingLeft={2}
          paddingRight={2}
        >
          <LabelMarker label={data} />
        </Grid>
        <Grid item flex={1}>
          <Typography variant="body2">{data.USR$DESCRIPTION}</Typography>
        </Grid>
        <Grid
          item
          xs={2}
          md={1}
        >
          <Box
            display={'inline-flex'}
            width="100%"
            justifyContent={'center'}
            style={{ marginRight: 0 }}
          >
            <PermissionsGate actionAllowed={userPermissions?.labels.PUT}>
              <ItemButtonEdit
                disabled={editIsLoading || deleteIsLoading}
                color="primary"
                onClick={handleEditClick}
              />
            </PermissionsGate>
            <PermissionsGate actionAllowed={userPermissions?.labels.DELETE}>
              <ItemButtonDelete
                button
                disabled={editIsLoading || deleteIsLoading}
                onClick={handleDelete}
              />
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
    </Box>
  );
}

export default LabelListItem;
