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
import ReactMarkdown from 'react-markdown';

export default function FAQ() {
  const faqs = useSelector((state:RootState) => state.faq.faqs);

  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
  return (
    <div className={style.body}>
      <Grid container spacing={3}>
        <CardHeader title={<Typography variant="h3">Часто задаваемые вопросы</Typography>} />
        <Divider style={{ width: '1159px' }}/>
        <Grid item xs={12}>
          {
            faqs.map(item => <>
              <Accordion expanded={expanded === `panel${item.num}`} onChange={handleChange(`panel${item.num}`)}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>{item.question}</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ backgroundColor: 'rgb(245, 245, 245)' }} >
                  <Typography>
                    <ReactMarkdown>
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
          <NewFaqForm/>
        </Grid>
      </Grid>
    </div>
  );
};