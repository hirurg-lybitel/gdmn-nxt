import { ICustomer, ITimeTrackProject, ITimeTrackTask } from '@gsbelarus/util-api-types';
import { Autocomplete, AutocompleteRenderOptionState, Box, Button, Checkbox, IconButton, InputAdornment, List, ListItem, ListItemButton, ListItemText, ListSubheader, Stack, TextField, TextFieldProps, Tooltip, Typography, createFilterOptions } from '@mui/material';
import CustomerEdit from 'apps/gdmn-nxt-web/src/app/customers/customer-edit/customer-edit';
import { customerApi, useAddCustomerMutation, useGetCustomersQuery, useUpdateCustomerMutation } from 'apps/gdmn-nxt-web/src/app/features/customer/customerApi_new';
import { HTMLAttributes, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import CustomPaperComponent from '../../../helpers/custom-paper-component/custom-paper-component';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EditIcon from '@mui/icons-material/Edit';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { makeStyles } from '@mui/styles';
import SwitchStar from '@gdmn-nxt/components/switch-star/switch-star';
import { GroupHeader, GroupItems } from './group';
import ItemButtonEdit from '@gdmn-nxt/components/item-button-edit/item-button-edit';
import pluralize from 'libs/util-useful/src/lib/pluralize';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAddFavoriteProjectMutation, useAddFavoriteTaskMutation, useDeleteFavoriteProjectMutation, useDeleteFavoriteTaskMutation, useGetProjectsQuery } from 'apps/gdmn-nxt-web/src/app/features/time-tracking';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';

const useStyles = makeStyles(() => ({
  root: {
    '& .editIcon': {
      visibility: 'hidden',
      padding: '4px'
    },
    '&:hover .editIcon, &:focus-within .editIcon': {
      visibility: 'visible',
    }
  },
}));


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
};

export function CustomerSelect<Multiple extends boolean | undefined = false>(props: CustomerSelectProps<Multiple>) {
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
    ...rest
  } = props;

  const classes = useStyles();

  const { data: customersResponse, isFetching: customersIsFetching } = useGetCustomersQuery({
    filter: {
      withTasks
    }
  });
  const customers: ICustomer[] = useMemo(
    () => [...(customersResponse?.data ?? [])],
    [customersResponse?.data]
  );

  const [insertCustomer, { isSuccess: insertCustomerIsSuccess, isLoading: insertCustomerIsLoading, data: newCustomer }] = useAddCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();

  const [addFavorite] = customerApi.useAddFavoriteMutation();
  const [deleteFavorite] = customerApi.useDeleteFavoriteMutation();

  const [addCustomer, setAddCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ICustomer | null>(null);

  useEffect(() => {
    if (insertCustomerIsSuccess) {
      onChange && onChange((multiple ? [newCustomer] : newCustomer) as Value<Multiple>);
    }
  }, [insertCustomerIsSuccess, newCustomer, onChange]);

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
    limit: 50,
    ignoreCase: true,
    stringify: (option: ICustomer) => `${option.NAME} ${option.TAXID} ${option.tasks?.map(task => task.name).join(' ')}`,
  });

  const handleFavoriteClick = useCallback((customer: ICustomer) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    customer.isFavorite
      ? deleteFavorite(customer.ID)
      : addFavorite(customer.ID);
  }, []);

  const [selectedTask, setSelectedTask] = useState<ITimeTrackTask | null>(null);
  const handleTaskSelect = useCallback((task: ITimeTrackTask) => {
    setSelectedTask(task);
    onTaskSelected && onTaskSelected(task);
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

  return (
    <>
      <Autocomplete
        className={classes.root}
        style={style}
        fullWidth
        multiple={multiple}
        disableCloseOnSelect={disableCloseOnSelect}
        limitTags={limitTags}
        PaperComponent={CustomPaperComponent({ footer: memoPaperFooter })}
        getOptionLabel={useCallback((option: ICustomer) => option.NAME, [])}
        filterOptions={filterOptions}
        {
          ...(!disableFavorite && {
            groupBy: (option: ICustomer) => (option.isFavorite ? 'Избранные' : 'Остальные')
          })
        }
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
            /** Don't select directly customer with tasks. Only the task */
            if ((customer.taskCount ?? 0) > 0) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }

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
                py: '2px !important',
                '&:hover .action': {
                  display: 'block !important',
                },
                padding: '0px !important'
              }}
            >
              <CustomerItem
                tasksFilter={inputValue}
                customer={option}
                selected={selected}
                multiple={multiple}
                withTasks={withTasks}
                disableCaption={disableCaption}
                disableEdition={disableEdition}
                disableFavorite={disableFavorite}
                editCustomer={handleEditCustomer}
                favoriteClick={handleFavoriteClick}
                onCustomerSelect={handleCustomerSelect}
                onTaskSelect={handleTaskSelect}
              />
            </ListItem>
          );
        }, [disableCaption, disableEdition, handleEditCustomer, multiple, disableFavorite, withTasks, handleTaskSelect, handleFavoriteClick])}
        renderInput={useCallback((params) => (
          <TextField
            label="Клиент"
            placeholder={`${insertCustomerIsLoading ? 'Создание...' : 'Выберите клиента'}`}
            {...params}
            {...rest}
            InputProps={{
              ...params.InputProps,
              ...rest.InputProps,
              startAdornment: (
                <>
                  {!!selectedTask?.name && <InputAdornment position="end">{selectedTask?.name}</InputAdornment>}
                  {params.InputProps.startAdornment}
                </>
              ),
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
        ), [insertCustomerIsLoading, rest, value, disableEdition, handleEditCustomer, customers])}
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
    </>
  );
}

interface CustomerItemProps {
  tasksFilter?: string,
  customer: ICustomer;
  selected: boolean;
  multiple?: boolean;
  withTasks?: boolean;
  disableCaption?: boolean;
  disableFavorite?: boolean;
  disableEdition?: boolean;
  editCustomer: (customer: ICustomer | undefined) => (e: MouseEvent<HTMLButtonElement>) => void;
  favoriteClick: (customer: ICustomer) => (e: MouseEvent<HTMLElement>) => void;
  onCustomerSelect: (event: MouseEvent<HTMLDivElement>, customer: ICustomer) => void;
  onTaskSelect: (task: ITimeTrackTask) => void;
};

const filterTasks = (tasks: ITimeTrackTask[], filter: string) => {
  if (!filter || !tasks) return tasks;
  return tasks?.filter((task) => task.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
};

const CustomerItem = ({
  tasksFilter,
  customer,
  selected,
  multiple = false,
  withTasks = false,
  disableCaption = true,
  disableFavorite = true,
  disableEdition = false,
  editCustomer,
  favoriteClick,
  onCustomerSelect,
  onTaskSelect
}: CustomerItemProps) => {
  const [expandedTasks, setExpandedTasks] = useState(false);

  const taskClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setExpandedTasks(prev => !prev);
  }, []);

  const handleTaskClick = useCallback((task: ITimeTrackTask) => onTaskSelect(task), [onTaskSelect]);

  const customerClick = useCallback((customer: ICustomer) => (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onCustomerSelect(e, customer);
  }, [onCustomerSelect]);

  const taskCount = useMemo(() => filterTasks(customer?.tasks || [], tasksFilter || '').length, [customer?.tasks, tasksFilter]);

  const notFoundTask = taskCount < 1;

  const endTaskCount = notFoundTask ? customer.taskCount : taskCount;

  return (
    <Stack
      flex={1}
    >
      <Stack
        flex={1}
        direction="row"
        alignItems="center"
        spacing={1}
        style={{ padding: '2px 16px' }}
        onClick={customerClick(customer)}
      >
        {multiple &&
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon />}
            style={{ marginRight: 8 }}
            checked={selected}
          />}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
          {customer.NAME}
          {!disableCaption && customer.TAXID
            ? <Typography variant="caption">{`УНП: ${customer.TAXID}`}</Typography>
            : <></>}
        </div>
        {withTasks && (endTaskCount ?? 0) > 0 &&
          <Stack
            direction="row"
            alignItems={'center'}
            onClick={taskClick}
            spacing={0.5}
          >
            <Typography>{`${endTaskCount} ${pluralize(endTaskCount ?? 0, 'задача', 'задачи', 'задач')}`}</Typography>
            <IconButton
              size="small"
              style={{ padding: 0 }}
              color="inherit"
            >
              {
                expandedTasks
                  ? <KeyboardArrowDownIcon fontSize="small" />
                  : <KeyboardArrowRightIcon fontSize="small" />
              }
            </IconButton>
          </Stack>
        }
        {!disableEdition &&
          <div
            className="action"
            style={{
              display: 'none',
            }}
          >
            <ItemButtonEdit
              color="primary"
              onClick={editCustomer(customer)}
            />
          </div>
        }
        {!disableFavorite &&
          <SwitchStar selected={!!customer.isFavorite} onClick={favoriteClick(customer)} />}
      </Stack>
      <CustomerTasks
        filter={notFoundTask ? '' : tasksFilter}
        open={expandedTasks}
        customerId={customer.ID}
        onSelect={handleTaskClick}
      />
    </Stack>
  );
};

interface CustomerTasksProps {
  open: boolean;
  customerId: number;
  onSelect: (task: ITimeTrackTask) => void;
  filter?: string,
};

const CustomerTasks = ({
  open,
  filter,
  customerId,
  onSelect
}: CustomerTasksProps) => {
  const { data: projects = [] } = useGetProjectsQuery({
    filter: { customerId }
  }, {
    skip: !open
  });

  const filteredAndSortedProjects = useMemo(() => {
    const filtered = [];
    for (const element of projects) {
      const tasks = filterTasks(element.tasks || [], filter || '') ;
      if (tasks?.length > 0) {
        filtered.push({ ...element, tasks: sortByFavorite<ITimeTrackTask[]>(tasks) });
      }
    }
    return sortByFavorite<ITimeTrackProject[]>(filtered);
  }, [filter, projects]);

  function sortByFavorite <S>(mas: any[]): S {
    const favorites = [];
    const other = [];
    for (const element of mas) {
      if (element.isFavorite) {
        favorites.push(element);
      } else {
        other.push(element);
      }
    }
    return [...favorites, ...other] as S;
  };

  const [addFavoriteTask] = useAddFavoriteTaskMutation();
  const [deleteFavoriteTask] = useDeleteFavoriteTaskMutation();

  const handleToggleTaskFavorite = (taskId: number, projectId: number, favorite: boolean) => (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    e.stopPropagation();
    if (favorite) {
      deleteFavoriteTask({ taskId, projectId });
    } else {
      addFavoriteTask({ taskId, projectId });
    }
  };

  const [addFavoriteProject] = useAddFavoriteProjectMutation();
  const [deleteFavoriteProject] = useDeleteFavoriteProjectMutation();

  const handleToggleProjectFavorite = (id: number, favorite: boolean) => () => {
    if (favorite) {
      deleteFavoriteProject(id);
    } else {
      addFavoriteProject(id);
    }
  };

  const taskSelect = useCallback((task: ITimeTrackTask) => () => onSelect(task), [onSelect]);

  const preventAction = useCallback((e: MouseEvent<HTMLLIElement>) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const rowHeight = 72;
  const maxLines = 4;

  return (
    <CustomizedCard
      style={{
        height: open ? (filteredAndSortedProjects.length === 1 ? (filteredAndSortedProjects[0].tasks ?? []).length : filteredAndSortedProjects.length) * rowHeight : '0px',
        visibility: open ? 'visible' : 'hidden',
        maxHeight: maxLines * rowHeight,
        transition: 'height 0.5s, visibility  0.5s',
        backgroundColor: 'var(--color-main-bg)',
      }}
    >
      <List
        sx={{
          width: '100%',
          position: 'relative',
          overflow: 'auto',
          zIndex: 0,
          '& ul': { padding: 0 },
        }}
        subheader={<li />}
        dense
        disablePadding
      >
        {filteredAndSortedProjects.map(project => (
          <li key={`section-${project.ID}`}>
            <ul>
              <ListSubheader
                style={{ lineHeight: '36px', cursor: 'text' }}
                onClick={preventAction}
              >
                <div
                  style={{ display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {project.name}
                  <div>
                    <SwitchStar selected={!!project.isFavorite} onClick={handleToggleProjectFavorite(project.ID, !!project.isFavorite)} />
                  </div>
                </div>

              </ListSubheader>
              {project.tasks?.map(task => (
                <ListItem
                  key={`item-${project.ID}-${task.ID}`}
                  onClick={taskSelect(task)}
                  disablePadding
                  style={{ position: 'relative' }}
                >
                  <ListItemButton>
                    <ListItemText inset primary={task.name} />
                  </ListItemButton>
                  <div style={{ position: 'absolute', right: '16px' }}>
                    <SwitchStar selected={!!task.isFavorite} onClick={handleToggleTaskFavorite(task.ID, project.ID, !!task.isFavorite)} />
                  </div>
                </ListItem>
              ))}
            </ul>
          </li>
        ))}
      </List>
    </CustomizedCard>
  );
};
