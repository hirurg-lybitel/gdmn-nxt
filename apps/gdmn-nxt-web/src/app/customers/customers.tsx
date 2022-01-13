import { useGetAllContactsQuery } from '../features/contact/contactApi';
import { DataGridPro, GridColDef, GridToolbar } from '@mui/x-data-grid-pro';
import './customers.module.less';
import Stack from '@mui/material/Stack/Stack';
import Button from '@mui/material/Button/Button';
import ReportParams from '../report-params/report-params';
import React, { useEffect, useState } from 'react';
import ReconciliationStatement from '../reconciliation-statement/reconciliation-statement';
import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';
import { DateRange } from '@mui/lab/DateRangePicker/RangeTypes';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import SummarizeIcon from '@mui/icons-material/Summarize';
import CustomerEdit from '../customer-edit/customer-edit';
import { useDispatch, useSelector } from 'react-redux';
import { addCustomer, updateCustomer, fetchCustomers, customersSelectors, deleteCustomer } from '../features/customer/customerSlice';
import { RootState } from '../store';
import { IBaseContact, IContactWithID, IWithID } from '@gsbelarus/util-api-types';


const columns: GridColDef[] = [
  { field: 'NAME', headerName: 'Name', width: 350 },
  { field: 'PHONE', headerName: 'Phone', width: 250 },
  { field: 'FOLDERNAME', headerName: 'Folder', width: 250 },
];

/* eslint-disable-next-line */
export interface CustomersProps {}

export function Customers(props: CustomersProps) {

  //const { data, isFetching, refetch } = useGetAllContactsQuery();

  const [reconciliationParamsOpen, setReconciliationParamsOpen] = useState(false);
  const [reconciliationShow, setReconciliationShow] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState(0);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [paramsDates, setParamsDates] = useState<DateRange<Date | null>>([null, null]);
  const [openEditForm, setOpenEditForm] = useState(false);
  const allCustomers = useSelector(customersSelectors.selectAll);
  const { error: cutomersError , loading: customersLoading } = useSelector((state: RootState) => state.cutomers);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [])

  useEffect(() => {
    if (cutomersError) {

      setSnackBarMessage(cutomersError.toString());
      setOpenSnackBar(true);
    }
  }, [cutomersError])

  /** Close snackbar manually */
  const handleSnackBarClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    };
    setOpenSnackBar(false);
  };

  const handleReconciliationClick = () => {
    if (!currentOrganization) {
      setSnackBarMessage('Не выбрана организация');
      setOpenSnackBar(true);
      return;
    }
    setReconciliationParamsOpen(true);
  };

  /** Save report params */
  const handleSaveClick = (dates: DateRange<Date>) => {
    setParamsDates(dates);
    setReconciliationParamsOpen(false);
    setReconciliationShow(true);
  };

  /** Cancel report params */
  const handleCancelClick = () => {
    setReconciliationParamsOpen(false);
  };

  /** Close reconciliation report */
  const handleReconcilitationBackOnClick = () => {
    setReconciliationShow(false);
  };

  /** Edit select organization */
  const handleOrganiztionEditClick = () => {
    if (!currentOrganization) {
      setSnackBarMessage('Не указана организация');
      setOpenSnackBar(true);
      return;
    }

    setOpenEditForm(true);
  };

  /** Cancel organization change */
  const handleOrganiztionEditCancelClick = () => {
    console.log('cancel data');
    setOpenEditForm(false);
  };

  const handleOrganiztionEditSubmit = async (values: IContactWithID, deleting: boolean) => {
    setOpenEditForm(false);

    if (deleting) {
      dispatch(deleteCustomer(values.ID));
      return;
    }

    if (!values.ID) {
      dispatch(addCustomer(values));
      return;
    }

    dispatch(updateCustomer(values));
  };


  const handleAddOrganization = () => {
    setCurrentOrganization(0);
    setOpenEditForm(true);
  };

  const handleOrganizationDeleteOnClick = () => {
    console.log('handleOrganizationDeleteOnClick');

    if (!currentOrganization) {
      setSnackBarMessage('Не выбрана организация');
      setOpenSnackBar(true);
      return;
    }

    dispatch(deleteCustomer(currentOrganization));
  };


  if (reconciliationShow) {
    return (
      <Stack direction="column" spacing={2}>
        <Button onClick={handleReconcilitationBackOnClick} variant="contained" size="large" startIcon={<ArrowBackIcon />}>
          Вернуться
        </Button>
        <ReconciliationStatement
          custId={currentOrganization} //148333193
          dateBegin={paramsDates[0]}
          dateEnd={paramsDates[1]}
        />
      </Stack>
    );
  };


  return (
    <Stack direction="column">
      <Stack direction="row">
        <Button onClick={()=> dispatch(fetchCustomers())} disabled={customersLoading} startIcon={<RefreshIcon/>}>Обновить</Button>
        <Button onClick={handleAddOrganization} disabled={customersLoading} startIcon={<AddIcon/>}>Добавить</Button>
        <Button onClick={handleOrganiztionEditClick} disabled={customersLoading} startIcon={<EditIcon />}>Редактировать</Button>
        <Button onClick={handleReconciliationClick} disabled={customersLoading} startIcon={<SummarizeIcon />}>Акт сверки</Button>
      </Stack>
      <div style={{ width: '100%', height: '800px' }}>
        <DataGridPro
          rows={allCustomers ?? []}
          columns={columns}
          pagination
          disableMultipleSelection
          loading={customersLoading}
          getRowId={row => row.ID}
          onSelectionModelChange={ ids => setCurrentOrganization(ids[0] ? Number(ids[0]) : 0) }
          components={{
            Toolbar: GridToolbar,
          }}
        />
      </div>
      <ReportParams
        open={reconciliationParamsOpen}
        dates={paramsDates}
        onSaveClick={handleSaveClick}
        onCancelClick={handleCancelClick}
      />
      <CustomerEdit
        open={openEditForm}
        customer={allCustomers.find((element) => element.ID === currentOrganization) || null}
        onSubmit={handleOrganiztionEditSubmit}
        onCancelClick={handleOrganiztionEditCancelClick}
        onDeleteClick={handleOrganizationDeleteOnClick}
      />
      <Snackbar open={openSnackBar} autoHideDuration={5000} onClose={handleSnackBarClose}>
        <Alert onClose={handleSnackBarClose} variant="filled" severity='error'>{snackBarMessage}</Alert>
      </Snackbar>
    </Stack>
  );
}

export default Customers;
