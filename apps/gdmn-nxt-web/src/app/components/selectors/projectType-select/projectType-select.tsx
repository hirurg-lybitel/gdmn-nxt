import { IProjectType, Permissions } from '@gsbelarus/util-api-types';
import { Autocomplete, Button, Checkbox, createFilterOptions, FilterOptionsState, InputAdornment, ListItem, TextField, TextFieldVariants } from '@mui/material';
import { HTMLAttributes, MouseEventHandler, useCallback, useMemo, useState } from 'react';
import { useAutocompleteVirtualization } from '@gdmn-nxt/helpers/hooks/useAutocompleteVirtualization';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { maxVirtualizationList } from '@gdmn/constants/client';
import { useAddProjectTypeMutation, useDeleteProjectTypeMutation, useGetProjectTypesQuery, useUpdateProjectTypeMutation } from '../../../features/time-tracking';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import CustomPaperComponent from '@gdmn-nxt/helpers/custom-paper-component/custom-paper-component';
import ItemButtonEdit from '@gdmn-nxt/components/item-button-edit/item-button-edit';
import ProjectTypeEdit from './projectTypeEdit/projectTypeEdit';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import { RootState } from '@gdmn-nxt/store';
import { useSelector } from 'react-redux';

interface IProjectTypeSelect{
  value: IProjectType[] | IProjectType | null;
  onChange: (value: IProjectType[] | IProjectType | null) => void;
  label?: string;
  placeholder?: string;
  limitTags?: number;
  multiple?: boolean,
  disableCloseOnSelect?: boolean,
  filterOptions?: (options: IProjectType, state: FilterOptionsState<IProjectType>) => boolean,
  filter?: (projectType: IProjectType) => boolean,
  disabled?: boolean,
  required?: boolean,
  style?: React.CSSProperties,
  textFieldVariant?: TextFieldVariants,
  error?: boolean,
  helperText?: React.ReactNode,
  readOnly?: boolean,
  withCreate?: boolean,
  withEdit: boolean,
  disableClearable?: boolean
}
export function ProjectTypeSelect({
  value,
  onChange,
  label = 'Тип проекта',
  placeholder,
  limitTags = -1,
  multiple = false,
  disableCloseOnSelect = false,
  filter,
  disabled,
  required,
  style,
  textFieldVariant,
  error,
  helperText,
  readOnly,
  withCreate = false,
  withEdit = false,
  disableClearable = false
}: Readonly<IProjectTypeSelect>) {
  const { data: projectTypes = [], isFetching: projectTypesIsFetching } = useGetProjectTypesQuery();
  const handleOnChange = useCallback((e: React.SyntheticEvent<Element, Event>, value: IProjectType[] | IProjectType | null) => onChange(value), [onChange]);

  const [addProjectType] = useAddProjectTypeMutation();
  const [updateProjectType] = useUpdateProjectTypeMutation();
  const [deleteProjectType] = useDeleteProjectTypeMutation();

  const [ListboxComponent] = useAutocompleteVirtualization();

  const getProjectType = useCallback(() => {
    if (multiple) {
      return projectTypes?.filter(projectType => (value as IProjectType[])?.find((el) => el.ID === projectType.ID)) ?? [];
    }
    if (!value || !projectTypes) return null;
    return projectTypes[projectTypes.findIndex(projectType => (value as IProjectType).ID === projectType.ID)];
  }, [multiple, projectTypes, value]);

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: maxVirtualizationList,
    ignoreCase: true,
    stringify: (option: IProjectType) => `${option.name}`,
  });

  const [projectType, setProjectType] = useState<IProjectType>();
  const [editOpen, setEditOpen] = useState(false);

  const handleAdd = () => {
    setProjectType(undefined);
    setEditOpen(true);
  };

  const handleChange = (projectType: IProjectType) => {
    setProjectType(projectType);
    setEditOpen(true);
  };

  const handleClose = () => {
    setEditOpen(false);
  };

  const onSubmit = (projectType: IProjectType, isDelete: boolean) => {
    handleClose();
    if (isDelete) {
      deleteProjectType(projectType.ID);
      return;
    }
    if (projectType.ID < 0) {
      addProjectType(projectType);
      return;
    }
    updateProjectType(projectType);
  };

  const memoEditForm = useMemo(() => (
    <ProjectTypeEdit
      open={editOpen}
      projectType={projectType}
      onSubmit={onSubmit}
      onCancelClick={handleClose}
    />
  ), [editOpen, projectType]);

  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  const createAllow = withCreate && userPermissions?.['time-tracking/projectTypes']?.POST;

  const memoPaperFooter = useMemo(() =>
    <div>
      <Button
        startIcon={<AddCircleRoundedIcon />}
        onClick={handleAdd}
      >
        Создать тип проекта
      </Button>
    </div>,
  []);

  return (
    <>
      {memoEditForm}
      <Autocomplete
        filterOptions={filterOptions}
        style={style}
        disableClearable={disableClearable}
        readOnly={readOnly}
        disabled={disabled}
        options={(filter ? projectTypes.filter(projectType => filter(projectType)) : projectTypes) ?? []}
        disableCloseOnSelect={disableCloseOnSelect}
        value={getProjectType()}
        ListboxComponent={ListboxComponent}
        PaperComponent={createAllow ? CustomPaperComponent({ footer: memoPaperFooter }) : undefined}
        onChange={handleOnChange}
        multiple={multiple}
        limitTags={limitTags}
        getOptionLabel={option => option.name}
        renderOption={(props, option, { selected }) => (
          <ListItem
            {...props}
            key={option.ID}
            sx={{
              height: createAllow ? '42px' : 'auto',
              '&:hover .action': {
                display: 'block !important',
              }
            }}
          >
            <ProjectTypeItem
              selected={selected}
              option={option}
              multiple={multiple}
              withEdit={withEdit}
              onChange={handleChange}
            />
          </ListItem>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            error={error}
            helperText={helperText}
            variant={textFieldVariant}
            required={required}
            label={label}
            placeholder={placeholder ?? (multiple ? 'Выберите типы проектов' : 'Выберите тип проекта')}
          />
        )}
        loading={projectTypesIsFetching}
        loadingText="Загрузка данных..."
      />
    </>
  );
}

interface IProjectTypeItemProps {
  multiple: boolean,
  option: IProjectType,
  selected: boolean,
  withEdit: boolean,
  onChange?: (value: IProjectType) => void
}

const ProjectTypeItem = ({ multiple, option, selected, withEdit, onChange }: IProjectTypeItemProps) => {
  const handleEdit = (projectType: IProjectType) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    onChange && onChange(projectType);
  };
  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div>
        {multiple && (
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
        )}
        {option.name}
      </div>
      {withEdit && <div
        className="action"
        style={{
          display: 'none',
        }}
      >
        <PermissionsGate actionAllowed={userPermissions?.['time-tracking/projectTypes']?.PUT}>
          <ItemButtonEdit
            color="primary"
            onClick={handleEdit(option)}
          />
        </PermissionsGate>
      </div>}
    </div>
  );
};
