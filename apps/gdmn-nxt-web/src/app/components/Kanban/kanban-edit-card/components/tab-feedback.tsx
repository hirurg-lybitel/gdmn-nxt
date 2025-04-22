import { Box, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Autocomplete, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers-pro';
import { FormikProps } from 'formik';
import { IKanbanCard } from '@gsbelarus/util-api-types';
import { useGetFeedbackCompetencesQuery, useGetFeedbackResultsQuery, useGetFeedbackSatisfactionRatesQuery, useGetFeedbackSatisfactionsQuery } from 'apps/gdmn-nxt-web/src/app/features/deal-feedback';
import { useEffect } from 'react';

interface TabFeedbackProps {
  formik: FormikProps<IKanbanCard>;
}

export function TabFeedback({ formik }: Readonly<TabFeedbackProps>) {
  const { data: feedbackResults = [] } = useGetFeedbackResultsQuery();
  const { data: feedbackCompetences = [] } = useGetFeedbackCompetencesQuery();
  const { data: feedbackSatisfactions = [] } = useGetFeedbackSatisfactionsQuery();
  const { data: feedbackSatisfactionRate = [] } = useGetFeedbackSatisfactionRatesQuery();

  useEffect(() => {
    if (!formik.values.DEAL?.feedback) {
      return;
    }

    if (formik.values.DEAL?.feedback?.dealId) {
      return;
    }

    formik.setFieldValue(
      'DEAL',
      {
        ...formik.values.DEAL,
        feedback: {
          ...formik.values.DEAL?.feedback,
          dealId: formik.values.DEAL?.ID
        }
      }
    );
  }, [formik, formik.values.DEAL?.feedback]);


  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        '& .MuiAutocomplete-root .MuiFormLabel-root': {
          paddingRight: '29px'
        }
      }}
    >
      <Stack
        flex={1}
        spacing={2}
        paddingTop={1}
        maxWidth={600}
      >
        <Stack direction="row" spacing={2}>
          <DatePicker
            label="Дата опроса"
            name="DEAL.feedback.date"
            value={formik.values.DEAL?.feedback?.date ? new Date(formik.values.DEAL?.feedback?.date) : null}
            format="dd.MM.yyyy"
            onChange={(value) => {
              formik.setFieldValue(
                'DEAL',
                {
                  ...formik.values.DEAL,
                  feedback: {
                    ...formik.values.DEAL?.feedback,
                    date: value?.toISOString()
                  }
                }
              );
            }}
          />

          <Autocomplete
            fullWidth
            options={feedbackSatisfactionRate}
            value={formik.values.DEAL?.feedback?.satisfactionRate ?? null}
            getOptionLabel={(option) => option.name}
            onChange={(e, value) => {
              formik.setFieldValue(
                'DEAL',
                { ...formik.values.DEAL, feedback: { ...formik.values.DEAL?.feedback, satisfactionRate: value } }
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Оценка удовлетворённости"
              />
            )}
          />
        </Stack>

        <Autocomplete
          fullWidth
          options={feedbackSatisfactions}
          getOptionLabel={(option) => option.name}
          value={formik.values.DEAL?.feedback?.satisfaction ?? null}
          onChange={(e, value) => {
            formik.setFieldValue(
              'DEAL',
              { ...formik.values.DEAL, feedback: { ...formik.values.DEAL?.feedback, satisfaction: value } }
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Удовлетворён ли клиент полнотой полученной информации"
            />
          )}
        />


        <Autocomplete
          fullWidth
          options={feedbackCompetences}
          getOptionLabel={(option) => option.name}
          value={formik.values.DEAL?.feedback?.competence ?? null}
          onChange={(e, value) => {
            formik.setFieldValue(
              'DEAL',
              { ...formik.values.DEAL, feedback: { ...formik.values.DEAL?.feedback, competence: value } }
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Оцените компетентность персонала"
            />
          )}
        />

        <Stack direction="row" spacing={2}>
          <Autocomplete
            fullWidth
            options={feedbackResults}
            getOptionLabel={(option) => option.name}
            value={formik.values.DEAL?.feedback?.result ?? null}
            onChange={(e, value) => {
              formik.setFieldValue(
                'DEAL',
                { ...formik.values.DEAL, feedback: { ...formik.values.DEAL?.feedback, result: value } }
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Обратная связь"
              />
            )}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.DEAL?.feedback?.replyEmail ?? false}
                onChange={e => formik.setFieldValue(
                  'DEAL',
                  { ...formik.values.DEAL, feedback: { ...formik.values.DEAL?.feedback, replyEmail: e.target.checked } }
                )}
              />
            }
            label={
              <Typography width={'max-content'} variant="body2">
                Ответ по e-mail
              </Typography>
            }
          />
        </Stack>

        <TextField
          label="Ответ специалиста"
          type="text"
          multiline
          minRows={4}
          name="DEAL.feedback.response"
          onChange={(e) => {
            formik.setFieldValue(
              'DEAL',
              { ...formik.values.DEAL, feedback: { ...formik.values.DEAL?.feedback, response: e.target.value } }
            );
          }}
          value={formik.values.DEAL?.feedback?.response ?? ''}
        />

        <TextField
          label="Предложения по улучшению качества обслуживания"
          type="text"
          multiline
          minRows={4}
          name="DEAL.feedback.suggestion"
          onChange={(e) => {
            formik.setFieldValue(
              'DEAL',
              { ...formik.values.DEAL, feedback: { ...formik.values.DEAL?.feedback, suggestion: e.target.value } }
            );
          }}
          value={formik.values.DEAL?.feedback?.suggestion ?? ''}
        />
      </Stack>
    </Box>
  );
}

export default TabFeedback;
