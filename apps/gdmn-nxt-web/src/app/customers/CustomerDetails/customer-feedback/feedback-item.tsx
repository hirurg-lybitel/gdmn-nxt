import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { CustomerFeedbackType, ICustomerFeedback } from '@gsbelarus/util-api-types';
import { TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineOppositeContent, TimelineSeparator } from '@mui/lab';
import {
  Accordion as MuiAccordion,
  AccordionDetails as MuiAccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  AccordionProps,
  styled,
  AccordionSummaryProps,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import dayjs from '@gdmn-nxt/dayjs';
import { Form, FormikProvider, useFormik } from 'formik';
import { SyntheticEvent, useRef, useState } from 'react';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MessageIcon from '@mui/icons-material/Message';
import EmailIcon from '@mui/icons-material/Email';
import PlaceIcon from '@mui/icons-material/Place';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import ChatIcon from '@mui/icons-material/Chat';
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion
    disableGutters
    elevation={0}
    {...props}
  />
))(({ theme }) => ({
  // border: `1px solid ${theme.palette.divider}`,
  // '&:not(:last-child)': {
  //   borderBottom: 0,
  // },
  // '&::before': {
  //   display: 'none',
  // },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: 'var(--color-card-bg)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
  '.StyledDeleteButton': {
    position: 'absolute',
    top: 0,
    right: '16px',
    alignSelf: 'anchor-center',
    display: 'none',
  },
  ':hover .StyledDeleteButton': {
    display: 'inline-flex'
  },
  ':hover .ExtraInfo': {
    display: 'none'
  }
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  // borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

interface FeedbackItemProps {
  feedback: ICustomerFeedback,
  isLast?: boolean,
  onSave: (newFeedback: ICustomerFeedback) => void;
  onDelete: () => void;
}

export const FeedbackItem = ({
  feedback,
  isLast = false,
  onSave,
  onDelete
}: FeedbackItemProps) => {
  const {
    creationDate,
    type,
    mailing,
  } = feedback;
  const [expanded, setExpanded] = useState<boolean>(false);

  const responseRef = useRef<HTMLTextAreaElement | null>(null);
  const todoRef = useRef<HTMLTextAreaElement | null>(null);

  const userPermissions = usePermissions();

  const handleChange = (event: SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded);
  };

  const initValue = {
    response: feedback.response ?? '',
    toDo: feedback.toDo ?? '',
  };

  const formik = useFormik<ICustomerFeedback>({
    enableReinitialize: true,
    initialValues: {
      ...feedback,
      ...initValue
    },
    onSubmit: (values) => {
      onSave(values);
    }
  });

  const onSubmitClick = () => {
    formik.submitForm();
  };

  const handleStopPropagation = (e: SyntheticEvent) => {
    e.stopPropagation();
  };

  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <TimelineItem>
      <TimelineOppositeContent sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', minWidth: '112px' }}>
        <Typography variant="body2" color="textSecondary">
          {dayjs(creationDate).format('MMM D, YYYY')}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
        >
          {dayjs(creationDate).format('H:mm')}
        </Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot color="primary">
          {(() => {
            switch (type) {
              case CustomerFeedbackType.email:
                return <EmailIcon />;
              case CustomerFeedbackType.visit:
                return <PlaceIcon />;
              case CustomerFeedbackType.call:
                return <PhoneInTalkIcon />;
              case CustomerFeedbackType.chat:
                return <ChatIcon />;
              case CustomerFeedbackType.request:
                return <InstallDesktopIcon />;
              default:
                return <MessageIcon />;
            }
          })()}
        </TimelineDot>
        <TimelineConnector hidden={isLast} />
      </TimelineSeparator>
      <TimelineContent sx={{ pt: 0, pb: 2 }}>
        <CustomizedCard sx={{ boxShadow: 3 }}>
          <Accordion expanded={expanded} onChange={handleChange}>
            <AccordionSummary>
              <Stack direction="row" flex={1}>
                <Stack>
                  <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
                    {(() => {
                      switch (type) {
                        case CustomerFeedbackType.email:
                          return `E-mail рассылка '${mailing?.NAME}'`;
                        case CustomerFeedbackType.visit:
                          return 'Посещение';
                        case CustomerFeedbackType.call:
                          return 'Звонок';
                        case CustomerFeedbackType.chat:
                          return 'Эл. письмо';
                        case CustomerFeedbackType.request:
                          return 'Заявка с сайта';
                        default:
                          return 'Иное';
                      }
                    })()}
                  </Typography>
                  {matchDownSm && <Typography variant="caption">{feedback?.creator?.CONTACT?.NAME}</Typography>}
                </Stack>
                <Box flex={1} />
                {matchDownSm ? (
                  <Stack textAlign="right">
                    <Typography variant="caption">{dayjs(creationDate).format('MMM D, YYYY')}</Typography>
                    <Typography variant="caption">{dayjs(creationDate).format('H:mm')}</Typography>
                  </Stack>
                ) : (
                  <Typography className="ExtraInfo" variant="caption">{feedback?.creator?.CONTACT?.NAME}</Typography>
                )}
                {!matchDownSm && (
                  <PermissionsGate actionAllowed={userPermissions?.feedback?.DELETE}>
                    <div onClick={handleStopPropagation}>
                      <ItemButtonDelete button onClick={onDelete} />
                    </div>
                  </PermissionsGate>
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <FormikProvider value={formik}>
                <Form id="contactFeedbackForm" onSubmit={formik.handleSubmit}>
                  <Stack spacing={2}>
                    <Stack
                      flex={1}
                      direction={matchDownSm ? 'column' : 'row'}
                      spacing={2}
                    >
                      <TextField
                        inputRef={responseRef}
                        label="Ответ клиента"
                        type="text"
                        multiline
                        maxRows={5}
                        fullWidth
                        name="response"
                        onChange={formik.handleChange}
                        value={formik.values.response}
                      />
                      <TextField
                        inputRef={todoRef}
                        label="Дальнейшие действия"
                        type="text"
                        multiline
                        maxRows={5}
                        fullWidth
                        name="toDo"
                        onChange={formik.handleChange}
                        value={formik.values.toDo}
                      />
                    </Stack>
                    <Stack direction="row">
                      {matchDownSm && (
                        <PermissionsGate actionAllowed={userPermissions?.feedback?.DELETE}>
                          <div onClick={handleStopPropagation}>
                            <ItemButtonDelete button onClick={onDelete} />
                          </div>
                        </PermissionsGate>
                      )}
                      <Box flex={1} />
                      <Button
                        variant="contained"
                        onClick={onSubmitClick}
                        disabled={!formik.dirty}
                      >
                        Сохранить
                      </Button>
                    </Stack>
                  </Stack>
                </Form>
              </FormikProvider>
            </AccordionDetails>
          </Accordion>
        </CustomizedCard>
      </TimelineContent >
    </TimelineItem >
  );
};
