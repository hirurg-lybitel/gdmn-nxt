import { ILabel } from '@gsbelarus/util-api-types';
import { Box, Grid, Stack, Typography } from '@mui/material';
import styles from './tickets-label-list-item.module.less';
import { useCallback, useState } from 'react';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import MenuBurger from '@gdmn-nxt/helpers/menu-burger';
import Confirmation from '@gdmn-nxt/helpers/confirmation';
import EditIcon from '@mui/icons-material/Edit';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import LabelMarker from '@gdmn-nxt/components/Labels/label-marker/label-marker';
import LabelListItemEdit from '@gdmn-nxt/components/Labels/label-list-item-edit/label-list-item-edit';

export interface ITicketsLabelListItemProps {
  data: ILabel;
  onEdit?: (label: ILabel) => void;
  onDelete?: (id: number) => void;
}

export function TicketsLabelListItem(props: Readonly<ITicketsLabelListItemProps>) {
  const { data, onEdit, onDelete } = props;
  const { ID, USR$NAME: NAME } = data;

  const [openEditForm, setOpenEditForm] = useState(false);

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
    onDelete && onDelete(ID);
  }, [ID, onDelete]);

  const userPermissions = usePermissions();

  return (
    <Box className={styles.container}>
      <Grid
        container
        alignItems="center"
        flexWrap={'nowrap'}
      >
        <Grid
          container
          direction={{ xs: 'column', sm: 'row' }}
          padding={'10px 0px'}
          sx={{ gap: { xs: 1, sm: 0 } }}
          minWidth={0}
        >
          <Grid
            item
            xs={4}
            paddingLeft={{ xs: 0, sm: 2 }}
            paddingRight={{ xs: 0, sm: 2 }}
            minWidth={150}
            container
            alignItems={'center'}
          >
            <LabelMarker label={data} />
          </Grid>
          <Grid
            item
            flex={1}
            display={data.USR$DESCRIPTION ? 'block' : 'none'}
          >
            <Typography variant="body2">{data.USR$DESCRIPTION}</Typography>
          </Grid>
        </Grid>
        <Grid
          item
          xs={2}
          md={1}
          marginRight={1.5}
          textAlign={'right'}
        >
          <MenuBurger
            items={({ closeMenu }) => [
              userPermissions?.['ticketSystem/labels'].PUT
                ? <Stack
                  key="edit"
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  onClick={() => {
                    handleEditClick();
                    closeMenu();
                  }}
                >
                  <EditIcon />
                  <span>Редактировать</span>
                </Stack>
                : <></>,
              userPermissions?.['ticketSystem/labels'].DELETE
                ? <Confirmation
                  key="delete"
                  title="Удалить метку"
                  text={`Вы действительно хотите удалить метку "${NAME}"?`}
                  dangerous
                  onConfirm={handleDelete}
                  onClose={closeMenu}
                >
                  <ItemButtonDelete
                    label="Удалить"
                    confirmation={false}
                  />
                </Confirmation>
                : <></>
            ]}
          />
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

export default TicketsLabelListItem;
