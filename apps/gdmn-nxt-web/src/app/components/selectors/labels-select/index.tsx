import CustomPaperComponent from '@gdmn-nxt/helpers/custom-paper-component/custom-paper-component';
import { Autocomplete, AutocompleteChangeReason, AutocompleteProps, Box, Button, Checkbox, createFilterOptions, ListItem, Stack, TextField, TextFieldProps, Typography, useMediaQuery } from '@mui/material';
import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { useAddLabelMutation, useGetLabelsQuery, useUpdateLabelMutation } from '../../../features/labels';
import { IconByName } from '@gdmn-nxt/components/icon-by-name';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';
import { ILabel, UserType } from '@gsbelarus/util-api-types';
import LabelMarker from '../../Labels/label-marker/label-marker';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import LabelListItemEdit from '../../Labels/label-list-item-edit/label-list-item-edit';
import { maxVirtualizationList } from '@gdmn/constants/client';
import { useAddTicketsLabelMutation, useGetTicketsLabelsQuery, useUpdateTicketsLabelMutation } from '../../../features/tickets/ticketsLabelsApi';

interface LabelsSelectProps extends Omit<
  AutocompleteProps<any, boolean | undefined, boolean | undefined, false>,
  'value' | 'options' | 'renderInput' | 'renderOption' | 'onChange'
> {
  labels?: ILabel[];
  onChange: (value: ILabel[], reason: AutocompleteChangeReason) => void;
  textFieldProps?: TextFieldProps;
  editIconSpace?: boolean;
  disableCreation?: boolean;
  disableEdition?: boolean;
  type?: UserType;
};

export function LabelsSelect({ labels = [], onChange, textFieldProps, editIconSpace = false, disableCreation, disableEdition, type, ...rest }: Readonly<LabelsSelectProps>) {
  const [addSystemLabel, { isLoading: systemLabelAddIsLoading, data: systemAddedLabel }] = useAddLabelMutation();
  const [updateSystemLabel, { isLoading: systemLabelEditIsLoading }] = useUpdateLabelMutation();

  const [addTicketsLabel, { isLoading: ticketsLabelAddIsLoading, data: ticketsAddedLabel }] = useAddTicketsLabelMutation();
  const [updateTicketsLabel, { isLoading: ticketsLabelEditIsLoading }] = useUpdateTicketsLabelMutation();

  const addLabel = type === UserType.Tickets ? addTicketsLabel : addSystemLabel;
  const updateLabel = type === UserType.Tickets ? updateTicketsLabel : updateSystemLabel;
  const addIsLoading = type === UserType.Tickets ? ticketsLabelAddIsLoading : systemLabelAddIsLoading;
  const addedLabel = type === UserType.Tickets ? ticketsAddedLabel : systemAddedLabel;
  const editIsLoading = type === UserType.Tickets ? ticketsLabelEditIsLoading : systemLabelEditIsLoading;

  const { data: systemLabelsData = [], isFetching: systemLabelsFetching, isLoading: systemLabelsLoading } = useGetLabelsQuery(undefined, { skip: type === UserType.Tickets });
  const { data: ticketsLabelsData = [], isFetching: ticketsLabelsFetching, isLoading: ticketsLabelsLoading } = useGetTicketsLabelsQuery(undefined, { skip: type !== UserType.Tickets });

  const labelsData = type === UserType.Tickets ? ticketsLabelsData : systemLabelsData;
  const labelsFetching = type === UserType.Tickets ? ticketsLabelsFetching : systemLabelsFetching;
  const labelsLoading = type === UserType.Tickets ? ticketsLabelsLoading : systemLabelsLoading;

  const [upsertLabel, setUpsertLabel] = useState<{
    open: boolean;
    label?: ILabel;
  }>({
    open: false
  });

  const isFetching = useMemo(() => (
    editIsLoading || addIsLoading || labelsFetching || labelsLoading
  ), [addIsLoading, editIsLoading, labelsFetching, labelsLoading]);

  useEffect(() => {
    if (!addedLabel) return;

    const newLabels = [...labels, addedLabel];
    onChange(newLabels, 'createOption');
  }, [addedLabel]);

  const handleOpenLabelAdd = () => {
    setUpsertLabel(prev => ({
      ...prev,
      label: undefined,
      open: true
    }));
  };

  const handleOpenLabelEdit = (newLabel: ILabel) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setUpsertLabel(prev => ({
      ...prev,
      label: newLabel,
      open: true
    }));
  };

  const handleCloseLabel = () => setUpsertLabel(prev => ({ ...prev, open: false }));

  const handleOnSubmit = useCallback((newLabel: ILabel) => {
    if (newLabel.ID > 0) {
      handleCloseLabel();
      updateLabel(newLabel);
      return;
    }
    handleCloseLabel();
    addLabel(newLabel);
  }, [addLabel, updateLabel]);

  const memoPaperFooter = useMemo(() => (
    <div>
      {<Button
        disabled={isFetching}
        startIcon={<AddCircleRoundedIcon />}
        onClick={handleOpenLabelAdd}
      >
        Создать метку
      </Button>}
    </div>
  ), [isFetching]);

  const labelEditComponent = useMemo(() => (
    <LabelListItemEdit
      open={upsertLabel.open}
      label={upsertLabel.label}
      onSubmit={handleOnSubmit}
      onCancelClick={handleCloseLabel}
    />
  ), [handleOnSubmit, upsertLabel.label, upsertLabel.open]);

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: maxVirtualizationList,
    ignoreCase: true,
    stringify: (option: ILabel) => `${option.USR$NAME}`,
  });

  const mobile = useMediaQuery('(pointer: coarse)');

  const paper = useMemo(() => {
    return disableCreation ? undefined : CustomPaperComponent({ footer: memoPaperFooter });
  }, [disableCreation, memoPaperFooter]);

  return (
    <>
      {labelEditComponent}
      <Autocomplete
        {...rest}
        filterOptions={filterOptions}
        multiple
        limitTags={'limitTags' in rest ? rest.limitTags : 2}
        disableCloseOnSelect
        PaperComponent={paper}
        onChange={(e, value, reason) => {
          onChange(value, reason);
        }}
        value={
          labelsData.filter(label => labels?.find(el => el.ID === label.ID))
        }
        options={labelsData}
        loading={labelsFetching}
        loadingText="Загрузка данных..."
        getOptionLabel={opt => opt.USR$NAME}
        renderOption={(props, option, { selected }) => (
          <ListItem
            {...props}
            key={option.ID}
            disablePadding
            sx={{
              display: 'flex',
              gap: '8px',
              py: '2px !important',
              '&:hover .action': {
                display: 'inline-flex !important',
                opacity: '1 !important',
                visibility: 'visible !important',
              }
            }}
          >
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              <Stack direction="column" style={{ minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  style={{ minWidth: 0 }}
                >
                  <Box style={{ display: 'flex', width: '30px', alignItems: 'center', justifyContent: 'center' }}>
                    {option.USR$ICON
                      ? <IconByName name={option.USR$ICON} style={{ color: option.USR$COLOR }} />
                      : <Box
                        component="span"
                        style={{
                          backgroundColor: option.USR$COLOR,
                          width: 14,
                          height: 14,
                          borderRadius: 'var(--border-radius)',
                        }}
                      />
                    }
                  </Box>
                  <Box style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {option.USR$NAME}
                  </Box>
                </Stack>
                <Typography variant="caption">{option.USR$DESCRIPTION}</Typography>
              </Stack>
            </div>
            {!disableEdition && <div
              className="action"
              style={{
                display: (mobile || editIconSpace) ? undefined : 'none',
                opacity: editIconSpace ? 0 : 1,
                visibility: editIconSpace ? 'hidden' : 'visible'
              }}
            >
              <ItemButtonEdit
                button
                disabled={isFetching}
                onClick={handleOpenLabelEdit(option)}
              />
            </div>}
          </ListItem>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Метки"
            placeholder={rest.readOnly ? '' : 'Выберите метки'}
            {...textFieldProps}
            sx={{
              ...textFieldProps?.sx,
              '& .MuiInputBase-input': {
                ...(textFieldProps?.sx as any)?.['& .MuiInputBase-input'],
                minWidth: '100% !important',
                height: rest.readOnly ? '5px' : (textFieldProps?.sx as any)?.['& .MuiInputBase-input'].height
              }
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: rest.readOnly ? undefined : params.InputProps.endAdornment
            }}
          />
        )}
        renderTags={(value: readonly ILabel[], getTagProps) =>
          value.map((option: ILabel, index: number) =>
            <Box
              key={index}
              pr={0.5}
            >
              <LabelMarker label={option} {...getTagProps({ index })} />
            </Box>
          )
        }
      />
    </>
  );
}
