import { CardContent, Grid } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CardHeader, Typography, Divider, Button, IconButton, CircularProgress, Skeleton } from '@mui/material';
import style from './updateHistory.module.less';
import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import PerfectScrollbar from 'react-perfect-scrollbar';
import CustomizedCard from '../../components/Styled/customized-card/customized-card';
import EditIcon from '@mui/icons-material/Edit';
import Popup from './popup/popup';
import { updatesApi, fullUpdate } from '../../features/updates/updatesApi';
import { useTheme, Theme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '../../confirm-dialog/confirm-dialog';
import { makeStyles } from '@mui/styles';
import PermissionsGate from '../../components/Permissions/permission-gate/permission-gate';
import CardToolbar from '../../components/Styled/card-toolbar/card-toolbar';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import usePermissions from '../../components/helpers/hooks/usePermissions';

const useStyles = makeStyles((theme: Theme) => ({
  accordion: {
    width: '100%',
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main
    }
  },
}));

export default function UpdateHistory() {
  const { data: updates = [], isFetching, isLoading } = updatesApi.useGetAllUpdatesQuery();
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [isOpenedEditPopup, setIsOpenedEditPopup] = React.useState<boolean>(false);
  const [isOpenedAddPopup, setIsOpenedAddPopup] = React.useState<boolean>(false);
  const [update, setUpdate] = useState<fullUpdate>();
  const [addUpdate, addUpdateObj] = updatesApi.useAddUpdateMutation();
  const [editUpdate, editUpdateObj] = updatesApi.useEditUpdateMutation();
  const [deleteUpdate, deleteUpdateObj] = updatesApi.useDeleteUpdateMutation();
  const userPermissions = usePermissions();

  const componentIsFetching = isFetching;

  const addUpdateHandler = (version: string, changes: string) => {
    addUpdate({ 'USR$VERSION': version, 'USR$CHANGES': changes });
  };
  const editUpdateHandler = (version: string, changes: string, id: number) => {
    editUpdate([{ 'USR$VERSION': version, 'USR$CHANGES': changes }, id]);
  };
  const deleteUpdateHandler = (id: number) => {
    deleteUpdate(id);
  };

  const handleOpenAddPopup = () => {
    setIsOpenedAddPopup(true);
  };

  const handleCloseAddPopup = (): void => {
    setIsOpenedAddPopup(false);
  };

  const handleOpenEditPopup = (editableUpdate: fullUpdate) => () => {
    setUpdate(editableUpdate);
    setIsOpenedEditPopup(true);
  };

  const handleCloseEditPopup = () => {
    setIsOpenedEditPopup(false);
  };

  const handleDelete = useCallback(() => {
    if (update) {
      handleConfirmCancelClick();
      deleteUpdateHandler(update.ID);
    }
  }, [update]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteClick = (deletedFaq: fullUpdate) => () => {
    setUpdate(deletedFaq);
    setConfirmOpen(true);
  };

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      title={'Удаление вопроса с ответом'}
      text="Вы уверены, что хотите продолжить?"
      confirmClick={
        handleDelete
      }
      cancelClick={handleConfirmCancelClick}
    />
  , [confirmOpen, addUpdateHandler, handleDelete, editUpdateHandler, handleConfirmCancelClick]);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const skeletonItems = useMemo(() => (count: number): fullUpdate[] => {
    const skeletonFaqItems: fullUpdate[] = [];
    const skeletonFaqItem = {} as fullUpdate;
    for (let i = 0; i < count; i++) {
      skeletonFaqItems.push(
        { ...skeletonFaqItem, ID: i }
      );
    }

    return skeletonFaqItems;
  }, []);

  const skeletonUpdatesCount: fullUpdate[] = skeletonItems(10);


  const classes = useStyles();

  return (
    <>
      {!componentIsFetching &&
        <>
          {memoConfirmDialog}
          <Popup
            close={handleCloseEditPopup}
            isOpened={isOpenedEditPopup}
            isAddPopup={false}
            update={update}
            editUpdate={editUpdateHandler}
          />
          <Popup
            close={handleCloseAddPopup}
            isOpened={isOpenedAddPopup}
            isAddPopup={true}
            addUpdate={addUpdateHandler}
          />
        </>
      }
      <div className={style.body} >
        <CustomizedCard className={style.card} borders>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <CardHeader
              title={<Typography variant="h3">История обновлений</Typography>}
            />
            <div style={{ padding: '5px 10px' }}>
              <PermissionsGate actionAllowed={userPermissions?.updates?.POST}>
                <Button
                  disabled={addUpdateObj.isLoading}
                  variant="contained"
                  onClick={handleOpenAddPopup}
                >Добавить</Button>
              </PermissionsGate>
            </div>
          </div>
          <Divider />

          <CardContent className={style.scrollBarContainer}>
            <PerfectScrollbar style={{ paddingRight: '10px', pointerEvents: componentIsFetching ? 'none' : 'auto' }} >
              <Grid item xs={12}>
                {(componentIsFetching ? skeletonUpdatesCount : updates).map(item =>

                  <div key={item.ID}>
                    {(componentIsFetching ? skeletonUpdatesCount : updates)?.indexOf(item) !== 0 && <Divider/>}
                    <div className={style.faqList}>
                      {componentIsFetching ?
                        <div style={{ margin: '20px', width: '100%' }}>
                          <Skeleton
                            variant="text"
                            width={'100%'}
                            height={'40px'}
                          />
                        </div>
                        :
                        <>
                          <Accordion
                            expanded={expanded === `panel${item.ID}`}
                            onChange={handleChange(`panel${item.ID}`)}
                            className={classes.accordion}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                            >
                              <Typography variant="h4">
                                {/* {item.USR$QUESTION} */}
                                <ReactMarkdown>
                                  {item.USR$VERSION}
                                </ReactMarkdown>
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails className={style.details}>
                              <Typography variant="body1" component="div">
                                <ReactMarkdown >
                                  {item.USR$CHANGES}
                                </ReactMarkdown>
                              </Typography>
                            </AccordionDetails>
                          </Accordion>
                        </>
                      }
                      {!componentIsFetching &&
                        <>
                          <PermissionsGate actionAllowed={userPermissions?.updates?.PUT}>
                            <IconButton
                              color="primary"
                              disabled={deleteUpdateObj.isLoading || editUpdateObj.isLoading}
                              style={{ marginTop: '20px' }}
                              onClick={handleOpenEditPopup(item)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </PermissionsGate>
                          <PermissionsGate actionAllowed={userPermissions?.updates?.DELETE}>
                            <IconButton
                              color="primary"
                              style={{ marginTop: '17.5px' }}
                              disabled={deleteUpdateObj.isLoading || editUpdateObj.isLoading}
                              onClick={handleDeleteClick(item)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </PermissionsGate>
                        </>
                      }
                    </div>
                  </div>
                )
                }
              </Grid>
            </PerfectScrollbar>
          </CardContent>
        </CustomizedCard>

      </div>
    </>
  );
};
