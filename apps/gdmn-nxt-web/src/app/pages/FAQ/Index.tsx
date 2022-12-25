import { CardContent, Grid } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CardHeader, Typography, Divider, Button, IconButton } from '@mui/material';
import style from './faq.module.less';
import * as React from 'react';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import PerfectScrollbar from 'react-perfect-scrollbar';
import CustomizedCard from '../../components/Styled/customized-card/customized-card';
import EditIcon from '@mui/icons-material/Edit';
import Popup from './popup/popup';
import { faq } from '../../features/FAQ/faqSlice';

export default function FAQ() {
  const faqs:faq[] = useSelector((state:RootState) => state.faq.faqs);
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [isOpenedEditPopup, setIsOpenedEditPopup] = React.useState<boolean>(false);
  const [isOpenedAddPopup, setIsOpenedAddPopup] = React.useState<boolean>(false);
  const [index, setIndex] = React.useState<number>(0);

  const handleOpenAddPopup = () => {
    setIsOpenedAddPopup(true);
  };

  const handleCloseAddPopup = ():void => {
    setIsOpenedAddPopup(false);
  };

  const handleOpenEditPopup = (index:number) => () => {
    setIsOpenedEditPopup(true);
    setIndex(index);
  };

  const handleCloseEditPopup = () => {
    setIsOpenedEditPopup(false);
  };

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
      <Popup close={handleCloseEditPopup} isOpened={isOpenedEditPopup} isAddPopup={false} index={index}/>
      <Popup close={handleCloseAddPopup} isOpened={isOpenedAddPopup} isAddPopup={true}/>
      <div className={style.body} >
        <CustomizedCard borders boxShadows>
          <CardHeader
            title={
              <div className={style.title}>
                <Typography variant="h3">
                  Часто задаваемые вопросы
                </Typography>
                <Button variant="contained" onClick={handleOpenAddPopup}>Добавить</Button>
              </div>
            }
          />
          <Divider/>
          <CardContent className={style.scrollBarContainer}>
            <PerfectScrollbar className={style.scrollBar}>
              <Grid item xs={12}>
                {
                  faqs.map(item =>
                    <div key={faqs.indexOf(item)}>
                      {faqs.indexOf(item) !== 0 && <Divider/>}
                      <div className={style.faqList}>
                        <Accordion
                          expanded={expanded === `panel${faqs.indexOf(item)}`}
                          onChange={handleChange(`panel${faqs.indexOf(item)}`)}
                          className={style.accordion}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                          >
                            <ReactMarkdown >
                              {
                                item.question
                              }

                            </ReactMarkdown>
                          </AccordionSummary>
                          <AccordionDetails className={style.answerField}>
                            <ReactMarkdown >
                              {
                                item.answer
                              }
                            </ReactMarkdown>
                          </AccordionDetails>
                        </Accordion>
                        <div>
                          <IconButton
                            className={style.changeButton}
                            onClick={handleOpenEditPopup(faqs.indexOf(item))}
                            aria-label="Изменить"
                          >
                            <EditIcon />
                          </IconButton>
                        </div>
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