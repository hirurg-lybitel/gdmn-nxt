import { Accordion, AccordionDetails, AccordionSummary, CardContent, CardHeader, Divider, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import styles from './updates-list.module.less';
import CardToolbar from '../../Styled/card-toolbar/card-toolbar';
import { LoadingButton } from '@mui/lab';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Fragment, SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { useAddUpdateMutation, useDeleteUpdateMutation, useEditUpdateMutation, useGetAllUpdatesQuery } from '../../../features/updates';
import CustomizedScrollBox from '../../Styled/customized-scroll-box/customized-scroll-box';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import UpdatesEdit from '../updates-edit/updates-edit';
import { IUpdateHistory } from '@gsbelarus/util-api-types';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';

/* eslint-disable-next-line */
export interface UpdatesListProps {}

export function UpdatesList(props: UpdatesListProps) {
  const { data: updates = [], isFetching, isLoading } = useGetAllUpdatesQuery();
  const [editUpdate] = useEditUpdateMutation();
  const [addUpdate] = useAddUpdateMutation();
  const [deleteUpdate] = useDeleteUpdateMutation();

  const [expanded, setExpanded] = useState<string>('');
  const [upsert, setUpsert] = useState(false);
  const [update, setUpdate] = useState<IUpdateHistory>();
  const userPermissions = usePermissions();

  const handleChange =
    (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : '');
    };

  const handleEditSource = useCallback((update?: IUpdateHistory) => () => {
    setUpdate(update);
    setUpsert(true);
  }, []);

  const handleSubmit = useCallback((update: IUpdateHistory) => {
    if (update.ID > 0) {
      editUpdate(update);
    } else {
      addUpdate(update);
    };
    setUpsert(false);
  }, []);

  const handleDelete = useCallback((id: number) => {
    deleteUpdate(id);
    setUpsert(false);
  }, []);

  const handleCancel = useCallback(() => setUpsert(false), []);

  const memoUpsertDealSource = useMemo(() =>
    <UpdatesEdit
      open={upsert}
      update={update}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onDelete={handleDelete}
    />, [upsert, update]);

  return (
    <CustomizedCard
      className={styles.card}
    >
      <CardHeader
        title={<Typography variant="pageHeader">История обновлений</Typography>}
      />
      <Divider />
      <CardToolbar>
        <div className={styles.cardToolbarContent}>
          <PermissionsGate actionAllowed={userPermissions?.updates?.POST}>
            <LoadingButton
              className={styles.loadingButton}
              loading={isFetching}
              loadingPosition="start"
              startIcon={<AddIcon />}
              variant="contained"
              onClick={handleEditSource()}
            >
            Добавить
            </LoadingButton>
          </PermissionsGate>
        </div>
      </CardToolbar>
      <CardContent>
        <CustomizedScrollBox>
          {isLoading
            ? [...Array(5)].map((u, idx) => (
              <Fragment key={idx}>
                <Accordion disableGutters>
                  <AccordionSummary >
                    <Skeleton
                      variant="text"
                      width={'100%'}
                      height={'40px'}
                    />
                  </AccordionSummary>
                </Accordion>
              </Fragment>
            ))
            : updates.map(u =>
              <Fragment key={u.ID}>
                <Accordion
                  TransitionProps={{ unmountOnExit: true }}
                  expanded={expanded === `panel${u.ID}`}
                  onChange={handleChange(`panel${u.ID}`)}
                >
                  <AccordionSummary
                    className={styles.accordionSummary}
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography variant="subtitle1">{u.VERSION}</Typography>
                  </AccordionSummary>
                  <AccordionDetails >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">{new Date(u.ONDATE).toLocaleDateString()}</Typography>
                      <PermissionsGate actionAllowed={userPermissions?.updates.PUT}>
                        <ItemButtonEdit
                          button
                          size="small"
                          onClick={handleEditSource(u)}
                        />
                      </PermissionsGate>
                    </Stack>
                    <Typography variant="body1" component="div">
                      <ReactMarkdown >
                        {u.CHANGES}
                      </ReactMarkdown>
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Fragment>)}
        </CustomizedScrollBox>
      </CardContent>
      {memoUpsertDealSource}
    </CustomizedCard>
  );
}

export default UpdatesList;
