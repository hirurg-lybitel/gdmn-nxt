import { useGetAllContactsQuery } from '../features/contact/contactApi';
import { DataGridPro, DataGridProProps, GridColDef, GridRenderCellParams, GridRowModel, GridToolbar, useGridApiContext, useGridSelector, ruRU, GridSortModel, GridFilterItem, GridFilterInputValueProps, GridFilterModel, GridFilterOperator } from '@mui/x-data-grid-pro';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem'
import './customers.module.less';
import Stack from '@mui/material/Stack/Stack';
import Button from '@mui/material/Button/Button';
import ReportParams from '../report-params/report-params';
import React, { useEffect, useState } from 'react';
import ReconciliationStatement from '../reconciliation-statement/reconciliation-statement';
import { List, ListItem, ListItemButton, Snackbar } from '@mui/material';
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
import { IContactWithID, IContactWithLabels, ILabelsContact } from '@gsbelarus/util-api-types';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import NestedSets from 'nested-sets-tree';
import { CollectionEl } from 'nested-sets-tree';
import SalesFunnel from '../sales-funnel/sales-funnel';
import { useAddLabelsContactMutation, useGetLabelsContactQuery } from '../features/labels/labelsApi';


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

  const [filterModel, setFilterModel] = useState<GridFilterModel>();

  const allCustomers = useSelector(customersSelectors.selectAll);
  const allHierarchy = useSelector(hierarchySelectors.selectAll);
  const { error: customersError , loading: customersLoading } = useSelector((state: RootState) => state.customers);
  const dispatch = useDispatch();

  const [addLabelsContact, { error, isSuccess, isError, isLoading, status }] = useAddLabelsContactMutation();


  const { data: labelsContact, currentData, error: labelError } = useGetLabelsContactQuery();


  const ratingOnlyOperators: GridFilterOperator[] = [
    {
      label: 'From',
      value: 'from',
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
      //InputComponent: <Button/>,
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
      filterOperators: ratingOnlyOperators,
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
                      onClick={ () => setFilterModel({items: [{ id: 1, columnField: 'labels', value: label.LABEL, operatorValue: 'from' }]})}
                      style={{
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
                        margin: '0px 5px'
                      }}
                    >
                    {allHierarchy.find(hierarchy => hierarchy.ID === label.LABEL)?.NAME}
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
                      <ListItem
                        key={label.ID}
                        style={{
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
                          margin: '0px 5px'
                        }}
                      >
                      {allHierarchy.find(hierarchy => hierarchy.ID === label.LABEL)?.NAME}
                      </ListItem>
                    )
                  })
                }

              </List>
              : null}

          </Stack>
        );

        return null;

        return (
          <Stack
            direction="column"
          >
            {Math.floor(Math.random() * 2) === 1 ?
          <List style={{
            display: 'flex',
            flexDirection: 'row',
            padding: 0,
            margin: 1,
            width: 'fit-content'
            }}
          >
            {Math.floor(Math.random() * 2) === 1 ?
            <ListItem
              key={1}
              style={{
                display: 'inline-block',
                fontSize: '0.625rem',
                fontWeight: 'bold',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
                textTransform: 'uppercase',
                border: '1px solid rgb(255, 163, 25)',
                borderRadius: '2em',
                backgroundColor: 'rgba(255, 190, 94, 0.2)',
                color: 'rgb(255, 163, 25)',
                padding: '2.5px 9px',
                margin: '0px 5px'
              }}
              hidden={ Math.floor(Math.random() * 2) === 1}
            >Label 1</ListItem>
            : null}
            {Math.floor(Math.random() * 2) === 1 ?
            <ListItem
              key={2}
              hidden={ Math.floor(Math.random() * 2) === 1}
              style={{
                display: 'inline-block',
                fontSize: '0.625rem',
                fontWeight: 'bold',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
                textTransform: 'uppercase',
                border: '1px solid rgb(255, 163, 25)',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 94, 123, 0.2)',
                color: 'rgb(255, 25, 67)',
                padding: '2.5px 9px',
                margin: '0px 5px'
              }}
            >Label 2</ListItem>
            : null}
            {Math.floor(Math.random() * 2) === 1 ?
            <ListItem
              key={3}
              hidden={ Math.floor(Math.random() * 2) === 1}
              style={{
                display: 'inline-block',
                fontSize: '0.625rem',
                fontWeight: 'bold',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
                textTransform: 'uppercase',
                border: '0px solid black',
                borderRadius: '6px',
                backgroundColor: 'rgba(112, 212, 255, 0.2)',
                color: 'rgb(51, 194, 255)',
                padding: '2.5px 9px',
                margin: '0px 5px'
              }}
            >Label 3</ListItem>
            : null }
          </List>
          : null}
          {Math.floor(Math.random() * 2) === 1 ?
          <List style={{
            display: 'flex',
            flexDirection: 'row',
            padding: 0,
            margin: 1,
            width: 'fit-content'
            }}
          >
            {Math.floor(Math.random() * 2) === 1 ?
            <ListItem
              key={1}
              style={{
                display: 'inline-block',
                fontSize: '0.625rem',
                fontWeight: 'bold',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
                textTransform: 'uppercase',
                border: '1px solid rgb(87, 202, 34)',
                borderRadius: '2em',
                backgroundColor: 'rgba(221, 244, 210, 0.2)',
                color: 'rgb(87, 202, 34)',
                padding: '2.5px 9px',
                margin: '0px 5px'
              }}
              hidden={ Math.floor(Math.random() * 2) === 1}
            >Label 4</ListItem>
            : null}
            {Math.floor(Math.random() * 2) === 1 ?
            <ListItem
              key={2}
              hidden={ Math.floor(Math.random() * 2) === 1}
              style={{
                display: 'inline-block',
                fontSize: '0.625rem',
                fontWeight: 'bold',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
                textTransform: 'uppercase',
                border: '1px solid rgb(255, 163, 25)',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 94, 123, 0.2)',
                color: 'rgb(255, 25, 67)',
                padding: '2.5px 9px',
                margin: '0px 5px'
              }}
            >Label 5</ListItem>
            : null}
            {Math.floor(Math.random() * 2) === 1 ?
            <ListItem
              key={3}
              hidden={ Math.floor(Math.random() * 2) === 1}
              style={{
                display: 'inline-block',
                fontSize: '0.625rem',
                fontWeight: 'bold',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
                textTransform: 'uppercase',
                border: '0px solid black',
                borderRadius: '6px',
                backgroundColor: 'rgba(112, 212, 255, 0.2)',
                color: 'rgb(51, 194, 255)',
                padding: '2.5px 9px',
                margin: '0px 5px'
              }}
            >Label 6</ListItem>
            : null}
          </List>
          : null
          }
          </Stack>
        )
      }
    },
  ];


  useEffect(() => {
    dispatch(fetchCustomers());
  }, [])

  useEffect(() => {
    if (customersError) {

      setSnackBarMessage(customersError.toString());
      setOpenSnackBar(true);
    }
  }, [customersError])


  /** Перевод вложенной структуры с lb rb в бинарное дерево */
  const tree: NestedSets = new NestedSets({
    id: 'ID',
    parentId: 'PARENT',
    lft: 'LB',
    rgt: 'RB'
  });

  const arr: CollectionEl[] = allHierarchy.map(({error, loading, NAME, ...el}) => ({ ...el, PARENT: el.PARENT || 0}) );
  tree.loadTree(arr, {createIndexes: true});

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

  const handleOrganiztionEditSubmit = async (values: IContactWithLabels, deleting: boolean) => {
    setOpenEditForm(false);

    console.log('handleOrganiztionEditSubmit', values);

    addLabelsContact({ contactId: values.ID, labels: values.labels || []});


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


  // function RatingInputValue(props: GridFilterInputValueProps) {
  //   const { item, applyValue, focusElementRef } = props;

  //   const ratingRef: React.Ref<any> = React.useRef(null);
  //   React.useImperativeHandle(focusElementRef, () => ({
  //     focus: () => {
  //       ratingRef.current
  //         .querySelector(`input[value="${Number(item.value) || ''}"]`)
  //         .focus();
  //     },
  //   }));

  // const ratingOnlyOperators: GridFilterOperator[] = [
  //   {
  //     label: 'From',
  //     value: 'from',
  //     getApplyFilterFn: (filterItem: GridFilterItem) => {
  //       if (
  //         !filterItem.columnField ||
  //         !filterItem.value ||
  //         !filterItem.operatorValue
  //       ) {
  //         return null;
  //       }


  //       return (params: any): boolean => {
  //         //if (filterItem.value === 147636485) console.log('value', params);
  //         return params.row.PARENT === filterItem.value;
  //       };
  //     },
  //     //InputComponent: <Button/>,
  //     InputComponentProps: { type: 'number' },
  //   },
  // ];

  // const ratingColumn = columns.find((col) => col.field === 'labels');
  // const newRatingColumn: GridColDef = {
  //   ...ratingColumn!,
  //   filterOperators: ratingOnlyOperators,
  // };

  // //console.log('newRatingColumn', newRatingColumn);

  // const ratingColIndex = columns.findIndex((col) => col.field === 'labels');
  // columns[ratingColIndex] = newRatingColumn;


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
            rows={
              allCustomers
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
      <ReportParams
        open={reconciliationParamsOpen}
        dates={paramsDates}
        onSaveClick={handleSaveClick}
        onCancelClick={handleCancelClick}
      />
      {openEditForm ?
        <CustomerEdit
          open={openEditForm}
          customer={allCustomers.find((element) => element.ID === currentOrganization) || null}
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
