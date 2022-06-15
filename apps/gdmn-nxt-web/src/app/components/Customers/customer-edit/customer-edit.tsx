import './customer-edit.module.less';
import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Box,
  Slide,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails
} from '@mui/material';
import {
  Theme
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { IContactWithLabels, ICustomer, ILabelsContact } from '@gsbelarus/util-api-types';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { forwardRef, ReactElement, useState } from 'react';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { hierarchySelectors } from '../../../features/customer/customerSlice';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useGetGroupsQuery } from '../../../features/contact/contactGroupApi';
import { TransitionProps } from '@mui/material/transitions';
import CustomizedCard from '../../customized-card/customized-card';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContactPersonList from '../contact-person-list/contact-person-list';


const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    width: 500,
    minWidth: '30vw',
    maxWidth: '100%',
    // //width: '30%',
    // //minWidth: '30%',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  dialogAction: {
    paddingRight: '3%',
    paddingLeft: '3%',
  },
  helperText: {
    '& p': {
      color: '#ec5555',
    },
  },
  button: {
    width: '120px',
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

export interface CustomerEditProps {
  open: boolean;
  customer: ICustomer | null;
  onSubmit: (arg1: ICustomer, arg2: boolean) => void;
  onSaveClick?: () => void;
  onCancelClick: () => void;
  onDeleteClick?: () => void;
}

export function CustomerEdit(props: CustomerEditProps) {
  const { open, customer } = props;
  const { onCancelClick, onDeleteClick, onSubmit } = props;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const allHierarchy = useSelector(hierarchySelectors.selectAll);
  const { data: groups } = useGetGroupsQuery();

  const [open2, setOpen2] = useState(false);

  const classes = useStyles();

  const initValue: ICustomer = {
    ID: customer?.ID || 0,
    NAME: customer?.NAME || '',
    PHONE: customer?.PHONE || '',
    EMAIL: customer?.EMAIL || '',
    PARENT: customer?.PARENT || undefined,
    LABELS: customer?.LABELS || []
  };

  const formik = useFormik<ICustomer>({
    enableReinitialize: true,
    initialValues: {
      ...customer,
      ...initValue
    },
    validationSchema: yup.object().shape({
      NAME: yup.string().required('').max(80, 'Слишком длинное наименование'),
      EMAIL: yup.string().matches(/@./),
      PARENT: yup.string().required('')
    }),
    onSubmit: (values) => {
      console.log('onSubmit', values, deleting);
      setConfirmOpen(false);
      onSubmit(values, deleting);
    },
  });

  const handleDeleteClick = () => {
    setDeleting(true);
    setConfirmOpen(true);
  };

  const handleCancelClick = () => {
    setDeleting(false);
    formik.resetForm();
    onCancelClick();
  };

  return (
    <Dialog
      open={open}
      classes={{ paper: classes.dialog }}
      TransitionComponent={Transition}
    >
      <DialogTitle>
        {customer ? `Редактирование: ${customer.NAME}` : 'Добавление'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="column" spacing={3}>
          <FormikProvider value={formik}>
            <Form id="mainForm" onSubmit={formik.handleSubmit}>
              <Stack direction="column" spacing={3}>
                <TextField
                  label="Наименование"
                  className={classes.helperText}
                  type="text"
                  required
                  autoFocus
                  name="NAME"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.NAME}
                  helperText={formik.errors.NAME}
                />
                <Autocomplete
                  options={groups || []}
                  getOptionLabel={option => option.NAME}
                  value={groups?.filter(el => el.ID === formik.values.PARENT)[0] || null}
                  onChange={(e, value) => {
                    formik.setFieldValue(
                      'PARENT',
                      value ? value.ID : initValue.PARENT
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
                      label="Папка"
                      className={classes.helperText}
                      type="text"
                      required
                      name="PARENT"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.PARENT}
                      helperText={formik.errors.PARENT}
                      placeholder="Выберите папку"
                    />
                  )}
                />
                <TextField
                  label="Телефон"
                  className={classes.helperText}
                  type="text"
                  name="PHONE"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.PHONE}
                  helperText={formik.errors.PHONE}
                />
                <TextField
                  label="Email"
                  type="email"
                  name="EMAIL"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.EMAIL}
                />
                <Autocomplete
                  multiple
                  limitTags={2}
                  disableCloseOnSelect
                  onChange={(e, value) => {
                    formik.setFieldValue(
                      'LABELS',
                      value
                        ? value.map((el) => {
                          return { ID: -1, USR$CONTACTKEY: formik.values.ID, USR$LABELKEY: el.ID } as ILabelsContact;
                        })
                        : initValue.LABELS
                    );
                  }}
                  value={
                    groups
                      ?.filter(hierarchy => formik.values.LABELS?.find(label => label.USR$LABELKEY === hierarchy.ID))
                  }
                  options={groups || []}
                  getOptionLabel={opt => opt.NAME}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.ID}>
                      <Checkbox
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.NAME}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Метки"
                      placeholder="Выберите метки"
                    />
                  )}
                />
              </Stack>
            </Form>
          </FormikProvider>
          {/* <Button onClick={() => setOpen2(!open2)}>Edit</Button> */}
          <CustomerEdit open={open2} customer={customer} onSubmit={onSubmit} onCancelClick={() => setOpen2(false)} />
          <CustomizedCard
            borders
            style={{
              borderColor: 'lightgrey',
            }}
          >
            <Accordion disableGutters>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                style={{
                  height: 56,
                }}
              >
                <Typography sx={{ width: '33%', flexShrink: 0 }}>
                  Контакты
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                style={{
                  height: '30vh',
                  display: 'flex',
                  padding: 0
                }}
              >
                <ContactPersonList customerId={customer?.ID || -1} />
              </AccordionDetails>
            </Accordion>

          </CustomizedCard>
        </Stack>
      </DialogContent>
      <DialogActions>
        <IconButton onClick={handleDeleteClick} size="large">
          <DeleteIcon />
        </IconButton>
        {/* <Button
          className={classes.button}
          variant="text"
          color="error"
          onClick={handleDeleteClick}
          startIcon={<DeleteIcon fontSize="medium"  />}
        >
          Удалить
        </Button> */}
        <Box flex={1}/>
        <Button
          className={classes.button}
          onClick={handleCancelClick}
          variant="text"
          color="primary"
        >
            Отменить
        </Button>
        <Button
          className={classes.button}
          type={!formik.isValid ? 'submit' : 'button'}
          form="mainForm"
          onClick={() => {
            setDeleting(false);
            setConfirmOpen(formik.isValid);
          }}
          variant="contained"
        >
            Сохранить
        </Button>
      </DialogActions>
      <ConfirmDialog
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title={deleting ? 'Удаление клиента' : 'Сохранение'}
        text="Вы уверены, что хотите продолжить?"
        onConfirm={formik.handleSubmit}
      />
    </Dialog>
  );
}

export default CustomerEdit;
