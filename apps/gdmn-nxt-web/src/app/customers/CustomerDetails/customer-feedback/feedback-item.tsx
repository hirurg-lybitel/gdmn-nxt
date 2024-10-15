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
} from '@mui/material';
import dayjs from '@gdmn-nxt/dayjs';
import { Form, FormikProvider, useFormik } from 'formik';
import { SyntheticEvent, useRef, useState } from 'react';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MessageIcon from '@mui/icons-material/Message';
import EmailIcon from '@mui/icons-material/Email';
import PlaceIcon from '@mui/icons-material/Place';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import ChatIcon from '@mui/icons-material/Chat';
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
import FeedIcon from '@mui/icons-material/Feed';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import usePermissions from '@gdmn-nxt/components/helpers/hooks/usePermissions';
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
    display: 'none',
    position: 'absolute',
    right: '16px'

  },
  ':hover .StyledDeleteButton': {
    display: 'inline-flex'

  }
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  // borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

interface FeedbackItemProps {
  feedback: ICustomerFeedback,
  isLast?: boolean,
  onSave: (newFeedback: ICustomerFeedback) => void
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

  return (
    <TimelineItem>
      <TimelineOppositeContent>
        <Typography variant="body2" color="textSecondary">
          {dayjs(creationDate).format('MMM D, YYYY')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
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
      <TimelineContent>
        <CustomizedCard sx={{ boxShadow: 3 }}>
          <Accordion expanded={expanded} onChange={handleChange}>
            <AccordionSummary>
              <Typography fontWeight={600}>
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
              <div>
                <Typography variant="caption" style={{ marginLeft: '16px' }}>
                  {feedback?.creator?.CONTACT?.NAME}
                </Typography>
              </div>
              <PermissionsGate actionAllowed={userPermissions?.feedback?.DELETE}>
                <div onClick={handleStopPropagation}>
                  <ItemButtonDelete button onClick={onDelete} />
                </div>
              </PermissionsGate>
            </AccordionSummary>
            <AccordionDetails>
              <FormikProvider value={formik}>
                <Form id="contactFeedbackForm" onSubmit={formik.handleSubmit}>
                  <Stack spacing={2}>
                    <Stack
                      flex={1}
                      direction={'row'}
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
      </TimelineContent>
    </TimelineItem>
  );
};
