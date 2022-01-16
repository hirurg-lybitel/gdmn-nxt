import { useGetAllContactsQuery } from '../features/contact/contactApi';
import { DataGridPro, DataGridProProps, GridColDef, GridRenderCellParams, GridRowModel, GridToolbar, useGridApiContext, useGridSelector, ruRU, GridSortModel } from '@mui/x-data-grid-pro';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem'
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
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CustomerEdit from '../customer-edit/customer-edit';
import { useDispatch, useSelector } from 'react-redux';
import { addCustomer, updateCustomer, fetchCustomers, deleteCustomer, fetchHierarchy, fetchCustomersByRootID } from '../features/customer/actions';
import { customersSelectors, hierarchySelectors } from '../features/customer/customerSlice';
import { RootState } from '../store';
import { IContactWithID } from '@gsbelarus/util-api-types';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import NestedSets from 'nested-sets-tree';
import { CollectionEl } from 'nested-sets-tree';
import SalesFunnel from '../sales-funnel/sales-funnel';


const columns: GridColDef[] = [
  { field: 'NAME', headerName: 'Наименование', width: 350 },
  { field: 'PHONE', headerName: 'Телефон', width: 250 },
  // {
  //   field: 'isGroup',
  //   headerName: 'isGroup',
  //   type: 'boolean',
  //   hide: false,
  //   valueGetter: (params) => params.id.toString().startsWith('auto-generated-row'),
  // },
  //{ field: 'FOLDERNAME', headerName: 'Folder', width: 250 },
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
  const [salesFunnelOpen, setSalesFunnelOpen] = useState(false);

  const allCustomers = useSelector(customersSelectors.selectAll);
  const allHierarchy = useSelector(hierarchySelectors.selectAll);
  const { error: customersError , loading: customersLoading } = useSelector((state: RootState) => state.customers);
  const dispatch = useDispatch();


  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "isGroup", sort: "desc" }
  ]);

  let curOrg: number;



  const tree: NestedSets = new NestedSets({
    id: 'ID',
    parentId: 'PARENT',
    lft: 'LB',
    rgt: 'RB'
  });

  const arr: CollectionEl[] = allHierarchy.map(({error, loading, NAME, ...el}) => ({ ...el, PARENT: el.PARENT || 0}) );
  tree.loadTree(arr, {createIndexes: true});


  //console.log('allCustomers', allCustomers);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [])

  useEffect(() => {
    if (customersError) {

      setSnackBarMessage(customersError.toString());
      setOpenSnackBar(true);
    }
  }, [customersError])

  useEffect(() => {
    dispatch(fetchHierarchy());

  }, [allCustomers]);

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

  const handleSalesFunnelClick = () => {
    setSalesFunnelOpen(true);
  }

  const handleSalesFunnelBackOnClick = () => {
    setSalesFunnelOpen(false);
  }

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

  if (salesFunnelOpen) {
    return (
      <Stack direction="column" spacing={2}>
        <Button onClick={handleSalesFunnelBackOnClick} variant="contained" size="large" startIcon={<ArrowBackIcon />}>
          Вернуться
        </Button>
        <SalesFunnel />
      </Stack>
    );
  };

  const renderTree = (nodes: CollectionEl) => {
    return (
      <TreeItem
        sx={{
          paddingTop: 0.8,
          paddingBottom: 0.8,
          fontSize: 2,
          color: '#1976d2'
        }}
        key={nodes.ID}
        nodeId={nodes.ID.toString()}
        label={allHierarchy.find((elem) => elem.ID === nodes.ID)?.NAME}
      >
        {Array.isArray(tree.getChilds(nodes, false).results)
            ? tree.getChilds(nodes, false).results.map((node) => renderTree(node))
            : null}
      </TreeItem>);
  };

  // const groupingColDef: DataGridProProps['groupingColDef'] = {
  //   headerName: 'Группа',
  //   renderCell: (params) => <CustomGridTreeDataGroupingCell {...params} />,
  // };

  return (
    <Stack direction="column">
      <Stack direction="row">
        <Button onClick={()=> dispatch(fetchCustomers())} disabled={customersLoading} startIcon={<RefreshIcon/>}>Обновить</Button>
        <Button onClick={handleAddOrganization} disabled={customersLoading} startIcon={<AddIcon/>}>Добавить</Button>
        <Button onClick={handleOrganiztionEditClick} disabled={customersLoading} startIcon={<EditIcon />}>Редактировать</Button>
        <Button onClick={handleReconciliationClick} disabled={customersLoading} startIcon={<SummarizeIcon />}>Акт сверки</Button>
        <Button onClick={handleSalesFunnelClick} disabled={customersLoading} startIcon={<FilterAltIcon />}>Воронка продаж</Button>
      </Stack>
      <Stack direction="row">
        <TreeView
          sx={{
             paddingTop: 12,
             marginRight: 1,
             flexGrow: 1,
             maxWidth: 400,
             overflowY: 'auto',
             border: 1,
             borderRadius: '4px',
             borderColor: 'grey.300',
          }}
          defaultCollapseIcon={<FolderOpenIcon
            color='primary'

          />}
          defaultExpandIcon={<FolderIcon
            color='primary'
          />}
          onNodeSelect={(event: React.SyntheticEvent, nodeId: string) => {
            console.log('el', nodeId);

            dispatch(fetchCustomersByRootID(nodeId));
          }}
        >
          {tree.all
            .filter((node) => node.PARENT === 0)
            .sort((a, b) => Number(a.LB) - Number(b.LB))
            .map((node) => renderTree(node))}
        </TreeView>
        <div style={{ width: '100%', height: '800px' }}>

          <DataGridPro
            localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
            rows={allCustomers ?? []}
            //treeData
            // groupingColDef={groupingColDef}
            // getTreeDataPath={(row: GridRowModel) => {
            //   const element = tree.getElById(row.PARENT || 0).results[0];

            //   const arr: Array<any> = element ?
            //     tree.getAllParents(element, false).results
            //       .sort((a, b) => Number(a.LB) - Number(b.LB))
            //       .map((el) => allHierarchy.find((elem) => elem.ID === el.ID)?.NAME)
            //     : ['Прочее'];

            //    arr.push(row.ID);

            //   return arr;
            // }}
            //defaultGroupingExpansionDepth={1}
            columns={columns}
            pagination
            disableMultipleSelection
            loading={customersLoading}
            getRowId={row => row.ID}
            onSelectionModelChange={ ids => setCurrentOrganization(ids[0] ? Number(ids[0]) : 0)}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </Stack>
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
