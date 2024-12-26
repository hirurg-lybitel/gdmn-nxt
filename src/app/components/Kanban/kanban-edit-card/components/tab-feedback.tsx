import { Box, Stack, TextField } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers-pro';
import { FormikProps } from 'formik';
import { IKanbanCard } from '@gsbelarus/util-api-types';

interface TabFeedbackProps {
  formik: FormikProps<IKanbanCard>;
}

export function TabFeedback({ formik }: TabFeedbackProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Stack flex={1} spacing={2} paddingTop={1} maxWidth={600}>
        <DesktopDatePicker
          label="Дата опроса"
          value={
            formik.values.DEAL?.USR$FEEDBACK_DATE
              ? new Date(formik.values.DEAL?.USR$FEEDBACK_DATE)
              : null
          }
          format="dd.MM.yyyy"
          onChange={(value) => {
            formik.setFieldValue('DEAL', {
              ...formik.values.DEAL,
              USR$FEEDBACK_DATE: value ? value : null
            });
          }}
          slotProps={{ textField: { variant: 'outlined' } }}
        />
        <TextField
          label="Ответ специалиста"
          type="text"
          multiline
          minRows={4}
          name="DEAL.USR$FEEDBACK_RESPONSE"
          onChange={(e) => {
            formik.setFieldValue('DEAL', {
              ...formik.values.DEAL,
              USR$FEEDBACK_RESPONSE: e.target.value
            });
          }}
          value={formik.values.DEAL?.USR$FEEDBACK_RESPONSE || ''}
        />
        <TextField
          label="Предложения по улучшению качества обслуживания"
          type="text"
          multiline
          minRows={4}
          name="DEAL.USR$FEEDBACK_SUGGESTIONS"
          onChange={(e) => {
            formik.setFieldValue('DEAL', {
              ...formik.values.DEAL,
              USR$FEEDBACK_SUGGESTIONS: e.target.value
            });
          }}
          value={formik.values.DEAL?.USR$FEEDBACK_SUGGESTIONS || ''}
        />
      </Stack>
    </Box>
  );
}

export default TabFeedback;
