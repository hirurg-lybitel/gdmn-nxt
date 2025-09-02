import { Box, CardContent, Stack } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Typography, Divider, Skeleton } from '@mui/material';
import style from './faq.module.less';
import * as React from 'react';
import { useState, useMemo } from 'react';
import CustomizedCard from '../../components/Styled/customized-card/customized-card';
import Popup from './popup/popup';
import { faqApi, fullFaq } from '../../features/FAQ/faqApi';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import PermissionsGate from '../../components/Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';
import CustomMarkdown from '@gdmn-nxt/components/Styled/custom-markdown/custom-markdown';

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

  const handleDeleteClick = (deletedFaq: fullFaq) => () => {
    deleteFaqHandler(deletedFaq.ID);
  };

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

  const buttons = userPermissions?.faq.PUT || userPermissions?.faq.DELETE;

  return (
    <>
      {!componentIsFetching &&
        <>
          <Popup
            close={handleCloseEditPopup}
            open={isOpenedEditPopup}
            isAddPopup={false}
            faq={faq}
            editFaq={editFaqHandler}
          />
          <Popup
            close={handleCloseAddPopup}
            open={isOpenedAddPopup}
            isAddPopup={true}
            addFaq={addFaqHandler}
          />
        </>
      }
      <CustomizedCard sx={{ width: '100%' }}>
        <CustomCardHeader
          title={'База знаний'}
          addButton={userPermissions?.faq.POST}
          isLoading={isLoading}
          isFetching={componentIsFetching || addFaqObj.isLoading}
          onAddClick={handleOpenAddPopup}
          addButtonHint="Добавить запись"
        />
        <Divider />
        <CardContent sx={{ paddingRight: '0' }}>
          <CustomizedScrollBox style={{ paddingRight: '20px' }}>
            {(componentIsFetching ? skeletonFaqsCount : faqs).map(item =>
              <div key={item.ID}>
                {(componentIsFetching ? skeletonFaqsCount : faqs)?.indexOf(item) !== 0 && <Divider />}
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
                    <Accordion
                      expanded={expanded === `panel${item.ID}`}
                      onChange={handleChange(`panel${item.ID}`)}
                      className={classes.accordion}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          '& .MuiAccordionSummary-content': {
                            marginTop: buttons ? { xs: '25px', sm: '12px' } : {},
                          },
                          '& .MuiAccordionSummary-expandIconWrapper': {
                            marginTop: buttons ? { xs: '12.5px', sm: '0px' } : {},
                          }
                        }}
                      >
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          flex={1}
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                        >
                          <Typography variant="h6" sx={{ fontSize: { xs: '15px', sm: '1.25rem' } }}>
                            <CustomMarkdown >
                              {item.USR$QUESTION}
                            </CustomMarkdown >
                          </Typography>
                          <Box flex={1} />
                          {!componentIsFetching &&
                            <Box
                              sx={{
                                display: 'flex',
                                gap: '5px',
                                marginRight: '5px',
                                marginLeft: { xs: 0, sm: '10px' },
                                position: { xs: 'absolute', sm: 'initial' },
                                right: '6px',
                                top: '5px'
                              }}
                            >
                              <PermissionsGate actionAllowed={userPermissions?.faq.PUT}>
                                <ItemButtonEdit
                                  button
                                  className={style.button}
                                  disabled={deleteFaqObj.isLoading || editFaqObj.isLoading}
                                  onClick={handleOpenEditPopup(item)}
                                />
                              </PermissionsGate>
                              <PermissionsGate actionAllowed={userPermissions?.faq.DELETE}>
                                <ItemButtonDelete
                                  button
                                  className={style.button}
                                  disabled={deleteFaqObj.isLoading || editFaqObj.isLoading}
                                  onClick={handleDeleteClick(item)}
                                />
                              </PermissionsGate>
                            </Box>
                          }
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails className={style.details}>
                        <Typography variant="body1" component="div">
                          <CustomMarkdown >
                            {item.USR$ANSWER}
                          </CustomMarkdown >
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
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
