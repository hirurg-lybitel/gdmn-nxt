import { Grid } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CardHeader, Typography, Divider, Button, IconButton } from '@mui/material';
import style from './faq.module.less';
import * as React from 'react';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import NewFaqForm from './newFaqForm/newFaqForm';
import EditFaqForm from './editFaqForm/editFaqForm';
import ReactMarkdown from 'react-markdown';
import PerfectScrollbar from 'react-perfect-scrollbar';
import CustomizedCard from '../../components/Styled/customized-card/customized-card';
import EditIcon from '@mui/icons-material/Edit';

export default function FAQ() {
  const faqs:any[] = useSelector((state:RootState) => state.faq.faqs);
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [isOpenedEditPopup, setIsOpenedEditPopup] = React.useState<boolean>(false);
  const [isOpenedAddPopup, setIsOpenedAddPopup] = React.useState<boolean>(false);
  const [index, setIndex] = React.useState<number>(0);

  const handleOpenAddPopup = () => {
    setIsOpenedAddPopup(true);
  };

  const handleCloseAddPopup = () => {
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
      <EditFaqForm close={handleCloseEditPopup} isOpened={isOpenedEditPopup} index={index}/>
      <NewFaqForm close={handleCloseAddPopup} isOpened={isOpenedAddPopup}/>
      <div className={style.body} >
        <CustomizedCard borders boxShadows className={style.container}>
          <CardHeader
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h3">
                  Часто задаваемые вопросы
                </Typography>
                <Button variant="contained" onClick={handleOpenAddPopup}>Добавить</Button>
              </div>
            }
          />
          <Divider/>
          <PerfectScrollbar style={{ padding: '16px 24px', height: '85%' }}>
            <Grid item xs={12}>
              {
                faqs.map(item =>
                  <div key={faqs.indexOf(item)} className={style.faqList}>
                    <Accordion
                      expanded={expanded === `panel${faqs.indexOf(item)}`}
                      onChange={handleChange(`panel${faqs.indexOf(item)}`)}
                      style={{ width: '100%' }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography>
                          <ReactMarkdown >
                            {
                              item.question
                            }

                          </ReactMarkdown>

                        </Typography>

                      </AccordionSummary>
                      <AccordionDetails className={style.answerField}>
                        <Typography>
                          <ReactMarkdown >
                            {
                              item.answer
                            }
                          </ReactMarkdown>
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                    <div>
                      <IconButton style={{ marginTop: '20px' }} onClick={handleOpenEditPopup(faqs.indexOf(item))} aria-label="Изменить">
                        <EditIcon />
                      </IconButton>
                    </div>
                  </div>
                )
              }
            </Grid>
          </PerfectScrollbar>
        </CustomizedCard>
      </div>
    </>
  );
};