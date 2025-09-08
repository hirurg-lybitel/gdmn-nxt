import { Box, CardContent, CardHeader, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import { useAddLabelMutation, useDeleteLabelMutation, useGetLabelsQuery, useUpdateLabelMutation } from 'apps/gdmn-nxt-web/src/app/features/labels';
import LabelListItem from '../label-list-item/label-list-item';
import styles from './label-list.module.less';
import { useCallback, useMemo, useState } from 'react';
import LabelListItemEdit from '../label-list-item-edit/label-list-item-edit';
import { ILabel, Permissions } from '@gsbelarus/util-api-types';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import CardToolbar from '../../Styled/card-toolbar/card-toolbar';
import { LoadingButton } from '@mui/lab';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';

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

export function LabelList(props: LabelListProps) {
  const { data: labels, isFetching: dataIsFetching, isLoading: dataIsLoading, refetch } = useGetLabelsQuery(undefined, { refetchOnMountOrArgChange: true });

  const [openEditForm, setOpenEditForm] = useState(false);
  const [addLabel, { isLoading: addIsLoading }] = useAddLabelMutation();
  const [deleteLabel, { isLoading: deleteIsLoading }] = useDeleteLabelMutation();
  const [updateLabel, { isLoading: editIsLoading }] = useUpdateLabelMutation();

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
        <CustomCardHeader
          title={'Метки'}
          addButton={userPermissions?.labels.POST}
          onAddClick={() => setOpenEditForm(true)}
          addButtonHint="Создать метку"
          refetch
          onRefetch={refetch}
          isFetching={dataIsFetching}
          isLoading={dataIsLoading}
        />
        <Divider />
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
                    <LabelListItem
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
    </div>
  );
}

export default LabelList;
