import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, CardContent, Icon, IconButton, InputAdornment, List, ListItem, Stack, SvgIcon, TextField, Tooltip, Typography } from '@mui/material';
import CustomizedScrollBox from '../../../Styled/customized-scroll-box/customized-scroll-box';
import CustomizedCard from '../../../Styled/customized-card/customized-card';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import CallIcon from '@mui/icons-material/Call';
import MessageIcon from '@mui/icons-material/Message';
import TourIcon from '@mui/icons-material/Tour';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LensOutlinedIcon from '@mui/icons-material/LensOutlined';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useGetEmployeesQuery } from 'apps/gdmn-nxt-web/src/app/features/contact/contactApi';
import { IClientHistoryType, IContactWithID, IKanbanCard, IKanbanTask } from '@gsbelarus/util-api-types';
import { useAddClientHistoryMutation, useGetClientHistoryQuery, useGetClientHistoryTypeQuery } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanCatalogsApi';
import { useSelector } from 'react-redux';
import { RootState } from 'apps/gdmn-nxt-web/src/app/store';
import CircularIndeterminate from '../../../helpers/circular-indeterminate/circular-indeterminate';

interface ClientHistoryProps {
  card?: IKanbanCard;
}

export const ClientHistory = ({ card }: ClientHistoryProps) => {
  const { data: employees = [], isFetching: employeesIsFetching } = useGetEmployeesQuery();
  const { data: historyType = [], isFetching: historyTypeIsFetching } = useGetClientHistoryTypeQuery();
  const { data: clientHistory = [], isFetching: clientHistoryFetching } = useGetClientHistoryQuery(card?.ID ?? -1, {
    refetchOnMountOrArgChange: true
  });
  const [addClientHistory, { isSuccess }] = useAddClientHistoryMutation();

  const contactId = useSelector<RootState, number | undefined>(state => state.user.userProfile?.contactkey);

  useEffect(() => {
    if (!isSuccess) return;

    if (!inputRef.current) return;
    inputRef.current.value = '';
  }, [isSuccess]);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const [message, setMessage] = useState<{
    selectedType: IClientHistoryType | null,
    creator: IContactWithID | null
  }
  >({
    selectedType: null,
    creator: employees.find(e => e.ID === contactId) ?? null
  });

  const sendMessage = () => {
    if (!message.selectedType) return;
    if (!message.creator) return;
    if (!inputRef.current?.value) return;

    addClientHistory({
      CARDKEY: card?.ID ?? -1,
      CREATOR: {
        ...message.creator
      },
      CONTENT: inputRef.current?.value ?? '',
      historyType: {
        ...message.selectedType
      }
    });
  };

  const changeCreator = (e: SyntheticEvent, value: IContactWithID | null) => {
    setMessage(prev => ({ ...prev, creator: value }));
  };
  const changeHistoryType = (e: SyntheticEvent, value: IClientHistoryType | null) => {
    setMessage(prev => ({ ...prev, selectedType: value }));
  };

  return (
    <Stack
      height={'100%'}
      spacing={2}
      display={'flex'}
    >
      <CustomizedCard
        borders
        style={{ flex: 1, paddingTop: '5px', paddingBottom: '5px' }}
        boxShadows
      >
        {clientHistoryFetching
          ? <Box height={'100%'} display="flex">
            <CircularIndeterminate open={true} size={70} />
          </Box>
          : <CustomizedScrollBox>
            {clientHistory.map(d =>
              <Accordion
                key={d.ID}
                defaultExpanded
                TransitionProps={{ unmountOnExit: true }}
                sx={{

                  '&.Mui-expanded': {
                    margin: 0,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  style={{
                    flexDirection: 'row-reverse',
                  }}
                  sx={{
                    height: '50px',
                    '&.Mui-expanded': {
                      margin: 0,
                      minHeight: '50px',
                    },
                  }}
                >
                  <Stack
                    direction={'row'}
                    spacing={1}
                    display={'flex'}
                    flex={1}
                    alignItems={'center'}
                  >
                    <Icon
                      color="action"
                    >
                      {(() => {
                        switch (d.historyType.ICON) {
                          case 1:
                            return <TourIcon />;
                          case 2:
                            return <CallIcon />;
                          case 3:
                            return <MessageIcon />;
                          case 4:
                            return <AssignmentIcon />;
                          case 5:
                            return <EmailIcon />;
                          case 6:
                            return <TaskAltIcon />;
                          default:
                            return <LensOutlinedIcon />;
                        }
                      })()}
                    </Icon>
                    <Stack>
                      <div>
                        {d.historyType.NAME}
                      </div>
                      <Typography
                        variant="caption"
                        color={'GrayText'}
                        maxWidth={'300px'}
                        noWrap
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >{d.CONTENT}</Typography>
                    </Stack>
                    <Box flex={1} />
                    <Stack>
                      {d.CREATIONDATE && <Typography variant="caption" textAlign={'right'}>{new Date(d.CREATIONDATE).toLocaleDateString()}</Typography>}
                      <Typography variant="caption" textAlign={'right'}>{d.CREATOR.NAME}</Typography>
                    </Stack>
                  </Stack>

                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    borderBottom: '1px solid rgba(0, 0, 0, .125)',
                  }}
                >
                  <Typography whiteSpace={'pre-wrap'}>{d.CONTENT}</Typography>
                </AccordionDetails>
              </Accordion>
            )}
          </CustomizedScrollBox>}
      </CustomizedCard>
      <CustomizedCard borders boxShadows>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={'row'} spacing={2}>
              <Autocomplete
                size="small"
                style={{
                  width: '150px'
                }}
                options={historyType}
                loading={historyTypeIsFetching}
                getOptionLabel={(option) => option.NAME}
                onChange={changeHistoryType}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="Тип"
                  />
                )}
              />
              <Autocomplete
                size="small"
                style={{
                  width: '350px'
                }}
                options={employees}
                value={message.creator}
                getOptionLabel={option => option.NAME}
                loading={employeesIsFetching}
                onChange={changeCreator}
                renderOption={(props, option) => (
                  <li {...props} key={option.ID}>
                    {option.NAME}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="От кого"
                  />
                )}
              />
            </Stack>
            <TextField
              inputRef={inputRef}
              multiline
              minRows={1}
              maxRows={5}
              autoFocus
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      arrow
                      placement="left"
                      title={(!message.creator || !message.selectedType) ? 'Не заполнены все реквизиты' : ''}
                    >
                      <div>
                        <IconButton
                          color="primary"
                          onClick={sendMessage}
                          disabled={!message.creator || !message.selectedType || clientHistoryFetching}
                        >
                          <SendIcon />
                        </IconButton>
                      </div>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </CardContent>
      </CustomizedCard>
    </Stack>
  );
};
