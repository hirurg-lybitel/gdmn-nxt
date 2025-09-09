import { CardContent, Stack } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Typography, Divider, Skeleton } from '@mui/material';
import styles from './faq.module.less';
import { Fragment, useCallback } from 'react';
import { useState, useMemo } from 'react';
import CustomizedCard from '../../components/Styled/customized-card/customized-card';
import Popup from './popup/popup';
import { faqApi, fullFaq } from '../../features/FAQ/faqApi';
import PermissionsGate from '../../components/Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';
import CustomMarkdown from '@gdmn-nxt/components/Styled/custom-markdown/custom-markdown';

export default function FAQ() {
  const { data: faqs = [], isFetching, isLoading } = faqApi.useGetAllfaqsQuery();
  const [expanded, setExpanded] = useState<string | false>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [faq, setFaq] = useState<fullFaq>();
  const [addFaq, { isLoading: addIsLoading }] = faqApi.useAddfaqMutation();
  const [editFaq, { isLoading: editIsLoading }] = faqApi.useEditFaqMutation();
  const [deleteFaq, { isLoading: deleteIsLoading }] = faqApi.useDeleteFaqMutation();
  const userPermissions = usePermissions();

  const addFaqHandler = useCallback((values: fullFaq) => {
    addFaq(values);
  }, [addFaq]);

  const editFaqHandler = useCallback((values: fullFaq) => {
    editFaq([values, values.ID]);
  }, [editFaq]);

  const handleOpenAddPopup = () => {
    setFaq(undefined);
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleOpenEditPopup = (editableFaq: fullFaq) => () => {
    setFaq(editableFaq);
    setOpen(true);
  };

  const handleDeleteClick = useCallback((deletedFaq: fullFaq) => {
    handleClose();
    deleteFaq(deletedFaq.ID);
  }, [deleteFaq]);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const memoPopup = useMemo(() => {
    return (
      <Popup
        close={handleClose}
        open={open}
        addFaq={addFaqHandler}
        faq={faq}
        editFaq={editFaqHandler}
        deleteFaq={handleDeleteClick}
      />
    );
  }, [addFaqHandler, editFaqHandler, faq, handleDeleteClick, open]);

  return (
    <>
      {memoPopup}
      <CustomizedCard sx={{ width: '100%' }}>
        <CustomCardHeader
          title={'База знаний'}
          addButton={userPermissions?.faq.POST}
          isLoading={isLoading}
          isFetching={isFetching}
          onAddClick={handleOpenAddPopup}
          addButtonHint="Добавить вопрос с ответом"
        />
        <Divider />
        <CardContent sx={{ paddingRight: '0' }}>
          <CustomizedScrollBox style={{ paddingRight: '20px' }}>
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
              : faqs.map(faq =>
                <Fragment key={faq.ID}>
                  <Accordion
                    TransitionProps={{ unmountOnExit: true }}
                    expanded={expanded === `panel${faq.ID}`}
                    onChange={handleChange(`panel${faq.ID}`)}
                  >
                    <AccordionSummary
                      className={styles.accordionSummary}
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography variant="subtitle1">{faq.USR$QUESTION}</Typography>
                    </AccordionSummary>
                    <AccordionDetails >
                      <PermissionsGate actionAllowed={userPermissions?.updates.PUT}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" />
                          <ItemButtonEdit
                            button
                            size="small"
                            onClick={handleOpenEditPopup(faq)}
                          />
                        </Stack>
                      </PermissionsGate>
                      <Typography variant="body1" component="div">
                        <CustomMarkdown >
                          {faq.USR$ANSWER}
                        </CustomMarkdown >
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </Fragment>)}
          </CustomizedScrollBox>
        </CardContent>
      </CustomizedCard>
    </>
  );
};
