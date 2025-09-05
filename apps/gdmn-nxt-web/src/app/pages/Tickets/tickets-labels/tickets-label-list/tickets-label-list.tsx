import { Box, CardContent, Divider, Skeleton, Stack } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import { useAddLabelMutation, useDeleteLabelMutation, useGetLabelsQuery, useUpdateLabelMutation } from 'apps/gdmn-nxt-web/src/app/features/labels';
import { TicketsLabelListItem } from '../tickets-label-list-item/tickets-label-list-item';
import styles from './tickets-label-list.module.less';
import { useCallback, useMemo, useState } from 'react';
import { ILabel, Permissions } from '@gsbelarus/util-api-types';
import { LoadingButton } from '@mui/lab';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';
import CardToolbar from '@gdmn-nxt/components/Styled/card-toolbar/card-toolbar';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import LabelListItemEdit from '@gdmn-nxt/components/Labels/label-list-item-edit/label-list-item-edit';
import { useAddTicketsLabelMutation, useDeleteTicketsLabelMutation, useGetTicketsLabelsQuery, useUpdateTicketsLabelMutation } from 'apps/gdmn-nxt-web/src/app/features/tickets/ticketsLabelsApi';

const ItemSkeleton = () => {
  return (
    <Stack
      direction="row"
      spacing={6}
      height={68.5}
      p={2}
      alignItems="center"
    >
      <Skeleton
        variant="rectangular"
        width={60}
        height={20}
        style={{ borderRadius: 'var(--border-radius)' }}
      />
      <Skeleton
        variant="text"
        height={30}
        width={'100%'}
      />
    </Stack>
  );
};

const useStyles = makeStyles(() => ({
  body: {
    position: 'relative',
    maxHeight: '100%',
    minWidth: '100%',
    border: 'none',
    overflowWrap: 'normal',
  },
  scrollBarContainer: {
    paddingBottom: '20px',
    borderRadius: 'var(--border-radius)',
    position: 'absolute',
    right: '1px',
    left: '1px',
    bottom: '0',
    top: '80px',
  }
}));

/* eslint-disable-next-line */
export interface LabelListProps { }

export function TicketsLabelList(props: LabelListProps) {
  const { data: labels, isFetching: dataIsFetching, isLoading: dataIsLoading } = useGetTicketsLabelsQuery(undefined, { refetchOnMountOrArgChange: true });

  const [openEditForm, setOpenEditForm] = useState(false);
  const [addLabel, { isLoading: addIsLoading }] = useAddTicketsLabelMutation();
  const [deleteLabel, { isLoading: deleteIsLoading }] = useDeleteTicketsLabelMutation();
  const [updateLabel, { isLoading: editIsLoading }] = useUpdateTicketsLabelMutation();

  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  const handleOnSubmit = (label: ILabel) => {
    setOpenEditForm(false);

    addLabel(label);
  };

  const handleCancelClick = () => {
    setOpenEditForm(false);
  };

  const componentIsFetching = useMemo(() => dataIsLoading, [dataIsLoading]);

  const classes = useStyles();

  const handleDelete = useCallback((id: number) => deleteLabel(id), []);
  const handleEdit = useCallback((label: ILabel) => updateLabel(label), []);

  return (
    <div
      className={classes.body}
    >
      <CustomizedCard
        style={{ height: '100%' }}
      >
        <CustomCardHeader title={'Метки тикетов'} />
        <Divider />
        <PermissionsGate actionAllowed={userPermissions?.['ticketSystem/labels'].POST}>
          <CardToolbar>
            <div style={{ display: 'flex' }}>
              <Box flex={1} />

              <LoadingButton
                loading={dataIsFetching || addIsLoading || editIsLoading || deleteIsLoading}
                loadingPosition="start"
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => setOpenEditForm(true)}
              >
                Добавить
              </LoadingButton>

            </div>
          </CardToolbar>
        </PermissionsGate>
        <CardContent style={{ paddingRight: '5px' }}>
          <CustomizedScrollBox>
            <div style={{ paddingRight: '10px' }}>
              {componentIsFetching
                ? [...Array(10)].map((el, idx) =>
                  <div key={idx}>
                    {idx !== 0 ? <Divider /> : <></>}
                    <ItemSkeleton />
                  </div>)
                :
                labels?.map((label, idx) =>
                  <div key={label.ID}>
                    {idx !== 0 ? <Divider /> : <></>}
                    <TicketsLabelListItem
                      data={label}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>) || <></>
              }
            </div>
          </CustomizedScrollBox>
          <LabelListItemEdit
            open={openEditForm}
            onSubmit={handleOnSubmit}
            onCancelClick={handleCancelClick}
          />
        </CardContent>
      </CustomizedCard>
    </div >
  );
}

export default TicketsLabelList;
