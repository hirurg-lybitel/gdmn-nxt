import './kanban-edit-card.module.less';
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, Slide, Stack, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { forwardRef, ReactElement, useState } from 'react';
import { TransitionProps } from '@mui/material/transitions';
import { makeStyles } from '@mui/styles';
import { ICard, IColumn } from '../../../pages/Dashboard/deals/deals';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog'


const useStyles = makeStyles((theme) => ({
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    width: 500,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
}));


const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  console.log('Transition', props);
  return <Slide direction="left" ref={ref} {...props} />;
});


export interface KanbanEditCardProps {
  currentStage?: IColumn;
  deal?: ICard;
  stages: IColumn[];
  onSubmit: (arg1: ICard, arg2: boolean) => void;
  onCancelClick: () => void;
}

export function KanbanEditCard(props: KanbanEditCardProps) {
  const { currentStage, deal, stages } = props;
  const { onSubmit, onCancelClick } = props;

  //console.log('deal', deal, (Math.round(deal!.amount || 0 * 100)).toFixed(2));

  const classes = useStyles();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = () => {
    setDeleting(true);
    setConfirmOpen(true);
  };

  const handleCancelClick = () => {
    setDeleting(false);
    formik.resetForm();
    onCancelClick();
  };


  const initValue: ICard = {
    id: deal?.id || 0,
    title: deal?.title || '',
    status: deal?.status || currentStage?.id || -1,
    amount: deal?.amount || undefined,
    customer: deal?.customer || '',
  }

  const formik = useFormik<ICard>({
    enableReinitialize: true,
    initialValues: {
      ...deal,
      ...initValue
    },
    validationSchema: yup.object().shape({
      title: yup.string().required('').max(20, 'Слишком длинное наименование'),
      status: yup.string().required(''),
      customer: yup.string().required(''),
    }),
    onSubmit: (values) => {
      setConfirmOpen(false);
      onSubmit(values, deleting);
    },
  });

  return (
    <Dialog
      //open={open}
      open={true}
      TransitionComponent={Transition}
      classes={{
        paper: classes.dialog
      }}
    >
      <DialogTitle>
         {deal?.id ? `Редактирование ${deal?.title}` : 'Создание сделки'}
      </DialogTitle>
      <DialogContent dividers>
        <FormikProvider value={formik}>
            <Form id="mainForm" onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <TextField
                    label="Наименование"
                    type="text"
                    required
                    autoFocus
                    name="title"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.title}
                    helperText={formik.errors.title}
                  />
                <TextField
                    label="Клиент"
                    type="text"
                    required
                    name="customer"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.customer}
                    helperText={formik.errors.customer}
                  />
                  <Autocomplete
                    options={stages?.filter(stage => stage.id !== formik.values.status) || []}
                    getOptionLabel={option => option.title}
                    value={stages?.filter(el => el.id === formik.values.status)[0] || null}
                    onChange={(e, value) => {
                      formik.setFieldValue(
                        "status",
                        value ? value.id : initValue.status
                      );
                    }}
                    renderOption={(props, option) => {
                      return (
                        <li {...props} key={option.id}>
                          {option.title}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        key={params.id}
                        label="Стадия"
                        type="text"
                        name="status"
                        required
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.status}
                        helperText={formik.errors.status}
                        placeholder="Выберите стадию"
                      />
                    )}
                  />
                <TextField
                    label="Сумма"

                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">BYN</InputAdornment>,
                    }}
                    name="amount"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.amount}
                    helperText={formik.errors.amount}
                  />
              </Stack>
            </Form>
          </FormikProvider>
      </DialogContent>
      <DialogActions style={{ display: 'flex' }}>
        <IconButton onClick={handleDeleteClick} size="large" >
            <DeleteIcon />
        </IconButton>
        <Button onClick={handleCancelClick} style={{ marginLeft: 'auto' }}>Отменить</Button>
        <Button
          form="mainForm"
          //type={!formik.isValid ? "submit" : "button"}
          type="submit"
          variant="contained"
          onClick={() => {
            setDeleting(false);
            //setConfirmOpen(formik.isValid);
          }}
        >Сохранить</Button>
      </DialogActions>
      <ConfirmDialog
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title="Удаление"
        text="Вы уверены, что хотите продолжить?"
        onConfirm={formik.handleSubmit}
      />
    </Dialog>
  );
}

export default KanbanEditCard;
