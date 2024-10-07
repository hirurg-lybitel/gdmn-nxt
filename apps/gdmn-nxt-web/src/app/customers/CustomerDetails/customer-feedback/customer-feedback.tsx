import { Timeline, timelineOppositeContentClasses } from '@mui/lab';
import { useAddFeedbackMutation, useDeleteFeedbackMutation, useGetFeedbackByCustomerQuery, useUpdateFeedbackMutation } from '../../../features/customer-feedback';
import {
  Box,
  Stack,
  TextField,
  Button,
  Tooltip,
  CardContent,
  Autocomplete
} from '@mui/material';
import { useReducer, useRef } from 'react';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { CustomerFeedbackType, ICustomerFeedback } from '@gsbelarus/util-api-types';
import SendIcon from '@mui/icons-material/Send';
import { FeedbackItem } from './feedback-item';
import { useGetClientHistoryTypeQuery } from '../../../features/kanban/kanbanCatalogsApi';
import CircularIndeterminate from '@gdmn-nxt/components/helpers/circular-indeterminate/circular-indeterminate';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';

export interface CustomerFeedbackProps {
  customerId: number
}

export function CustomerFeedback({
  customerId
}: CustomerFeedbackProps) {
  const {
    data: historyType = [],
    isFetching: historyTypeIsFetching
  } = useGetClientHistoryTypeQuery();
  const {
    data: feedback = [],
    isLoading: feedbackIsLoading
  } = useGetFeedbackByCustomerQuery(
    customerId,
    {
      refetchOnMountOrArgChange: true,
      skip: customerId <= 0 || isNaN(customerId)
    });

  const [addFeedback] = useAddFeedbackMutation();
  const [updateFeedback] = useUpdateFeedbackMutation();
  const [deleteFeedback] = useDeleteFeedbackMutation();

  const responseRef = useRef<HTMLTextAreaElement | null>(null);
  const todoRef = useRef<HTMLTextAreaElement | null>(null);
  const typeRef = useRef<HTMLTextAreaElement | null>(null);

  const [sendDisabled, setSendDisabled] = useReducer((_: any, d: boolean) => d, true);

  const sendFeedback = () => {
    const response = responseRef.current?.value ?? '';
    const toDo = todoRef.current?.value ?? '';

    const type = (() => {
      switch (typeRef.current?.value) {
        case 'E-mail рассылка':
          return CustomerFeedbackType.email;
        case 'Посещение':
          return CustomerFeedbackType.visit;
        case 'Звонок':
          return CustomerFeedbackType.call;
        case 'Эл. письмо':
          return CustomerFeedbackType.chat;
        case 'Заявка':
          return CustomerFeedbackType.request;
        default:
          return CustomerFeedbackType.chat;
      }
    })();

    addFeedback({
      type,
      response,
      toDo,
      customer: {
        ID: customerId,
        NAME: ''
      }
    });

    if (responseRef.current) {
      responseRef.current.value = '';
    }

    if (todoRef.current) {
      todoRef.current.value = '';
    }

    if (typeRef.current) {
      typeRef.current.value = '';
    }
  };

  const saveFeedback = (feedback: ICustomerFeedback) => {
    updateFeedback(feedback);
  };

  const removeFeedback = (id: number) => () => {
    deleteFeedback(id);
  };

  if (feedbackIsLoading) {
    return (
      <CircularIndeterminate open size={80} />
    );
  }

  return (
    <Stack flex={1} spacing={2}>
      <CustomizedScrollBox>
        <Timeline
          sx={{
            padding: 0,
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.1,
            },
          }}
        >
          {feedback.map((f, idx) => (
            <FeedbackItem
              key={idx}
              feedback={f}
              isLast={idx === feedback.length - 1}
              onSave={saveFeedback}
              onDelete={removeFeedback(f.ID)}
            />))}
        </Timeline>
      </CustomizedScrollBox>
      <CustomizedCard
        borders
        boxShadows
        style={{ minHeight: 138 }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row">
              <Autocomplete
                size="small"
                style={{
                  width: '250px'
                }}
                options={historyType}
                loading={historyTypeIsFetching}
                getOptionLabel={(option) => option.NAME}
                onChange={(e, v) => setSendDisabled(!v)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Тип"
                    inputRef={typeRef}
                  />
                )}
              />
              <Box flex={1} />
              <Tooltip arrow title={sendDisabled ? 'Не выбран тип' : ''}>
                <Box alignContent={'center'}>
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={sendFeedback}
                    disabled={sendDisabled}
                  >
                    Добавить
                  </Button>
                </Box>
              </Tooltip>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                inputRef={responseRef}
                label="Ответ клиента"
                type="text"
                multiline
                maxRows={3}
                fullWidth
                name="response"
              />
              <TextField
                inputRef={todoRef}
                label="Дальнейшие действия"
                type="text"
                multiline
                maxRows={3}
                fullWidth
                name="toDo"
              />

            </Stack>
          </Stack>
        </CardContent>
      </CustomizedCard>
    </Stack>
  );
}
