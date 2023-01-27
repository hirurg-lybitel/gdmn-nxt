import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Slide, Stack, TextField, Theme } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { forwardRef, ReactElement, Ref, useCallback, useEffect, useState } from 'react';
import styles from './label-list-item-edit.module.less';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { ILabel } from '@gsbelarus/util-api-types';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import { TwitterPicker } from 'react-color';
import LabelMarker from '../label-marker/label-marker';


const useStyles = makeStyles(() => ({
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    width: '30vw',
    minWidth: 330,
    maxWidth: '100%',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  button: {
    width: '120px',
  },
}));

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

export interface LabelListItemEditProps {
  open: boolean;
  label?: ILabel;
  onSubmit: (lable: ILabel) => void;
  onCancelClick: () => void;
};

export function LabelListItemEdit(props: LabelListItemEditProps) {
  const { open, label } = props;
  const { onSubmit, onCancelClick } = props;

  const classes = useStyles();

  const [selectColor, setSelectColor] = useState(false);

  const initValue: ILabel = {
    ID: label?.ID || 0,
    USR$NAME: label?.USR$NAME || '',
    USR$DESCRIPTION: label?.USR$DESCRIPTION || '',
    USR$COLOR: label?.USR$COLOR || ''
  };

  const formik = useFormik<ILabel>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...label,
      ...initValue
    },
    validationSchema: yup.object().shape({
      USR$NAME: yup.string().required('').max(40, 'Слишком длинное наименование'),
      USR$DESCRIPTION: yup.string().max(40, 'Слишком длинное описание'),
    }),
    onSubmit: (value) => {
      if (!confirmOpen) {
        setConfirmOpen(true);
        return;
      };
      setConfirmOpen(false);
    }
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const onCancel = () => {
    onCancelClick();
  };

  const handleConfirmOkClick = useCallback(() => {
    setConfirmOpen(false);
    onSubmit(formik.values);
  }, [formik.values]);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  return (
    <Dialog
      open={open}
      classes={{ paper: classes.dialog }}
      TransitionComponent={Transition}
    >
      <DialogTitle>
        {label ? `Редактирование: ${label.USR$NAME}` : 'Добавление'}
      </DialogTitle>
      <DialogContent dividers>
        <FormikProvider value={formik}>
          <Form id="mainForm" onSubmit={formik.handleSubmit}>
            <Stack direction="column" spacing={3}>
              <LabelMarker label={formik.values} />
              <TextField
                label="Наименование"
                type="text"
                required
                autoFocus
                name="USR$NAME"
                // onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.USR$NAME}
                error={getIn(formik.touched, 'USR$NAME') && Boolean(getIn(formik.errors, 'USR$NAME'))}
                helperText={getIn(formik.touched, 'USR$NAME') && getIn(formik.errors, 'USR$NAME')}
              />
              <Stack spacing={0.5}>
                <TextField
                  label="Цвет"
                  type="text"
                  inputProps={{
                    readOnly: true
                  }}
                  onSelect={() => setSelectColor(true)}
                  value={formik.values.USR$COLOR}
                  helperText={formik.errors.USR$COLOR}
                />
                {selectColor &&
                  <TwitterPicker
                    color={formik.values.USR$COLOR}
                    onChange={(color) => {
                      formik.setFieldValue('USR$COLOR', color.hex);
                      setSelectColor(false);
                    }}
                  />
                }
              </Stack>
              <TextField
                label="Описание"
                type="text"
                name="USR$DESCRIPTION"
                multiline
                minRows={4}
                // onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.USR$DESCRIPTION}
                error={getIn(formik.touched, 'USR$DESCRIPTION') && Boolean(getIn(formik.errors, 'USR$DESCRIPTION'))}
                helperText={getIn(formik.touched, 'USR$DESCRIPTION') && getIn(formik.errors, 'USR$DESCRIPTION')}
              />
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        <Box flex={1}/>
        <Button
          className={classes.button}
          onClick={onCancel}
          variant="text"
          color="primary"
        >
            Отменить
        </Button>
        <Button
          className={classes.button}
          type="submit"
          form="mainForm"
          variant="contained"
        >
            Сохранить
        </Button>
      </DialogActions>
      <ConfirmDialog
        open={confirmOpen}
        title="Сохранение"
        text="Вы уверены, что хотите продолжить?"
        confirmClick={handleConfirmOkClick}
        cancelClick={handleConfirmCancelClick}
      />
    </Dialog>
  );
}

export default LabelListItemEdit;
