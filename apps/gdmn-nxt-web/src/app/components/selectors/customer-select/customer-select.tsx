import { ICustomer, ITimeTrackProject, ITimeTrackTask } from '@gsbelarus/util-api-types';
import { Autocomplete, AutocompleteRenderOptionState, Box, Button, Checkbox, IconButton, InputAdornment, List, ListItem, ListItemButton, ListItemText, ListSubheader, Stack, SxProps, Theme, TextField, TextFieldProps, Tooltip, Typography, createFilterOptions, Popper, useMediaQuery } from '@mui/material';
import CustomerEdit from 'apps/gdmn-nxt-web/src/app/customers/customer-edit/customer-edit';
import { useAddFavoriteMutation, useDeleteFavoriteMutation, useAddCustomerMutation, useGetCustomersQuery, useUpdateCustomerMutation } from 'apps/gdmn-nxt-web/src/app/features/customer/customerApi_new';
import { forwardRef, HTMLAttributes, MouseEvent, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CustomPaperComponent from '@gdmn-nxt/helpers/custom-paper-component/custom-paper-component';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EditIcon from '@mui/icons-material/Edit';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { makeStyles } from '@mui/styles';
import SwitchStar from '@gdmn-nxt/components/switch-star/switch-star';
import { GroupHeader, GroupItems } from '../../Kanban/kanban-edit-card/components/group';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';
import pluralize from 'libs/util-useful/src/lib/pluralize';
import { useAddFavoriteProjectMutation, useAddFavoriteTaskMutation, useDeleteFavoriteProjectMutation, useDeleteFavoriteTaskMutation, useGetProjectsQuery } from 'apps/gdmn-nxt-web/src/app/features/time-tracking';
import { useAutocompleteVirtualization } from '@gdmn-nxt/helpers/hooks/useAutocompleteVirtualization';
import { maxVirtualizationList } from '@gdmn/constants/client';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import WarningIcon from '@mui/icons-material/Warning';
import { Navigate, useNavigate } from 'react-router-dom';
import { saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import { useDispatch } from 'react-redux';

function preventAction<T>(e: MouseEvent<T>) {
  e.stopPropagation();
  e.preventDefault();
}

type BaseTextFieldProps = Omit<
  TextFieldProps,
  'onChange'
>;

type Value<Multiple> = (Multiple extends true ? Array<ICustomer> : ICustomer) | null;

interface CustomerSelectProps<Multiple extends boolean | undefined> extends BaseTextFieldProps {
  value?: Value<Multiple>;
  onChange?: (value: Value<Multiple> | undefined | null) => void;
  multiple?: Multiple;
  disableCreation?: boolean;
  disableEdition?: boolean;
  disableCaption?: boolean;
  disableFavorite?: boolean;
  disableCloseOnSelect?: boolean;
  withTasks?: boolean;
  task?: ITimeTrackTask;
  limitTags?: number;
  onTaskSelected?: (task: ITimeTrackTask | null) => void;
  required?: boolean;
  /** Отображать информацию по задолженностям */
  debt?: boolean;
  /** Отображать информацию по договорам */
  agreement?: boolean;
  showTasks?: boolean;
  disableClear?: boolean;
  ticketSystem?: boolean;
};

export function CustomerSelect<Multiple extends boolean | undefined = false>(props: Readonly<CustomerSelectProps<Multiple>>) {
  const {
    value,
    onChange,
    multiple = false,
    disableCreation = false,
    disableEdition = false,
    disableCaption = false,
    disableFavorite = true,
    disableCloseOnSelect = false,
    withTasks = false,
    limitTags = 2,
    style,
    task,
    onTaskSelected,
    required,
    debt = false,
    agreement = false,
    disableClear,
    ticketSystem,
    ...rest
  } = props;

  const { data: customersResponse, isFetching: customersIsFetching } = useGetCustomersQuery({
    filter: {
      withTasks,
      withAgreements: agreement,
      withDebt: debt,
      ticketSystem: ticketSystem
    }
  });
  const customers: ICustomer[] = useMemo(
    () => [...(customersResponse?.data ?? [])],
    [customersResponse?.data]
  );

  const [insertCustomer, { isSuccess: insertCustomerIsSuccess, isLoading: insertCustomerIsLoading, data: newCustomer }] = useAddCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();

  const [addFavorite] = useAddFavoriteMutation();
  const [deleteFavorite] = useDeleteFavoriteMutation();

  const [addCustomer, setAddCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ICustomer | null>(null);

  useEffect(() => {
    if (insertCustomerIsSuccess) {
      onChange && onChange((multiple ? [newCustomer] : newCustomer) as Value<Multiple>);
    }
  }, [insertCustomerIsSuccess, multiple, newCustomer]);

  const handleAddCustomer = useCallback(() => {
    setEditingCustomer(null);
    setAddCustomer(true);
  }, []);

  const handleEditCustomer = useCallback((customer: ICustomer | undefined) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!customer) return;
    setEditingCustomer(customer);
    setAddCustomer(true);
  }, []);

  const handleSubmitCustomer = useCallback((customer: ICustomer) => {
    if (!editingCustomer) {
      insertCustomer(customer);
    } else {
      updateCustomer(customer);
    }
    setAddCustomer(false);
  }, [editingCustomer]);

  const handleCancelCustomer = useCallback(() => setAddCustomer(false), []);

  const handleChange = (e: any, newValue: ICustomer | ICustomer[] | null) => {
    onChange && onChange(newValue as Value<Multiple>);
    if (!newValue) {
      setSelectedTask(null);
      onTaskSelected && onTaskSelected(null);
    }
  };

  const memoPaperFooter = useMemo(() =>
    <div>
      {disableCreation
        ? <></>
        : <Button
          startIcon={<AddCircleRoundedIcon />}
          onClick={handleAddCustomer}
        >
          Создать клиента
        </Button>}
    </div>,
    [disableCreation]);

  const memoCustomerUpsert = useMemo(() =>
    <CustomerEdit
      open={addCustomer}
      deleteable={false}
      customer={editingCustomer}
      onCancel={handleCancelCustomer}
      onSubmit={handleSubmitCustomer}
    />, [addCustomer, editingCustomer]);

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: withTasks || !disableFavorite ? 100 : maxVirtualizationList,
    ignoreCase: true,
    stringify: (option: ICustomer) => `${option.NAME} ${option.TAXID}`,
  });

  const handleFavoriteClick = useCallback((customer: ICustomer) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    customer.isFavorite
      ? deleteFavorite(customer.ID)
      : addFavorite(customer.ID);
  }, []);

  const [selectedTask, setSelectedTask] = useState<ITimeTrackTask | null>(null);

  const handleTaskSelect = useCallback((task: ITimeTrackTask) => {
    onTaskSelected && onTaskSelected(task);
    setSelectedTask(task);
  }, [onTaskSelected]);

  useEffect(() => {
    if (!value) {
      setSelectedTask(null);
    }
  }, [value]);

  useEffect(() => {
    if (!task) {
      return;
    }
    setSelectedTask(task);
  }, [task]);

  const [ListboxComponent] = useAutocompleteVirtualization();

  const {
    data,
    isLoading: projectsIsLoading,
    isFetching: projectsIsFetching
  } = useGetProjectsQuery({
    ...(!Array.isArray(value)
      ? { filter: { customerId: value?.ID, groupByFavorite: true, taskisActive: true, status: 'active' } }
      : {}),
  }, {
    skip: multiple || !value || !withTasks
  });

  const projects = data?.projects || [];

  useEffect(() => {
    if (multiple) return;
    if (projectsIsLoading) return;
    if (projects.length !== 1) return;
    const defaultTasks = projects[0].tasks ?? [];

    if (defaultTasks.length !== 1) return;

    const { tasks, ...project } = projects[0];

    handleTaskSelect({ ...defaultTasks[0], project });
  }, [multiple, projects, projectsIsLoading]);

  const taskSelectAreaRef = useRef<HTMLDivElement>(null);
  const [taskSelectAreaWidth, setTaskSelectAreaWidth] = useState(0);

  useEffect(() => {
    if (projects.length === 0) {
      setTaskSelectAreaWidth(0);
      return;
    }

    setTaskSelectAreaWidth(taskSelectAreaRef.current?.clientWidth ?? 0);
  }, [selectedTask?.name, projects.length]);

  const mobile = useMediaQuery('(pointer: coarse)');

  return (
    <div style={{ position: 'relative', ...style }}>
      <Box
        ref={taskSelectAreaRef}
        display={{ xs: 'none', md: 'block' }}
        style={{
          position: 'absolute',
          right: '14px',
          top: '9px',
          maxWidth: '50%',
          zIndex: 99,
        }}
      >
        <div
          style={{
            display: (projects.length === 0) ? 'none' : 'inline-flex',
            position: 'relative',
            zIndex: 2,
            color: 'transparent',
            width: '100%'
          }}
        >
          <Stack direction={'row'}>
            {projectsIsLoading
              ? 'Загрузка'
              : `${selectedTask?.name ?? 'Выберите задачу'}`
            }
            <Box width={34} />
          </Stack>
          <CustomerTasks
            sx={{
              '& .MuiInputBase-input': {
                marginRight: '16px'
              },
              '& .MuiAutocomplete-endAdornment': {
                top: '40%'
              }
            }}
            projects={projects}
            task={selectedTask}
            onSelect={handleTaskSelect}
          />
        </div>
      </Box>
      <Autocomplete
        style={style}
        fullWidth
        ListboxComponent={ListboxComponent}
        multiple={multiple}
        disableCloseOnSelect={disableCloseOnSelect}
        limitTags={limitTags}
        PaperComponent={CustomPaperComponent({ footer: memoPaperFooter })}
        getOptionLabel={useCallback((option: ICustomer) => option.NAME, [])}
        filterOptions={filterOptions}
        sx={{
          '& .MuiInputBase-root': {
            ...(withTasks ? { paddingRight: (taskSelectAreaWidth ? (taskSelectAreaWidth + 74) : '39') + 'px !important' } : {}),
            ...(disableClear ? { paddingRight: '40px !important' } : {})
          },
          '& .MuiAutocomplete-clearIndicator': disableClear ? {
            display: 'none'
          } : {}
        }}
        {...(!disableFavorite && {
          groupBy: (option: ICustomer) => (option.isFavorite ? 'Избранные' : 'Остальные')
        })}
        loading={customersIsFetching || insertCustomerIsLoading}
        {...(insertCustomerIsLoading
          ? {
            options: [],
            value: multiple ? [] : null
          }
          : {
            options: customers,
            value: multiple && Array.isArray(value)
              ? customers.filter(customer => value?.find(el => el.ID === customer.ID)) ?? []
              : customers?.find(el => el.ID === (value as ICustomer)?.ID) ?? null
          })
        }
        loadingText="Загрузка данных..."
        onChange={handleChange}
        renderOption={useCallback((props: HTMLAttributes<HTMLLIElement>, option: ICustomer, { selected, index, inputValue }: AutocompleteRenderOptionState) => {
          const handleCustomerSelect = (e: MouseEvent<HTMLDivElement>, customer: ICustomer) => {
            /** Need to pass some attributes for event */
            e.currentTarget.setAttribute('data-option-index', index.toString());
            props.onClick && props.onClick(e as unknown as MouseEvent<HTMLLIElement>);

            setSelectedTask(null);
            onTaskSelected && onTaskSelected(null);
          };

          return (
            <ListItem
              {...props}
              key={option.ID}
              disablePadding
              sx={{
                py: '4px !important',
                '&:hover .action': {
                  display: 'flex !important',
                },
                px: '0px !important',
                '& .StyledEditButton': {
                  visibility: mobile ? 'visible' : 'hidden',
                },
                '&:hover .StyledEditButton, &:focus-within .StyledEditButton': {
                  visibility: 'visible',
                }
              }}
            >
              <CustomerItem
                customer={option}
                selected={selected}
                multiple={multiple}
                withTasks={withTasks}
                disableCaption={disableCaption}
                disableEdition={disableEdition}
                disableFavorite={disableFavorite}
                debt={debt}
                agreement={agreement}
                editCustomer={handleEditCustomer}
                favoriteClick={handleFavoriteClick}
                onCustomerSelect={handleCustomerSelect}
              />
            </ListItem>
          );
        }, [mobile, multiple, withTasks, disableCaption, disableEdition, disableFavorite, debt, agreement, handleEditCustomer, handleFavoriteClick, onTaskSelected])}
        renderInput={useCallback((params) => (
          <TextField
            label="Клиент"
            required={required}
            placeholder={`${insertCustomerIsLoading ? 'Создание...' : 'Выберите клиента'}`}
            {...params}
            {...rest}
            sx={{
              ...rest.sx,
              '& .MuiAutocomplete-endAdornment': withTasks ? {
                right: (taskSelectAreaWidth ? taskSelectAreaWidth + 26 : 9) + 'px !important'
              } : {}
            }}
            InputProps={{
              ...params.InputProps,
              ...rest.InputProps,
              endAdornment: (
                <>
                  {(value && (!Array.isArray(value))) && !disableEdition &&
                    <IconButton
                      className="editIcon"
                      title="Изменить"
                      size="small"
                      onClick={handleEditCustomer(customers?.find(el => el.ID === value?.ID))}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>}
                  {params.InputProps.endAdornment}
                </>)
            }}
          />
        ), [required, insertCustomerIsLoading, rest, withTasks, taskSelectAreaWidth, value, disableEdition, handleEditCustomer, customers])}
        renderGroup={(params) => (
          <li key={params.key}>
            <GroupHeader>
              <Typography variant="subtitle1">{params.group}</Typography>
            </GroupHeader>
            <GroupItems>{params.children}</GroupItems>
          </li>
        )}
      />
      {memoCustomerUpsert}
    </div>
  );
}

interface CustomerItemProps {
  customer: ICustomer;
  selected: boolean;
  multiple?: boolean;
  withTasks?: boolean;
  disableCaption?: boolean;
  disableFavorite?: boolean;
  disableEdition?: boolean;
  debt?: boolean;
  agreement?: boolean;
  editCustomer: (customer: ICustomer | undefined) => (e: MouseEvent<HTMLButtonElement>) => void;
  favoriteClick: (customer: ICustomer) => (e: MouseEvent<HTMLElement>) => void;
  onCustomerSelect: (event: MouseEvent<HTMLDivElement>, customer: ICustomer) => void;
};

const CustomerItem = ({
  customer,
  selected,
  multiple = false,
  withTasks = false,
  disableCaption = true,
  disableFavorite = true,
  disableEdition = false,
  debt = false,
  agreement = false,
  editCustomer,
  favoriteClick,
  onCustomerSelect,
}: CustomerItemProps) => {
  const customerClick = useCallback((customer: ICustomer) => (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onCustomerSelect(e, customer);
  }, [onCustomerSelect]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const taskCount = useMemo(() => customer?.taskCount ?? 0, [customer?.taskCount]);

  const agreementClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    preventAction<HTMLButtonElement>(e);

    const newContractsFilters = {
      isActive: true,
      customers: [{ ...customer }]
    };
    dispatch(saveFilterData({ 'contracts': newContractsFilters }));

    navigate('/employee/managment/contracts', { relative: 'path' });
  }, []);

  return (
    <Stack
      flex={1}
      minWidth={0}
    >
      <Stack
        flex={1}
        direction={'row'}
        alignItems={'initial'}
        spacing={1}
        style={{ padding: '2px 16px', minHeight: '36px' }}
        onClick={customerClick(customer)}
      >
        {multiple &&
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon />}
            style={{ marginRight: 8 }}
            checked={selected}
          />}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', minWidth: 0 }}>
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >{customer.NAME}</span>
          {!disableCaption && customer.TAXID
            ? <Typography variant="caption">{`УНП: ${customer.TAXID}`}</Typography>
            : <></>}
        </div>
        <Stack
          direction="row"
          spacing={{ xs: 0, sm: 1 }}
        >
          <Box flex={1} display={{ xs: 'none', sm: 'block' }} />
          {withTasks && (taskCount ?? 0) > 0 &&
            <Stack
              direction="row"
              alignItems={'center'}
              spacing={0.5}
            >
              <Typography>{`${taskCount} ${pluralize(taskCount ?? 0, 'задача', 'задачи', 'задач')}`}</Typography>
            </Stack>
          }
          <Box flex={1} display={{ xs: 'block', sm: 'none' }} />
          {!(disableEdition && !agreement && !debt && disableFavorite) &&
            <Stack
              className="action"
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{
                display: 'flex',
              }}
            >
              {!disableEdition &&
                <ItemButtonEdit
                  style={{ flex: 0 }}
                  button
                  onClick={editCustomer(customer)}
                />
              }
              {agreement && (customer.agreementCount ?? 0) > 0 && (
                <Tooltip title="Действует договор">
                  <IconButton onClick={agreementClick}>
                    <ContentPasteIcon fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
              )}
              {debt && (customer.debt ?? 0) > 0 && (
                <Tooltip
                  title={`Есть задолженность ${Intl.NumberFormat('ru-BE', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(customer.debt ?? 0)} руб.`}
                  onClick={preventAction<HTMLDivElement>}
                >
                  <WarningIcon fontSize="small" color="warning" />
                </Tooltip>
              )}
              {!disableFavorite &&
                <SwitchStar selected={!!customer.isFavorite} onClick={favoriteClick(customer)} />
              }

            </Stack>
          }
        </Stack>
      </Stack>
    </Stack>
  );
};

const filterProjects = (limit = 50) => createFilterOptions({
  matchFrom: 'any',
  ignoreCase: true,
  stringify: (option: ITimeTrackProject) => `${option.name} ${option.tasks?.map(task => task.name).join(' ')}`,
});

const ListboxComponent = forwardRef<
  HTMLUListElement,
  HTMLAttributes<HTMLElement>
>(function ListboxComponent(
  props,
  ref
) {
  const { children, ...other } = props;

  return (
    <List
      {...other}
      subheader={<li />}
      dense
      disablePadding
      ref={ref}
      sx={{
        width: '100%',
        position: 'relative',
        overflow: 'auto',
        zIndex: 0,
        '& ul': {
          padding: 0,
          flex: 1
        },
      }}
    >
      {children}
    </List>
  );
});

interface CustomerTasksProps {
  projects: ITimeTrackProject[];
  task: ITimeTrackTask | null;
  sx?: SxProps<Theme>;
  onSelect: (task: ITimeTrackTask) => void;
};

const CustomerTasks = ({
  projects,
  task,
  sx,
  onSelect
}: Readonly<CustomerTasksProps>) => {
  const [addFavoriteProject] = useAddFavoriteProjectMutation();
  const [deleteFavoriteProject] = useDeleteFavoriteProjectMutation();

  const toggleProjectFavorite = (id: number, favorite: boolean) => () => {
    if (favorite) {
      deleteFavoriteProject(id);
      return;
    }
    addFavoriteProject(id);
  };

  const [addFavoriteTask] = useAddFavoriteTaskMutation();
  const [deleteFavoriteTask] = useDeleteFavoriteTaskMutation();

  const toggleTaskFavorite = (taskId: number, projectId: number, favorite: boolean) => (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    e.stopPropagation();
    if (favorite) {
      deleteFavoriteTask({ taskId, projectId });
    } else {
      addFavoriteTask({ taskId, projectId });
    }
  };

  const taskSelect = useCallback((task: ITimeTrackTask) => () => {
    onSelect(task);
  }, [onSelect]);

  const [selectedProject, setSelectedProject] = useState<ITimeTrackProject | null>(null);

  const projectOnChange = (
    e: SyntheticEvent,
    value: ITimeTrackProject | null
  ) => {
    setSelectedProject(value);
  };

  useEffect(() => {
    if (!task?.project || !projects) {
      return;
    }

    const project = projects.find(project => project.ID === task?.project?.ID);
    if (!project) return;
    setSelectedProject(project);
  }, [projects, task?.project]);

  const CustomPopper = (props: any) => {
    return <Popper {...props} style={{ width: 'fit-content' }} />;
  };

  return (
    <Autocomplete
      PopperComponent={CustomPopper}
      options={projects}
      getOptionLabel={() => task?.name ?? ''}
      filterOptions={filterProjects()}
      onChange={projectOnChange}
      value={selectedProject}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          placeholder="Выберите задачу"
          InputProps={{
            ref: params.InputProps.ref,
            endAdornment: params.InputProps.endAdornment
          }}
        />
      )}
      groupBy={({ isFavorite }: ITimeTrackProject) => isFavorite ? 'Избранные' : 'Остальные'}
      renderGroup={(params) => (
        <li key={params.key}>
          <GroupHeader>
            <Typography variant="subtitle1">{params.group}</Typography>
          </GroupHeader>
          <GroupItems>{params.children}</GroupItems>
        </li>
      )}
      ListboxComponent={ListboxComponent}
      renderOption={(props, { tasks, ...option }) => (
        <li
          {...props}
          key={`section-${option.ID}`}
          style={{
            padding: 0,
          }}
        >
          <ul>
            <ListSubheader
              style={{
                zIndex: 0,
                lineHeight: '36px',
                cursor: 'text',
              }}
              onClick={preventAction<HTMLLIElement>}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                {option.name}
                {/* <Box flex={1} minWidth={12} />
                <SwitchStar
                  selected={!!option.isFavorite}
                  onClick={toggleProjectFavorite(option.ID, !!option.isFavorite)}
                /> */}
              </div>
            </ListSubheader>
            {tasks?.map(task => (
              <ListItem
                key={`item-${option.ID}-${task.ID}`}
                onClick={taskSelect({ ...task, project: option })}
                disablePadding
                style={{
                  backgroundColor: 'var(--color-main-bg)',
                }}
              >
                <ListItemButton>
                  <ListItemText inset primary={task.name} />
                  <Box flex={1} minWidth={12} />
                  <SwitchStar
                    selected={!!task.isFavorite}
                    onClick={toggleTaskFavorite(task.ID, option.ID, !!task.isFavorite)}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </ul>
        </li>
      )}
      sx={{
        position: 'absolute',
        top: -2,
        width: '100%',
        '& .MuiInput-root::before': { borderBottom: 0 },
        '& .MuiAutocomplete-clearIndicator': {
          display: 'none'
        },
        ...sx
      }}
      slotProps={{
        paper: {
          style: {
            width: 'max-content'
          }
        }
      }}
    />
  );
};
