import CustomPaperComponent from '@gdmn-nxt/helpers/custom-paper-component/custom-paper-component';
import { Autocomplete, AutocompleteProps, Box, Button, Checkbox, createFilterOptions, InputAdornment, ListItem, Stack, TextField, TextFieldProps, Typography, useMediaQuery } from '@mui/material';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { useAddLabelMutation, useGetLabelsQuery, useUpdateLabelMutation } from '../../../features/labels';
import { IconByName } from '@gdmn-nxt/components/icon-by-name';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';
import { ILabel } from '@gsbelarus/util-api-types';
import LabelMarker from '../../Labels/label-marker/label-marker';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import LabelListItemEdit from '../../Labels/label-list-item-edit/label-list-item-edit';
import TagIcon from '@mui/icons-material/Tag';
import { useAutocompleteVirtualization } from '@gdmn-nxt/helpers/hooks/useAutocompleteVirtualization';
import { maxVirtualizationList } from '@gdmn/constants/client';

interface LabelsSelectProps extends Pick<TextFieldProps, 'InputProps'> {
  labels?: ILabel[];
  onChange: (value: ILabel[]) => void;
};

export function LabelsSelect({ labels = [], onChange, InputProps }: Readonly<LabelsSelectProps>) {
  const [addLabel, { isLoading: addIsLoading, data: addedLabel }] = useAddLabelMutation();
  const [updateLabel, { isLoading: editIsLoading }] = useUpdateLabelMutation();
  const { data: labelsData = [], isFetching: labelsFetching, isLoading: labelsLoading } = useGetLabelsQuery();

  const [upsertLabel, setUpsertLabel] = useState<{
    open: boolean;
    label?: ILabel;
  }>({
    open: false
  });

  const isFetching = useMemo(() =>
    editIsLoading || addIsLoading || labelsFetching || labelsLoading,
  [addIsLoading, editIsLoading, labelsFetching, labelsLoading]);

  useEffect(() => {
    if (!addedLabel) return;

    const newLabels = [...labels, addedLabel];
    onChange(newLabels);
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

  const handleOnSubmit = (newLabel: ILabel) => {
    if (newLabel.ID > 0) {
      handleCloseLabel();
      updateLabel(newLabel);
      return;
    }
    handleCloseLabel();
    addLabel(newLabel);
  };

  const memoPaperFooter = useMemo(() =>
    <div>
      <Button
        disabled={isFetching}
        startIcon={<AddCircleRoundedIcon />}
        onClick={handleOpenLabelAdd}
      >
        Создать метку
      </Button>
    </div>,
  [isFetching]);

  const labelEditComponent = useMemo(() =>
    <LabelListItemEdit
      open={upsertLabel.open}
      label={upsertLabel.label}
      onSubmit={handleOnSubmit}
      onCancelClick={handleCloseLabel}
    />
  , [upsertLabel]);

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: maxVirtualizationList,
    ignoreCase: true,
    stringify: (option: ILabel) => `${option.USR$NAME}`,
  });

  const mobile = useMediaQuery('(pointer: coarse)');

  return (
    <>
      {labelEditComponent}
      <Autocomplete
        filterOptions={filterOptions}
        multiple
        limitTags={2}
        disableCloseOnSelect
        PaperComponent={CustomPaperComponent({ footer: memoPaperFooter })}
        onChange={(e, value) => {
          onChange(value);
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
              py: '2px !important',
              '&:hover .action': {
                display: 'inline-flex !important',
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
            <div
              className="action"
              style={{
                display: mobile ? 'inline-flex' : 'none'
              }}
            >
              <ItemButtonEdit
                button
                disabled={isFetching}
                onClick={handleOpenLabelEdit(option)}
              />
            </div>
          </ListItem>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Метки"
            placeholder="Выберите метки"
            InputProps={{
              ...params.InputProps,
              // ...InputProps
              // startAdornment: (
              //   <InputAdornment position="end">
              //     <TagIcon />
              //   </InputAdornment>
              // ),
            }}
          />
        )}
        renderTags={(value: readonly ILabel[], getTagProps) =>
          value.map((option: ILabel, index: number) =>
            <Box
              key={index}
              pr={0.5}
            >
              <LabelMarker label={option} {...getTagProps({ index })}/>
            </Box>
          )
        }
      />
    </>
  );
}
