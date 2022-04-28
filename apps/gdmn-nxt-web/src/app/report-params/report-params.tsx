import './report-params.module.less';
import {
  Dialog,
  DialogTitle,
  TextField,
  DialogContent,
  DialogActions,
  Button,
  Slide,
  Stack} from '@mui/material';
import { forwardRef, ReactElement, Ref } from 'react';
import { useStyles } from './styles';
import { TransitionProps } from '@mui/material/transitions';
import { Form, FormikProvider, useFormik } from 'formik';


const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: Ref<unknown>,
) {
  return <Slide direction="down" ref={ref} {...props} />;
});


export interface ReportParamsProps {
  open: boolean;
  params: {[key: string]: any}
  onCancelClick: () => void;
  onSubmit: (values: any) => void;
}

export function ReportParams(props: ReportParamsProps) {
  const { open } = props;
  const { onCancelClick, onSubmit } = props;
  const { params } = props;

  const classes = useStyles();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      ...params,
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>Введите параметры</DialogTitle>
      <DialogContent dividers>
        <FormikProvider value={formik}>
          <Form id="mainForm" onSubmit={formik.handleSubmit}>
            <Stack direction="column" spacing={3}>
              {Object.keys(params).map((param, index) =>
                <TextField
                  key={index}
                  fullWidth
                  label={param.toUpperCase()}
                  type="text"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  name={param}
                  value={formik.values[param]}
                />
              )}
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions className={classes.dialogAction} >
        <Button
          className={classes.button}
          onClick={onCancelClick}
          form="mainForm"
          type="reset"
          variant="text"
          color="primary"
        >
            Отменить
        </Button>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          form="mainForm"
          type="submit"
        >
            OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReportParams;
