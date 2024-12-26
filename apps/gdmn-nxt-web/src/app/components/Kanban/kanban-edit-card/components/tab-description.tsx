import { IKanbanCard } from '@gsbelarus/util-api-types';
import { TextField } from '@mui/material';
import { FormikProps, getIn } from 'formik';

interface TabDescriptionProps {
  formik: FormikProps<IKanbanCard>;
};

export function TabDescription(props: TabDescriptionProps) {
  const { formik } = props;

  return (
    <TextField
      sx={{
        height: '100%',
        '& div': {
          height: '100%'
        },
        '& textarea': {
          height: '100% !important'
        }
      }}
      name="DEAL.DESCRIPTION"
      label="Описание"
      type="text"
      multiline
      rows={1}
      fullWidth
      value={formik.values.DEAL?.DESCRIPTION || ''}
      onChange={formik.handleChange}
      error={getIn(formik.touched, 'DEAL.DESCRIPTION') && Boolean(getIn(formik.errors, 'DEAL.DESCRIPTION'))}
      helperText={getIn(formik.touched, 'DEAL.DESCRIPTION') && getIn(formik.errors, 'DEAL.DESCRIPTION')}
    />
  );
}
