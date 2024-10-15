import { Box, CardContent, Grid, Stack } from '@mui/material';
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
import PermissionsGate from '../../components/Permissions/permission-gate/permission-gate';
import CardToolbar from '../../components/Styled/card-toolbar/card-toolbar';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import usePermissions from '../../components/helpers/hooks/usePermissions';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import CustomAddButton from '@gdmn-nxt/components/helpers/custom-add-button';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import ItemButtonEdit from '@gdmn-nxt/components/item-button-edit/item-button-edit';

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
  const userPermissions = usePermissions();

  const componentIsFetching = isFetching;

  const addFaqHandler = (values: fullFaq) => {
    addFaq(values);
  };
  const editFaqHandler = (values: fullFaq) => {
    editFaq([values, values.ID]);
  };
  const deleteFaqHandler = (id: number) => {
    deleteFaq(id);
  };

  const handleOpenAddPopup = () => {
    setIsOpenedAddPopup(true);
  };

  const handleCloseAddPopup = (): void => {
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

  const skeletonItems = useMemo(() => (count: number): fullFaq[] => {
    const skeletonFaqItems: fullFaq[] = [];
    const skeletonFaqItem = {} as fullFaq;
    for (let i = 0; i < count; i++) {
      skeletonFaqItems.push(
        { ...skeletonFaqItem, ID: i }
      );
    }

    return skeletonFaqItems;
  }, []);

  const skeletonFaqsCount: fullFaq[] = skeletonItems(10);


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
      <CustomizedCard sx={{ width: '100%' }}>
        <CardHeader
          title={<Typography variant="pageHeader">База знаний</Typography>}
          action={
            <Stack direction={'row'}>
              <Box flex={1} />
              <PermissionsGate actionAllowed={userPermissions?.faq.POST}>
                <CustomAddButton
                  disabled={addFaqObj.isLoading}
                  onClick={handleOpenAddPopup}
                  label="Добавить запись"
                />
              </PermissionsGate>
            </Stack>
          }
        />
        <Divider />
        <CardContent sx={{ paddingRight: '0' }}>
          <CustomizedScrollBox style={{ paddingRight: '20px' }}>
            {(componentIsFetching ? skeletonFaqsCount : faqs).map(item =>

              <div key={item.ID}>
                {(componentIsFetching ? skeletonFaqsCount : faqs)?.indexOf(item) !== 0 && <Divider/>}
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
                          <Stack direction={'row'} flex={1}  alignItems={'center'}>
                            <Typography variant="h6">
                              <ReactMarkdown>
                                {item.USR$QUESTION}
                              </ReactMarkdown>
                            </Typography>
                            {!componentIsFetching &&
                              <>
                                <Box flex={1} />
                                <PermissionsGate actionAllowed={userPermissions?.faq.PUT}>
                                  <ItemButtonEdit
                                    disabled={deleteFaqObj.isLoading || editFaqObj.isLoading}
                                    onClick={handleOpenEditPopup(item)}
                                  />
                                </PermissionsGate>
                                <PermissionsGate actionAllowed={userPermissions?.faq.DELETE}>
                                  <ItemButtonDelete
                                    button
                                    disabled={deleteFaqObj.isLoading || editFaqObj.isLoading}
                                    onClick={handleDeleteClick(item)}
                                  />
                                </PermissionsGate>
                              </>
                            }
                          </Stack>
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
                </div>
              </div>
            )
            }
          </CustomizedScrollBox>
        </CardContent>
      </CustomizedCard>
    </>
  );
};
