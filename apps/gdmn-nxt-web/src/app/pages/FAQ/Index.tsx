import { Grid } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CardHeader, Typography, Divider, Button } from '@mui/material';
import style from './faq.module.less';
import * as React from 'react';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import NewFaqForm from './newFaqForm/newFaqForm';
import EditFaqForm from './editFaqForm/editFaqForm';
import ReactMarkdown from 'react-markdown';
import PerfectScrollbar from 'react-perfect-scrollbar';

export default function FAQ() {
  const faqs = useSelector((state:RootState) => state.faq.faqs);
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
        <div className={style.container}>
          <CardHeader title={<Typography variant="h3">Часто задаваемые вопросы</Typography>} />
          <PerfectScrollbar style={{ padding: '16px 24px', height: '86.7%' }}>
            <Divider style={{ width: '100%' }}/>
            <Grid item xs={12}>
              {
                faqs.map(item => <>
                  <Accordion expanded={expanded === `panel${faqs.indexOf(item) + 1}`} onChange={handleChange(`panel${item.num}`)}>
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
                        <Button variant="contained" onClick={handleOpenEditPopup(faqs.indexOf(item))}>Изменить</Button>
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
                </>
                )
              }
            </Grid>
            <div className={style.addButton}>
              <Button variant="contained" style={{ marginTop: '30px' }} onClick={handleOpenAddPopup}>Добавить</Button>
            </div>
          </PerfectScrollbar>
        </div>
      </div>
    </>
  );
};