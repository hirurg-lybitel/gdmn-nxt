import { CardContent, Grid } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CardHeader, Typography, Divider, Button, IconButton, CircularProgress, Skeleton } from '@mui/material';
import style from './faq.module.less';
import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import PerfectScrollbar from 'react-perfect-scrollbar';
import CustomizedCard from '../../components/Styled/customized-card/customized-card';
import EditIcon from '@mui/icons-material/Edit';
import Popup from './popup/popup';
import { faqApi, fullFaq } from '../../features/FAQ/faqApi';
import { useTheme, Theme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '../../confirm-dialog/confirm-dialog';
import { makeStyles } from '@mui/styles';
import { usePermissions } from '../../features/common/usePermissions';
import PermissionsGate from '../../components/Permissions/permission-gate/permission-gate';
import { Action } from '@gsbelarus/util-api-types';

const useStyles = makeStyles((theme: Theme) => ({
  accordion: {
    width: '100%',
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main
    }
  },
}));

export default function FAQ() {
  const { data: faqs = [], isFetching, isLoading } = faqApi.useGetAllfaqsQuery();
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [isOpenedEditPopup, setIsOpenedEditPopup] = React.useState<boolean>(false);
  const [isOpenedAddPopup, setIsOpenedAddPopup] = React.useState<boolean>(false);
  const [faq, setFaq] = useState<fullFaq>();
  const [addFaq, addFaqObj] = faqApi.useAddfaqMutation();
  const [editFaq, editFaqObj] = faqApi.useEditFaqMutation();
  const [deleteFaq, deleteFaqObj] = faqApi.useDeleteFaqMutation();
  const [isFetching11] = usePermissions(11);
  const [isFetching12] = usePermissions(12);
  const [isFetching13] = usePermissions(13);
  const componentIsFetching = isFetching || isFetching11 || isFetching12 || isFetching13;

  const addFaqHandler = (question:string, answer:string) => {
    addFaq({ 'USR$QUESTION': question, 'USR$ANSWER': answer });
  };
  const editFaqHandler = (question:string, answer:string, id:number) => {
    editFaq([{ 'USR$QUESTION': question, 'USR$ANSWER': answer }, id]);
  };
  const deleteFaqHandler = (id:number) => {
    deleteFaq(id);
  };

  const handleOpenAddPopup = () => {
    setIsOpenedAddPopup(true);
  };

  const handleCloseAddPopup = ():void => {
    setIsOpenedAddPopup(false);
  };

  const handleOpenEditPopup = (editableFaq: fullFaq) => () => {
    setFaq(editableFaq);
    setIsOpenedEditPopup(true);
  };

  const handleCloseEditPopup = () => {
    setIsOpenedEditPopup(false);
  };

  const handleDelete = useCallback(() => {
    if (faq) {
      handleConfirmCancelClick();
      deleteFaqHandler(faq.ID);
    }
  }, [faq]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteClick = (deletedFaq: fullFaq) => () => {
    setFaq(deletedFaq);
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
  , [confirmOpen, addFaqHandler, handleDelete, editFaqHandler, handleConfirmCancelClick]);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const theme = useTheme();

  // if (componentIsFetching) {
  //   return (
  //     <div className={style.preloadevBody}>
  //       <CircularProgress size={100} />
  //     </div>
  //   );
  // }

  const skeletonItems = useMemo(() =>(count:number):fullFaq[] => {
    const skeletonFaqItems:fullFaq[] = [];
    const skeletonFaqItem = {} as fullFaq;
    for (let i = 0; i < count; i++) {
      skeletonFaqItems.push(
        { ...skeletonFaqItem, ID: i }
      );
    }

    return skeletonFaqItems;
  }, []);

  const skeletonFaqsCount:fullFaq[] = skeletonItems(10);


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
            faq={faq}
            editFaq={editFaqHandler}
          />
          <Popup
            close={handleCloseAddPopup}
            isOpened={isOpenedAddPopup}
            isAddPopup={true}
            addFaq={addFaqHandler}
          />
        </>
      }
      <div className={style.body} >
        <CustomizedCard className={style.card} borders>
          <CardHeader
            title={componentIsFetching ?
              <Skeleton variant="rectangular" height={'36px'}/>
              :
              <div className={style.title}>
                <Typography variant="h3">
                  База знаний
                </Typography>
                <PermissionsGate actionCode={Action.CreateFAQ}>
                  <Button disabled={addFaqObj.isLoading} variant="contained" onClick={handleOpenAddPopup}>Добавить</Button>
                </PermissionsGate>
              </div>
            }
          />
          <Divider />
          <CardContent className={style.scrollBarContainer}>
            <PerfectScrollbar style={{ paddingRight: '10px', pointerEvents: componentIsFetching ? 'none' : 'auto' }} >
              <Grid item xs={12}>
                {(componentIsFetching ? skeletonFaqsCount : faqs).map(item =>

                  <div key={item.ID}>
                    {(componentIsFetching ? skeletonFaqsCount : faqs)?.indexOf(item) !== 0 && <Divider/>}
                    <div className={style.faqList}>
                      {componentIsFetching ?
                        <div style={{ margin: '20px', width: '100%' }}>
                          <Skeleton variant="text" width={'100%'} height={'40px'} />
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
                                  {item.USR$QUESTION}
                                </ReactMarkdown>
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails className={style.details}>
                              <Typography variant="body1" component="div">
                                <ReactMarkdown >
                                  {item.USR$ANSWER}
                                </ReactMarkdown>
                              </Typography>
                            </AccordionDetails>
                          </Accordion>
                        </>
                      }
                      {!componentIsFetching &&
                        <>
                          <PermissionsGate actionCode={Action.EditFAQ}>
                            <IconButton
                              color="primary"
                              disabled={deleteFaqObj.isLoading || editFaqObj.isLoading}
                              style={{ marginTop: '20px' }}
                              onClick={handleOpenEditPopup(item)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </PermissionsGate>
                          <PermissionsGate actionCode={Action.DeleteFAQ}>
                            <IconButton
                              color="primary"
                              style={{ marginTop: '17.5px' }}
                              disabled={deleteFaqObj.isLoading || editFaqObj.isLoading}
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
