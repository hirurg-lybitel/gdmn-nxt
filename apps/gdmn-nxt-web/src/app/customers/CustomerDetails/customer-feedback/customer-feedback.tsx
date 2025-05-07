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
import CircularIndeterminate from '@gdmn-nxt/helpers/circular-indeterminate/circular-indeterminate';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import useUserData from '@gdmn-nxt/helpers/hooks/useUserData';

export interface CustomerFeedbackProps {
  customerId: number,
  data?: ICustomerFeedback[],
  onChange?: (value: ICustomerFeedback[]) => void
}

export function CustomerFeedback({
  customerId,
  data: localData,
  onChange
}: Readonly<CustomerFeedbackProps>) {
  const {
    data: historyType = [],
    isFetching: historyTypeIsFetching
  } = useGetClientHistoryTypeQuery();

  const isLocalProcessing = !!localData;

  const {
    data: feedback = [],
    isLoading: feedbackIsLoading
  } = useGetFeedbackByCustomerQuery(
    customerId,
    {
      refetchOnMountOrArgChange: true,
      skip: customerId <= 0 || isNaN(customerId) || isLocalProcessing
    }
  );

  const [addFeedback] = useAddFeedbackMutation();
  const [updateFeedback] = useUpdateFeedbackMutation();
  const [deleteFeedback] = useDeleteFeedbackMutation();

  const responseRef = useRef<HTMLTextAreaElement | null>(null);
  const todoRef = useRef<HTMLTextAreaElement | null>(null);
  const typeRef = useRef<HTMLTextAreaElement | null>(null);

  const { id: userId = -1 } = useUserData();

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

    const data: ICustomerFeedback = {
      ID: -1,
      type,
      response,
      toDo,
      customer: {
        ID: customerId,
        NAME: ''
      },
      creator: {
        ID: userId,
        NAME: ''
      }
    };

    if (isLocalProcessing) {
      onChange?.([...localData, data]);
    } else {
      addFeedback(data);
    }


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

  const saveFeedback = (idx: number) => (feedback: ICustomerFeedback) => {
    if (isLocalProcessing) {
      const newValue = [...localData];
      newValue[idx] = feedback;
      onChange?.(newValue);

      return;
    }
    updateFeedback(feedback);
  };

  const removeFeedback = (idx: number, id: number) => () => {
    if (isLocalProcessing) {
      const newValue = [...localData];
      newValue.splice(idx, 1);
      onChange?.(newValue);

      return;
    }

    deleteFeedback(id);
  };

  if (feedbackIsLoading) {
    return (
      <CircularIndeterminate open size={80} />
    );
  }

  return (
    <Stack flex={1} spacing={2}>
      <CustomizedCard
        borders
        boxShadows
        style={{ minHeight: 138 }}
      >
        <CardContent style={{ padding: 16 }}>
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
      <CustomizedScrollBox container={{ style: { flex: 1 } }}>
        <Timeline
          sx={{
            padding: 0,
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.1,
            },
          }}
        >
          {(localData ?? feedback).map((f, idx) => (
            <FeedbackItem
              key={idx}
              feedback={f}
              isLast={idx === (localData ?? feedback).length - 1}
              onSave={saveFeedback(idx)}
              onDelete={removeFeedback(idx, f.ID)}
            />))}
        </Timeline>
      </CustomizedScrollBox>
    </Stack>
  );
}
