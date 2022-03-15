import {
  DataGridPro,
  GridColDef,
  GridToolbar,
  ruRU,
  GridFilterItem,
  GridFilterInputValueProps,
  GridFilterModel,
  GridFilterOperator
} from '@mui/x-data-grid-pro';
import './customers.module.less';
import Stack from '@mui/material/Stack/Stack';
import Button from '@mui/material/Button/Button';
import React, { CSSProperties, ForwardedRef, forwardRef, useEffect, useState } from 'react';
import { Box, List, ListItemButton, Snackbar, IconButton, useMediaQuery, Theme } from '@mui/material';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SummarizeIcon from '@mui/icons-material/Summarize';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CustomerEdit from '../customer-edit/customer-edit';
import { useDispatch, useSelector } from 'react-redux';
import { addCustomer, updateCustomer, fetchCustomers, deleteCustomer, fetchHierarchy } from '../features/customer/actions';
import { customersSelectors } from '../features/customer/customerSlice';
import { RootState } from '../store';
import { IContactWithLabels, ICustomer, ILabelsContact } from '@gsbelarus/util-api-types';
import NestedSets from 'nested-sets-tree';
import { CollectionEl } from 'nested-sets-tree';
import { useAddLabelsContactMutation, useDeleteLabelsContactMutation, useGetLabelsContactQuery } from '../features/labels/labelsApi';
import CustomTreeView from '../custom-tree-view/custom-tree-view';
import ContactGroupEditForm from '../contact-group-edit/contact-group-edit';
import { useAddGroupMutation, useDeleteGroupMutation, useGetGroupsQuery, useUpdateGroupMutation } from '../features/contact/contactGroupApi';
import { clearError } from '../features/error-slice/error-slice';
import { useTheme } from '@mui/material';
import CustomNoRowsOverlay from './DataGridProOverlay/CustomNoRowsOverlay';
import CustomLoadingOverlay from './DataGridProOverlay/CustomLoadingOverlay';
import CustomizedCard from '../components/customized-card/customized-card';
import { Link, useNavigate } from 'react-router-dom';
import CustomersFilter, { IFilteringData } from './customers-filter/customers-filter';
import SearchBar from '../components/search-bar/search-bar';
import CustomGridToolbarOverlay from './DataGridProOverlay/CustomGridToolbarOverlay';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  DataGrid: {
    border: 'none',
    '& ::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
      backgroundColor: 'transparent',
      borderRadius: '6px'
    },
    '& ::-webkit-scrollbar:hover': {
      backgroundColor: '#f0f0f0',
    },
    '& ::-webkit-scrollbar-thumb': {
      position: 'absolute',
      right: 10,
      borderRadius: '6px',
      backgroundColor: 'rgba(170, 170, 170, 0.5)',
    },
    '& ::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#999',
    },
  },
}));

const labelStyle: CSSProperties = {
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
};

interface IPaginationData {
  pageNo: number;
  pageSize: number;
};

/* eslint-disable-next-line */
export interface CustomersProps {}

export function Customers(props: CustomersProps) {
  const classes = useStyles();

  // const { data, isFetching, refetch } = useGetAllContactsQuery();

  const [reconciliationShow, setReconciliationShow] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState(0);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [openContactGroupEditForm, setOpenContactGroupEditForm] = useState(false);
  const [treeNodeId, setTreeNodeId] = useState<number | null>(null);
  const [editingTreeNodeId, setEditingTreeNodeId] = useState<number>();
  const [addingGroup, setAddingGroup] = useState(false);
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const [searchName, setSearchName] = useState('');
  const [filteringData, setFilteringData] = useState<IFilteringData>({});
  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: 50
  });

  /** Затычка для минимизации рендеров DataGrid при resize */
  const [displayDataGrid, setDisplayDataGrid] = useState(true);


  const allCustomers = useSelector(customersSelectors.selectAll);
  const { error: customersError, loading: customersLoading } = useSelector((state: RootState) => state.customers);
  const dispatch = useDispatch();

  const [addLabelsContact] = useAddLabelsContactMutation();
  const [deleteLabelsContact] = useDeleteLabelsContactMutation();

  const { data: labelsContact, error: labelError, refetch: refetchLabels } = useGetLabelsContactQuery();

  const { data: groups, isFetching: groupIsFetching } = useGetGroupsQuery();
  const [addGroup] = useAddGroupMutation();
  const [updateGroup] = useUpdateGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();

  const { errorMessage } = useSelector((state: RootState) => state.error);

  const theme = useTheme();
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));

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
    );
  };

  const isLabel: GridFilterOperator = {
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
        return params.row.LABELS?.find((label: any) => label.USR$LABELKEY === filterItem.value);
      };
    },
    InputComponent: CurrentLabelFilter,
    InputComponentProps: { type: 'number' },
  };

  const containLabels: GridFilterOperator = {
    label: 'Содержит',
    value: 'includes',
    getApplyFilterFn: (filterItem: GridFilterItem) => {
      if (
        !filterItem.columnField ||
        !filterItem.value ||
        !filterItem.operatorValue
      ) {
        return null;
      }

      if (!filterItem?.value.length) return (params: any): boolean => true;

      return (params: any): boolean => {
        return params.row.LABELS?.find((label: any) => filterItem.value.find((el: any) => el.ID === label.USR$LABELKEY));
      };
    }
  };

  const containContracts: GridFilterOperator = {
    label: 'Содержит',
    value: 'includes',
    getApplyFilterFn: (filterItem: GridFilterItem) => {
      if (
        !filterItem.columnField ||
        !filterItem.value ||
        !filterItem.operatorValue
      ) {
        return null;
      }

      if (!filterItem?.value.length) return (params: any): boolean => true;

      return (params: any): boolean => {
        return params.row.CONTRACTS?.find((contract: any) => filterItem.value.find((el: any) => el.ID === contract.ID));
      };
    }
  };

  const containDepartments: GridFilterOperator = {
    label: 'Содержит',
    value: 'includes',
    getApplyFilterFn: (filterItem: GridFilterItem) => {
      if (
        !filterItem.columnField ||
        !filterItem.value ||
        !filterItem.operatorValue
      ) {
        return null;
      }

      if (!filterItem?.value.length) return (params: any): boolean => true;

      return (params: any): boolean => {
        return params.row.DEPARTMENTS?.find((department: any) => filterItem.value.find((el: any) => el.ID === department.ID));
      };
    }
  };

  const columns: GridColDef[] = [
    { field: 'NAME', headerName: 'Наименование', flex: 1, minWidth: 200 },
    { field: 'FOLDERNAME', headerName: 'Папка', width: 150 },
    { field: 'PHONE', headerName: 'Телефон', width: 150 },
    { field: 'LABELS',
      headerName: 'Метки',
      width: 380,
      filterOperators: [isLabel, containLabels],
      renderCell: (params) => {
        const numberLabelsInRow = 2;

        // const labels: ILabelsContact[] | undefined = labelsContact?.queries.labels.filter(el => el.USR$CONTACTKEY === params.id);
        const labels: ILabelsContact[] = params.row.LABELS;

        if (!labels?.length) {
          return;
        }
        return (
          <Stack direction="column">
            {labels.map((label, index) => {
              if (index % numberLabelsInRow === 0) {
                return (
                  <List
                    key={label.ID + index * 10}
                    style={{
                      flexDirection: 'row',
                      padding: '4px',
                      width: 'fit-content',
                    }}
                  >
                    {labels.slice(index, index + numberLabelsInRow).map((subLabel, index) => {
                      return (
                        <ListItemButton
                          key={subLabel.ID}
                          onClick={() => {
                            setFilterModel({ items: [{ id: 1, columnField: 'LABELS', value: subLabel.USR$LABELKEY, operatorValue: 'is' }] });
                            setFilteringData({ 'LABELS': [{ ID: subLabel.USR$LABELKEY }] });
                          }}
                          style={labelStyle}
                        >
                          {groups?.find(hierarchy => hierarchy.ID === subLabel.USR$LABELKEY)?.NAME}
                        </ListItemButton>
                      );
                    })}
                  </List>
                );
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
      resizable: false,
      align: 'center',
      renderCell: (params) => {
        const customerId = Number(params.id);

        const handleCustomerEdit = () => {
          setCurrentOrganization(customerId);
          setOpenEditForm(true);
        };

        const detailsComponent = {
          // eslint-disable-next-line react/display-name
          component: forwardRef((props, ref: ForwardedRef<any>) => <Link ref={ref} {...props} to={`details/${customerId}`} target="_self" />)
        };

        return (
          <Box>
            <IconButton {...detailsComponent} disabled={customersLoading} >
              <VisibilityIcon fontSize="small" color="primary" />
            </IconButton>
            <IconButton onClick={handleCustomerEdit} disabled={customersLoading} >
              <EditOutlinedIcon fontSize="small" color="primary" />
            </IconButton>
          </Box>
        );
      }
    },
    { field: 'CONTRACTS', headerName: 'Заказы', filterOperators: [containContracts] },
    { field: 'DEPARTMENTS', headerName: 'Отделы', filterOperators: [containDepartments] },
  ];


  useEffect(() => {
    dispatch(fetchCustomers({ paginationData: paginationData }));
  }, []);

  useEffect(() => {
    if (customersError) {
      setSnackBarMessage(customersError.toString());
      setOpenSnackBar(true);
    };

    if (errorMessage) {
      setSnackBarMessage(errorMessage);
      setOpenSnackBar(true);
    };
  }, [customersError, errorMessage]);

  /** Перевод вложенной структуры с lb rb в бинарное дерево */
  const tree: NestedSets = new NestedSets({
    id: 'ID',
    parentId: 'PARENT',
    lft: 'LB',
    rgt: 'RB'
  });

  if (groups) {
    const arr: CollectionEl[] = groups.map(({ NAME, ...el }) => ({ ...el, PARENT: el.PARENT || 0 }));
    tree.loadTree(arr, { createIndexes: true });
  }

  // useEffect(() => {
  //   dispatch(fetchHierarchy());

  // }, [allCustomers]);

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

  /** Cancel organization change */
  const handleOrganiztionEditCancelClick = () => {
    setOpenEditForm(false);
  };

  const handleOrganiztionEditSubmit = async (values: ICustomer, deleting: boolean) => {
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

    if (values.LABELS?.length) {
      addLabelsContact(values.LABELS);
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
    };

    dispatch(deleteCustomer(currentOrganization));
  };


  const filterHandlers = {
    handleFilter: async () => {
      if (displayDataGrid) {
        setDisplayDataGrid(false);
      };

      setOpenFilters(!openFilters);
    },
    handleRequestSearch: async (value: string) => {
      setSearchName(value);
    },
    handleCancelSearch: async () => {
      setSearchName('');
    },
    handleChange: async (value: string) => {
      setSearchName(value);
    },
    handleFilteringData: async (newValue: IFilteringData) => {
      const filterModels: any[] = [];

      for (const [key, arr] of Object.entries(newValue)) {
        filterModels.push({ id: 2, columnField: key, value: arr, operatorValue: 'includes' });
      };

      setFilterModel({ items: filterModels });
      setFilteringData(newValue);
    },
    handleFilterClose: async (event: any, reason: 'backdropClick' | 'escapeKeyDown') => {
      if (
        event.type === 'keydown' &&
        (event.key === 'Tab' || event.key === 'Shift')
      ) {
        return;
      }
      setOpenFilters(false);
    }
  };


  // const contactGroupHandlers = {
  //   handleAdd: async () => {
  //     setAddingGroup(true);
  //     setOpenContactGroupEditForm(true);
  //   },
  //   handleCancel: async () => setOpenContactGroupEditForm(false),
  //   onSubmit: async (value: IContactWithLabels) => {
  //     setOpenContactGroupEditForm(false);

  //     if (!value.ID) {
  //       addGroup(value);
  //       return;
  //     }

  //     updateGroup(value);
  //   },
  //   handleEdit: async (nodeId: number) => {
  //     setAddingGroup(false);
  //     setEditingTreeNodeId(nodeId);
  //     setOpenContactGroupEditForm(true);
  //   },
  //   handleDelete: async(nodeId: number) => {
  //     /** если удаляем текущую папку */
  //     if (treeNodeId === nodeId) setTreeNodeId(null);

  //     deleteGroup(nodeId);
  //   }

  // };


  return (
    <Stack flex={1} display="flex" direction="column" spacing={2} style={{ overflow: 'hidden' }}>
      <Stack direction="row" flex={1} >
        {/* <Stack direction="column" flex="1" padding={2}>
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
        </Stack> */}
        <Stack direction="column" style={{ width: '100%' }} padding={2}>
          <Box sx={{ mb: 1 }}>
            <Stack direction="row" spacing={2}>
              <Box display="flex" justifyContent="center">
                <Button onClick={()=> dispatch(fetchCustomers({ paginationData: paginationData }))} disabled={customersLoading} startIcon={<RefreshIcon/>}>Обновить</Button>
                <Button onClick={handleAddOrganization} disabled={customersLoading} startIcon={<AddIcon/>}>Добавить</Button>
                <Button
                  component="a"
                  href={`employee/reports/reconciliation/${currentOrganization}`}
                  disabled={customersLoading}
                  startIcon={<SummarizeIcon />}
                >Акт сверки</Button>
              </Box>
              <Box flex={1} />
              <Box>
                <SearchBar
                  disabled={customersLoading}
                  // onChange={filterHandlers.handleChange}
                  onCancelSearch={filterHandlers.handleCancelSearch}
                  onRequestSearch={filterHandlers.handleRequestSearch}
                  cancelOnEscape
                  placeholder="Поиск клиента"
                />
              </Box>
              <Box display="flex" justifyContent="center">
                <Button onClick={filterHandlers.handleFilter} disabled={customersLoading || !displayDataGrid} startIcon={<FilterAltIcon />}>
                  Фильтр
                </Button>
              </Box>
            </Stack>
          </Box>
          <Stack direction="row" flex={1} display="flex">
            <CustomizedCard
              borders
              boxShadows
              style={{
                width: '100%',
                ...(matchDownLg
                  ? {}
                  : {
                    transition: `${theme.transitions.create('width', {
                      easing: theme.transitions.easing.easeInOut,
                      duration: theme.transitions.duration.standard,
                    })}`
                  }),
              }}
            >
              <DataGridPro
                className={classes.DataGrid}
                style={{
                  display: `${displayDataGrid ? 'flex' : 'none'}`,
                }}
                localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                rows={
                  allCustomers
                    // .filter(customer => (tree.all.length && treeNodeId) ? tree.getAllChilds(treeNodeId, false).results.map(el => el.ID).includes(Number(customer.PARENT)) : true)
                    .filter(customer => customer.NAME.toUpperCase().includes(searchName.toUpperCase()))
                    ?? undefined}
                columns={columns}
                columnVisibilityModel={{
                  CONTRACTS: false,
                  DEPARTMENTS: false
                }}
                pagination
                disableMultipleSelection
                loading={customersLoading}
                getRowId={row => row.ID}
                onSelectionModelChange={ids => setCurrentOrganization(ids[0] ? Number(ids[0]) : 0)}
                components={{
                  Toolbar: CustomGridToolbarOverlay,
                  LoadingOverlay: CustomLoadingOverlay,
                  NoRowsOverlay: CustomNoRowsOverlay
                }}
                filterModel={filterModel}
                onFilterModelChange={(model, detail) => setFilterModel(model)}
                pinnedColumns={{ left: [customersLoading ? '' : 'NAME'] }}
                getRowHeight={(params) => {
                  const customer: ICustomer = params.model as ICustomer;
                  const labels: ILabelsContact[] | undefined = customer.LABELS;

                  if (labels?.length) {
                    return 50 * Math.ceil(labels.length / 2);
                  };

                  return 50;
                }}
                pageSize={paginationData.pageSize}
                onPageChange={(data) => {
                  setPaginationData(prevState => ({ ...prevState, pageNo: data }));
                }}
                onPageSizeChange={(data) => {
                  setPaginationData(prevState => ({ ...prevState, pageSize: data }));
                }}
              />
            </CustomizedCard>
            <Box
              onTransitionEnd={() => setDisplayDataGrid(true)}
              display="flex"
              style={{
                ...(matchDownLg
                  ? {}
                  : {
                    marginLeft: theme.spacing(3),
                    marginRight: `${openFilters ? '0px' : '-' + theme.spacing(3)}`,
                    width: `${openFilters ? '300px' : '0px'}`,
                    transition: `${theme.transitions.create(['width', 'margin'], {
                      easing: theme.transitions.easing.easeInOut,
                      duration: theme.transitions.duration.standard,
                    })}`
                  })
              }}
            >
              <CustomersFilter
                open={openFilters}
                onClose={filterHandlers.handleFilterClose}
                filteringData={filteringData}
                onFilteringDataChange={filterHandlers.handleFilteringData}
              />
            </Box>
          </Stack>
        </Stack>
        {/* </div> */}
      </Stack>
      {openEditForm ?
        <CustomerEdit
          open={openEditForm}
          customer={
            allCustomers
              .find(element => element.ID === currentOrganization)
            || null
          }
          onSubmit={handleOrganiztionEditSubmit}
          onCancelClick={handleOrganiztionEditCancelClick}
          onDeleteClick={handleOrganizationDeleteOnClick}
        />
        : null
      }
      <Snackbar open={openSnackBar} autoHideDuration={5000} onClose={handleSnackBarClose}>
        <Alert onClose={handleSnackBarClose} variant="filled" severity="error">{snackBarMessage}</Alert>
      </Snackbar>
    </Stack>
  );
}

export default Customers;
