import { CardContent, Grid } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CardHeader, Typography, Divider, Button, IconButton, CircularProgress } from '@mui/material';
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
import PermissionsGate from '../../components/Permissions/permission-gate/permission-gate';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '../../confirm-dialog/confirm-dialog';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  accordion: {
    width: '100%',
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main
    }
  }
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
  const classes = useStyles();

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

  if (isFetching) {
    return (
      <div className={style.preloadevBody}>
        <CircularProgress size={100} />
      </div>
    );
  }

  return (
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
      <div className={style.body} >
        <CustomizedCard className={style.card} borders>
          <CardHeader
            title={
              <div className={style.title}>
                <Typography variant="h3">
                  База знаний
                </Typography>
                <PermissionsGate actionCode={11}>
                  <Button disabled={addFaqObj.isLoading} variant="contained" onClick={handleOpenAddPopup}>Добавить</Button>
                </PermissionsGate>

              </div>
            }
          />
          <Divider />
          <CardContent className={style.scrollBarContainer}>
            {isLoading
              ? <div className={style.preloadevBody}>
                <CircularProgress size={100} />
              </div>
              : <PerfectScrollbar className={style.scrollBar}>
                <Grid item xs={12}>
                  {
                    faqs?.map(item =>
                      <div key={item.ID}>
                        {faqs?.indexOf(item) !== 0 && <Divider/>}
                        <div className={style.faqList}>
                          <Accordion
                            expanded={expanded === `panel${item.ID}`}
                            onChange={handleChange(`panel${item.ID}`)}
                            className={classes.accordion}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                            >
                              <ReactMarkdown>
                                {item.USR$QUESTION}
                              </ReactMarkdown>
                            </AccordionSummary>
                            <AccordionDetails style={{ background: 'rgba(0, 0, 0, 0.1)', borderRadius: '12px 12px 0 0' }}>
                              <ReactMarkdown >
                                {item.USR$ANSWER}
                              </ReactMarkdown>
                            </AccordionDetails>
                          </Accordion>
                          <PermissionsGate actionCode={12}>
                            <IconButton
                              color="primary"
                              disabled={editFaqObj.isLoading || isFetching}
                              style={{ marginTop: '20px' }}
                              onClick={handleOpenEditPopup(item)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </PermissionsGate>
                          <PermissionsGate actionCode={13}>
                            <IconButton
                              color="primary"
                              style={{ marginTop: '17.5px' }}
                              disabled={deleteFaqObj.isLoading || isFetching}
                              onClick={handleDeleteClick(item)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </PermissionsGate>
                        </div>
                      </div>
                    )
                  }
                </Grid>
              </PerfectScrollbar>
            }
          </CardContent>
        </CustomizedCard>

      </div>
    </>
  );
};
