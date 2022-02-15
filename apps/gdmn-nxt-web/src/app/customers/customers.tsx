import {
  DataGridPro,
  GridColDef,
  GridToolbar,
  ruRU,
  GridSortModel,
  GridFilterItem,
  GridFilterInputValueProps,
  GridFilterModel,
  GridFilterOperator,
  GridOverlay,
  GridRowHeightParams} from '@mui/x-data-grid-pro';
import './customers.module.less';
import Stack from '@mui/material/Stack/Stack';
import Button from '@mui/material/Button/Button';
import React, { useEffect, useState } from 'react';
import { Box, Card, List, ListItemButton, Snackbar, Container, Grid, LinearProgress, IconButton } from '@mui/material';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import SummarizeIcon from '@mui/icons-material/Summarize';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CustomerEdit from '../customer-edit/customer-edit';
import { useDispatch, useSelector } from 'react-redux';
import { addCustomer, updateCustomer, fetchCustomers, deleteCustomer, fetchHierarchy } from '../features/customer/actions';
import { customersSelectors } from '../features/customer/customerSlice';
import { RootState } from '../store';
import { IContactWithLabels, ILabelsContact } from '@gsbelarus/util-api-types';
import NestedSets from 'nested-sets-tree';
import { CollectionEl } from 'nested-sets-tree';
import { useAddLabelsContactMutation, useDeleteLabelsContactMutation, useGetLabelsContactQuery } from '../features/labels/labelsApi';
import CustomTreeView from '../custom-tree-view/custom-tree-view';
import ContactGroupEditForm from '../contact-group-edit/contact-group-edit';
import { useAddGroupMutation, useDeleteGroupMutation, useGetGroupsQuery, useUpdateGroupMutation } from '../features/contact/contactGroupApi';
import { clearError } from '../features/error-slice/error-slice';
import { useTheme } from '@mui/system';
import CustomNoRowsOverlay from './DataGridProOverlay/CustomNoRowsOverlay';
import CustomLoadingOverlay from './DataGridProOverlay/CustomLoadingOverlay';
import { ReconciliationAct } from '../pages/Analytics/UserReports/ReconciliationAct';
import MainCard from '../components/main-card/main-card';

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

  const [reconciliationShow, setReconciliationShow] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState(0);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openContactGroupEditForm, setOpenContactGroupEditForm] = useState(false);
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

  const theme = useTheme();

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
      width: 500,
      filterOperators: labelsOnlyOperators,
      renderCell: (params) => {

        const labels: ILabelsContact[] | [] = labelsContact?.queries.labels.filter(el => el.CONTACT === params.id) || [];

        if (!labels.length) {
          return;
        }
        return (
          <Stack direction="column">
            {labels.map((label, index) => {
              if (index % 3 === 0) {
                return(
                  <List
                    key={label.ID + index*10}
                    style={{
                      flexDirection: 'row',
                      padding: '4px',
                      width: 'fit-content',
                    }}
                  >
                    {labels.slice(index, index + 3).map((subLabel, index) => {
                      return(
                        <ListItemButton
                          key={subLabel.ID}
                          onClick={ () => setFilterModel({items: [{ id: 1, columnField: 'labels', value: subLabel.LABEL, operatorValue: 'is' }]})}
                          style={labelStyle}
                        >
                          {groups?.find(hierarchy => hierarchy.ID === subLabel.LABEL)?.NAME}
                       </ListItemButton>
                      )
                    })}
                  </List>
                )
              }
              return null;
            })}
          </Stack>
        );
      }
    },
    {
      field: 'Actions',
      headerName: 'Действия',
      align: 'center',
      renderCell: (params) => {

        const handleCustomerEdit = () => {
          //console.log('renderCell', params)
          setCurrentOrganization(Number(params.id))
          setOpenEditForm(true);
        }
        return (
          <IconButton onClick={handleCustomerEdit} disabled={customersLoading} >
            <EditOutlinedIcon fontSize="small" color="primary" />
          </IconButton>
        );
      }
    }
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

  return (
    <Box flex={1} display="flex">
      <Stack direction="row" flex={1}>
        <Stack direction="column" flex="1" >
          <Box sx={{ mb: 1 }}>
            <Button onClick={contactGroupHandlers.handleAdd} disabled={groupIsFetching} startIcon={<AddIcon/>}>Добавить</Button>
          </Box>
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
        </Stack>
        <Stack direction="column"  style={{ width: '100%'}}>
          <Box sx={{ mb: 1 }}>
            <Stack direction="row">
              <Button onClick={()=> dispatch(fetchCustomers())} disabled={customersLoading} startIcon={<RefreshIcon/>}>Обновить</Button>
              <Button onClick={handleAddOrganization} disabled={customersLoading} startIcon={<AddIcon/>}>Добавить</Button>
              <Button
                component="a"
                href={`reports/reconciliation/${currentOrganization}`}
                disabled={customersLoading}
                startIcon={<SummarizeIcon />}
              >Акт сверки</Button>
            </Stack>
          </Box>
          <MainCard
            borders
            boxShadows
            style={{ flex: 1}}
          >
          <DataGridPro
            style={{
              border: 'none'
            }}
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
              LoadingOverlay: CustomLoadingOverlay,
              NoRowsOverlay: CustomNoRowsOverlay
            }}
            filterModel={filterModel}
            onFilterModelChange={(model, detail) => setFilterModel(model)}
            pinnedColumns={{left: [customersLoading ? '' : 'NAME']}}
            getRowHeight={(params) => {
              const customer: IContactWithLabels = params.model as IContactWithLabels;

              const lables: ILabelsContact[] | [] = customer.labels || [];
              if (lables?.length) {
                return 50 * Math.ceil(lables.length/3)
              }

              return 50;
            }}
          />
          </MainCard>
        </Stack>
        {/* </div> */}
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
    </Box>
  );
}

export default Customers;
