import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Chip, Divider, Stack, Tab, TextField, Tooltip, useMediaQuery } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import styles from './projectNote.module.less';
import ReactMarkdown from 'react-markdown';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import InfoIcon from '@mui/icons-material/Info';

interface IProjectNoteProps {
  message?: string,
  onChange: (note: string) => void,
}

export default function ProjectNote({ message, onChange }: Readonly<IProjectNoteProps>) {
  const ref = useRef<any>(null);
  const lineHeight = 23;
  const [rowCount, setRowCount] = useState(1);
  const [tabIndex, setTabIndex] = useState('1');
  useEffect(() => {
    setRowCount((ref.current?.offsetHeight - (8.5 * 2) - 8) / lineHeight);
  }, []);

  const matchDown = useMediaQuery('@media (max-width:1140px)');

  const lineBreak = `

`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', }}>
      <TabContext value={tabIndex}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', width: '100%' }}>
          <TabList
            onChange={(e, index) => setTabIndex(index)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Просмотр"
              value="1"
            />
            <Tab
              label="Редактирование"
              value="2"
            />
          </TabList>
          <Tooltip title={matchDown ? 'Поддерживаются стили Markdown' : ''}>
            <a
              href="https://www.markdownguide.org/basic-syntax/"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Chip
                icon={<InfoIcon />}
                label={matchDown ? '' : 'Поддерживаются стили Markdown'}
                variant="outlined"
                className={styles.info}
                style={{ border: 'none', cursor: 'pointer' }}
              />
            </a>
          </Tooltip>
        </div>
        <Divider />
        <Stack
          ref={ref}
          direction="column"
          flex="1"
          display="flex"
          spacing={1}
          height={'100%'}
        >
          <TabPanel className={styles.tabPanel} value="1" >
            <div className={styles.message}>
              <CustomizedScrollBox>
                <ReactMarkdown className={styles.markdown}>
                  {message?.replaceAll('\n', lineBreak) ?? ''}
                </ReactMarkdown>
              </CustomizedScrollBox>
            </div>
          </TabPanel>
          <TabPanel className={styles.tabPanel} value="2" >
            <TextField
              style={{
                borderRadius: '15px',
                width: '100%',
                fontSize: '20px !important',
                height: '100%',
                maxHeight: '100%'
              }}
              rows={rowCount}
              name="message"
              onChange={(e) => onChange(e.target.value)}
              value={message ?? ''}
              multiline
            />
          </TabPanel>
        </Stack>
      </TabContext>
    </div>
  );
}
