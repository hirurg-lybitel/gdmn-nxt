import './kanban-edit-card.module.less';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Slide,
  Stack,
  TextField,
  createFilterOptions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { forwardRef, ReactElement, useState, useEffect } from 'react';
import { TransitionProps } from '@mui/material/transitions';
import { makeStyles } from '@mui/styles';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog'
import { IDeal, IKanbanCard, IKanbanColumn } from '@gsbelarus/util-api-types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { fetchCustomers } from '../../../features/customer/actions';
import { customersSelectors } from '../../../features/customer/customerSlice';
import { ICustomer } from "@gsbelarus/util-api-types";


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
  return <Slide direction="left" ref={ref} {...props} />;
});

const filterOptions = createFilterOptions({
  matchFrom: 'any',
  limit: 500,
  stringify: (option: ICustomer) => option.NAME,
});


export interface KanbanEditCardProps {
  currentStage?: IKanbanColumn;
  card?: IKanbanCard;
  stages: IKanbanColumn[];
  onSubmit: (arg1: IKanbanCard, arg2: boolean) => void;
  onCancelClick: () => void;
}

export function KanbanEditCard(props: KanbanEditCardProps) {
  const { currentStage, card, stages } = props;
  const { onSubmit, onCancelClick } = props;

  //console.log('deal', deal, (Math.round(deal!.amount || 0 * 100)).toFixed(2));

  const classes = useStyles();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dispatch = useDispatch();
  const allCustomers = useSelector(customersSelectors.selectAll);
  const { loading: customersLoading } = useSelector((state: RootState) => state.customers);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [])

  const handleDeleteClick = () => {
    setDeleting(true);
    setConfirmOpen(true);
  };

  const handleCancelClick = () => {
    setDeleting(false);
    formik.resetForm();
    onCancelClick();
  };


  const initValue: IKanbanCard & IDeal = {
    ID: card?.ID || 0,
    USR$MASTERKEY: card?.USR$MASTERKEY || currentStage?.ID || -1,
    USR$INDEX: card?.USR$INDEX || currentStage?.CARDS.length || 0,
    USR$NAME: card?.DEAL?.USR$NAME || '',
    USR$DEALKEY: card?.USR$DEALKEY || -1,
    USR$AMOUNT: card?.DEAL?.USR$AMOUNT || undefined,
    USR$CONTACTKEY: card?.DEAL?.CONTACT?.ID || -1,
    DEAL: card?.DEAL || undefined
  }

  const formik = useFormik<IKanbanCard & IDeal>({
    enableReinitialize: true,
    initialValues: {
      ...card,
      ...initValue
    },
    validationSchema: yup.object().shape({
      USR$NAME: yup.string().required('').max(20, 'Слишком длинное наименование'),
      USR$MASTERKEY: yup.string().required(''),
      USR$CONTACTKEY: yup.string().required(''),
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
         {card?.ID ? `Редактирование ${card?.DEAL?.USR$NAME}` : 'Создание сделки'}
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
                    name="USR$NAME"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.USR$NAME}
                    helperText={formik.errors.USR$NAME}
                  />
                  <Autocomplete
                    options={allCustomers || []}
                    getOptionLabel={option => option.NAME}
                    filterOptions={filterOptions}
                    value={allCustomers?.find(el => el.ID === formik.values.USR$CONTACTKEY) || null}
                    loading={customersLoading}
                    loadingText="Загрузка данных..."
                    onChange={(e, value) => {
                      formik.setFieldValue(
                        "USR$CONTACTKEY",
                        value ? value.ID : initValue.USR$CONTACTKEY
                      );
                    }}
                    renderOption={(props, option) => {
                      return (
                        <li {...props} key={option.ID}>
                          {option.NAME}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        key={params.id}
                        label="Клиент"
                        type="text"
                        name="USR$CONTACTKEY"
                        required
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.USR$CONTACTKEY}
                        helperText={formik.errors.USR$CONTACTKEY}
                        placeholder="Выберите клиента"
                      />
                    )}
                  />
                  <Autocomplete
                    options={stages?.filter(stage => stage.ID !== formik.values.USR$MASTERKEY) || []}
                    getOptionLabel={option => option.USR$NAME}
                    value={stages?.filter(el => el.ID === formik.values.USR$MASTERKEY)[0] || null}
                    onChange={(e, value) => {
                      formik.setFieldValue(
                        "USR$MASTERKEY",
                        value ? value.ID : initValue.USR$MASTERKEY
                      );
                    }}
                    renderOption={(props, option) => {
                      return (
                        <li {...props} key={option.ID}>
                          {option.USR$NAME}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        key={params.id}
                        label="Стадия"
                        type="text"
                        name="USR$MASTERKEY"
                        required
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.USR$MASTERKEY}
                        helperText={formik.errors.USR$MASTERKEY}
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
                    name="USR$AMOUNT"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.USR$AMOUNT}
                    helperText={formik.errors.USR$AMOUNT}
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
