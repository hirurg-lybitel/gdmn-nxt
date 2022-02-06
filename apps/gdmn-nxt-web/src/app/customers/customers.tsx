import {
  DataGridPro,
  GridColDef,
  GridToolbar,
  ruRU,
  GridSortModel,
  GridFilterItem,
  GridFilterInputValueProps,
  GridFilterModel,
  GridFilterOperator } from '@mui/x-data-grid-pro';
import './customers.module.less';
import Stack from '@mui/material/Stack/Stack';
import Button from '@mui/material/Button/Button';
import React, { useEffect, useState } from 'react';
import { Box, Card, List, ListItemButton, Snackbar, Container, Grid } from '@mui/material';
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
import { addCustomer, updateCustomer, fetchCustomers, deleteCustomer, fetchHierarchy } from '../features/customer/actions';
import { customersSelectors } from '../features/customer/customerSlice';
import { RootState } from '../store';
import { IContactWithLabels, ILabelsContact } from '@gsbelarus/util-api-types';
import NestedSets from 'nested-sets-tree';
import { CollectionEl } from 'nested-sets-tree';
import SalesFunnel from '../sales-funnel/sales-funnel';
import { useAddLabelsContactMutation, useDeleteLabelsContactMutation, useGetLabelsContactQuery } from '../features/labels/labelsApi';
import CustomTreeView from '../custom-tree-view/custom-tree-view';
import ContactGroupEditForm from '../contact-group-edit/contact-group-edit';
import { useAddGroupMutation, useDeleteGroupMutation, useGetGroupsQuery, useUpdateGroupMutation } from '../features/contact/contactGroupApi';
import { clearError } from '../features/error-slice/error-slice';
import ReconciliationAct from "../pages/UserReports/ReconciliationAct";


const labelStyle: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '0.625rem',
  fontWeight: 'bold',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  textTransform: 'uppercase',
  border: '1px solid hsl(198, 100%, 60%)',
  borderRadius: '2em',
  backgroundColor: 'hsla(198, 100%, 72%, 0.2)',
  color: 'hsl(198, 100%, 60%)',
  padding: '2.5px 9px',
  margin: '0px 5px',
  width: 'fit-content',
  height: 'fit-content'
}

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
  const [openContactGroupEditForm, setOpenContactGroupEditForm] = useState(false);
  const [salesFunnelOpen, setSalesFunnelOpen] = useState(false);
  const [treeNodeId, setTreeNodeId] = useState<number | null>(null);
  const [editingTreeNodeId, setEditingTreeNodeId] = useState<number>();
  const [addingGroup, setAddingGroup] = useState(false);
  const [filterModel, setFilterModel] = useState<GridFilterModel>();

  const allCustomers = useSelector(customersSelectors.selectAll);
  const { error: customersError , loading: customersLoading } = useSelector((state: RootState) => state.customers);
  const dispatch = useDispatch();

  const [addLabelsContact, { error: addLabelsError }] = useAddLabelsContactMutation();
  const [deleteLabelsContact, { error: deleteLabelsError}] = useDeleteLabelsContactMutation();


  const { data: labelsContact, error: labelError, refetch: refetchLabels } = useGetLabelsContactQuery();

  const { data: groups, isFetching: groupIsFetching } = useGetGroupsQuery();
  const [addGroup] = useAddGroupMutation();
  const [updateGroup] = useUpdateGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();

  const { errorMessage } = useSelector((state: RootState) => state.error);

  function CurrentLabelFilter(props: GridFilterInputValueProps) {
    const { item, applyValue, focusElementRef } = props;

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'end',
          paddingBottom: '6px'
        }}
      >
        <div
          style={labelStyle}
        >
          {groups?.find(el => el.ID === item.value)?.NAME}
        </div>
      </div>
    )
  };

  const labelsOnlyOperators: GridFilterOperator[] = [
    {
      label: 'Содержит',
      value: 'is',
      getApplyFilterFn: (filterItem: GridFilterItem) => {
        if (
          !filterItem.columnField ||
          !filterItem.value ||
          !filterItem.operatorValue
        ) {
          return null;
        }


        return (params: any): boolean => {
          return params.row.labels.find((label: any) => label.LABEL === filterItem.value);
        };
      },
      InputComponent: CurrentLabelFilter,
      InputComponentProps: { type: 'number' },
    },
  ];

  const columns: GridColDef[] = [
    { field: 'NAME', headerName: 'Наименование', width: 350 },
    { field: 'PHONE', headerName: 'Телефон', width: 250 },
    { field: 'labels',
      headerName: 'Метки',
      flex: 1,
      width: 300,
      filterOperators: labelsOnlyOperators,
      renderCell: (params) => {

        const labels: ILabelsContact[] | [] = labelsContact?.queries.labels.filter(el => el.CONTACT === params.id) || [];

        if (!labels.length) {
          return;
        }

        return (
          <Stack
            direction="column"
          >
            <List
              style={{
                display: 'flex',
                flexDirection: 'row',
                padding: 0,
                margin: 1,
                width: 'fit-content'
                }}
            >
              {labels
                .slice(0, labels.length > 3 ? Math.trunc(labels.length/2) : 3)
                .map(label => {
                  return (
                    <ListItemButton
                      key={label.ID}
                      onClick={ () => setFilterModel({items: [{ id: 1, columnField: 'labels', value: label.LABEL, operatorValue: 'is' }]})}
                      style={labelStyle}
                    >
                    {groups?.find(hierarchy => hierarchy.ID === label.LABEL)?.NAME}
                    </ListItemButton>
                  )
              })}
            </List>
            {labels.length > 3 ?
              <List
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  padding: 0,
                  margin: 1,
                  width: 'fit-content'
                  }}
              >
                {labels
                  .slice(Math.trunc(labels.length/2))
                  .map(label => {
                    return (
                      <ListItemButton
                        key={label.ID}
                        onClick={ () => setFilterModel({items: [{ id: 1, columnField: 'labels', value: label.LABEL, operatorValue: 'is' }]})}
                        style={labelStyle}
                      >
                        {groups?.find(hierarchy => hierarchy.ID === label.LABEL)?.NAME}
                      </ListItemButton>
                    )
                  })
                }

              </List>
              : null}

          </Stack>
        );
      }
    },
  ];


  useEffect(() => {
    dispatch(fetchCustomers());
  }, [])

  useEffect(() => {
    refetchLabels();
  }, [allCustomers]);

  useEffect(() => {
    if (customersError) {
      setSnackBarMessage(customersError.toString());
      setOpenSnackBar(true);
    }

    if (errorMessage) {
      setSnackBarMessage(errorMessage);
      setOpenSnackBar(true);
    }
  }, [customersError, errorMessage])



  /** Перевод вложенной структуры с lb rb в бинарное дерево */
  const tree: NestedSets = new NestedSets({
    id: 'ID',
    parentId: 'PARENT',
    lft: 'LB',
    rgt: 'RB'
  });

  if (groups) {
    const arr: CollectionEl[] = groups.map(({NAME, ...el}) => ({ ...el, PARENT: el.PARENT || 0}) );
    tree.loadTree(arr, {createIndexes: true});
  }

  useEffect(() => {
    dispatch(fetchHierarchy());

  }, [allCustomers]);

  /** Close snackbar manually */
  const handleSnackBarClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    };
    dispatch(clearError());
    setOpenSnackBar(false);
  };

  const handleReconciliationClick = () => {
    if (!currentOrganization) {
      setSnackBarMessage('Не выбрана организация');
      setOpenSnackBar(true);
      return;
    }
    setReconciliationShow(true);
  };

  const handleSalesFunnelClick = () => {
    setSalesFunnelOpen(true);
  }

  const handleSalesFunnelBackOnClick = () => {
    setSalesFunnelOpen(false);
  }

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
    setOpenEditForm(false);
  };

  const handleOrganiztionEditSubmit = async (values: IContactWithLabels, deleting: boolean) => {
    setOpenEditForm(false);

    if (deleting) {
      deleteLabelsContact(values.ID);
      dispatch(deleteCustomer(values.ID));
      return;
    }

    if (!values.ID) {
      dispatch(addCustomer(values));
      return;
    }

    if (values.labels?.length) {
      addLabelsContact(values.labels);
    } else {
      deleteLabelsContact(values.ID);
    }
    dispatch(updateCustomer(values));
  };


  const handleAddOrganization = () => {
    setCurrentOrganization(0);
    setOpenEditForm(true);
  };

  const handleOrganizationDeleteOnClick = () => {
    if (!currentOrganization) {
      setSnackBarMessage('Не выбрана организация');
      setOpenSnackBar(true);
      return;
    }

    dispatch(deleteCustomer(currentOrganization));
  };


  const contactGroupHandlers = {
    handleAdd: async () => {
      setAddingGroup(true);
      setOpenContactGroupEditForm(true);
    },
    handleCancel: async () => setOpenContactGroupEditForm(false),
    onSubmit: async (value: IContactWithLabels) => {
      setOpenContactGroupEditForm(false);

      if (!value.ID) {
        addGroup(value);
        return;
      }

      updateGroup(value);
    },
    handleEdit: async (nodeId: number) => {
      setAddingGroup(false);
      setEditingTreeNodeId(nodeId);
      setOpenContactGroupEditForm(true);
    },
    handleDelete: async(nodeId: number) => {
      /** если удаляем текущую папку */
      if (treeNodeId === nodeId) setTreeNodeId(null);

      deleteGroup(nodeId);
    }

  };

  if (reconciliationShow) {
    return (
      <Stack direction="column" spacing={2}>
        <Button onClick={handleReconcilitationBackOnClick} variant="contained" size="large" startIcon={<ArrowBackIcon />}>
          Вернуться
        </Button>
        <ReconciliationAct customerId={currentOrganization} />
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

  return (

    <Stack direction="column">
      <Stack direction="row">
        <Box style={{ height: '800px'}}>
          <Button onClick={contactGroupHandlers.handleAdd} disabled={groupIsFetching} startIcon={<AddIcon/>}>Добавить</Button>
          <CustomTreeView
            hierarchy={groups || []}
            tree={tree}
            onNodeSelect={(event: React.SyntheticEvent, nodeId: string) => setTreeNodeId(Number(nodeId))}
            onEdit={contactGroupHandlers.handleEdit}
            onDelete={contactGroupHandlers.handleDelete}
          />
          {openContactGroupEditForm ?
            <ContactGroupEditForm
              group={addingGroup ? null : groups?.find(el => el.ID === editingTreeNodeId) || null}
              tree={tree}
              onSubmit={contactGroupHandlers.onSubmit}
              onCancel={contactGroupHandlers.handleCancel}
            />
            : null}
        </Box>
        <div style={{ width: '100%', height: '800px'}}>
          <Stack direction="row">
            <Button onClick={()=> dispatch(fetchCustomers())} disabled={customersLoading} startIcon={<RefreshIcon/>}>Обновить</Button>
            <Button onClick={handleAddOrganization} disabled={customersLoading} startIcon={<AddIcon/>}>Добавить</Button>
            <Button onClick={handleOrganiztionEditClick} disabled={customersLoading} startIcon={<EditIcon />}>Редактировать</Button>
            <Button onClick={handleReconciliationClick} disabled={customersLoading} startIcon={<SummarizeIcon />}>Акт сверки</Button>
            <Button onClick={handleSalesFunnelClick} disabled={customersLoading} startIcon={<FilterAltIcon />}>Воронка продаж</Button>
          </Stack>
          <DataGridPro
            localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
            rows={
              allCustomers
                .filter(customer => (tree.all.length && treeNodeId) ? tree.getAllChilds(treeNodeId, false).results.map(el => el.ID).includes(Number(customer.PARENT)) : true)
                .map((customer) => ({
                  ...customer,
                  labels: labelsContact?.queries.labels.filter(label => label.CONTACT === customer.ID) || []
                  })
                ) ?? []}
            columns={columns}
            pagination
            disableMultipleSelection
            loading={customersLoading}
            getRowId={row => row.ID}
            onSelectionModelChange={ ids => setCurrentOrganization(ids[0] ? Number(ids[0]) : 0)}
            components={{
              Toolbar: GridToolbar,
            }}
            filterModel={filterModel}
            onFilterModelChange={(model, detail) => setFilterModel(model)}
          />
        </div>
      </Stack>
      {openEditForm ?
        <CustomerEdit
          open={openEditForm}
          customer={
            allCustomers
            .filter((element) => element.ID === currentOrganization)
            .map(({...customer}) => ({
              ...customer,
              labels: labelsContact?.queries.labels.filter(label => label.CONTACT === customer.ID) || []
              })
            )[0] || null
          }
          onSubmit={handleOrganiztionEditSubmit}
          onCancelClick={handleOrganiztionEditCancelClick}
          onDeleteClick={handleOrganizationDeleteOnClick}
        />
        : null
      }
      <Snackbar open={openSnackBar} autoHideDuration={5000} onClose={handleSnackBarClose}>
        <Alert onClose={handleSnackBarClose} variant="filled" severity='error'>{snackBarMessage}</Alert>
      </Snackbar>
    </Stack>
  );
}

export default Customers;
