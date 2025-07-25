import { IFilteringData } from '@gsbelarus/util-api-types';
import { Autocomplete, List, Popper, TextField } from '@mui/material';
import { CSSProperties, forwardRef, HTMLAttributes } from 'react';

interface ISortSelectProps<T> {
  isLoading: boolean;
  options?: T[];
  filteringData?: IFilteringData;
  handleOnFilterChange: (entity: string, value: any) => void;
  field: string;
  label: string;
  width?: string;
  getOptionLabel?: (option: T) => string;
  getReturnedValue?: (option: T | null) => any;
  styleTextField?: CSSProperties;
  sx?: any;
  fullWidth?: boolean;
}

export default function SortSelect<T>(props: Readonly<ISortSelectProps<T>>) {
  const {
    isLoading, options = [], filteringData, handleOnFilterChange,
    field, label, width, getOptionLabel, getReturnedValue,
    styleTextField, sx, fullWidth
  } = props;

  const CustomPopper = (props: any) => {
    return <Popper {...props} style={{ width: 'fit-content' }} />;
  };

  return (
    <Autocomplete
      fullWidth={fullWidth}
      sx={sx}
      slotProps={{
        paper: {
          style: {
            width: 'max-content',
            maxWidth: 'calc(100vw - 40px)'
          }
        }
      }}
      PopperComponent={CustomPopper}
      size="small"
      loading={isLoading}
      loadingText="Загрузка данных..."
      options={options ?? []}
      value={options.find((value: any) => value.ID === filteringData?.[`${field}`]) ?? null}
      getOptionLabel={getOptionLabel}
      onChange={(e, value) => {
        handleOnFilterChange(field, getReturnedValue ? getReturnedValue(value) : value);
      }}
      renderInput={(params) => (
        <div style={{ display: 'flex', width, ...styleTextField }}>
          <TextField
            {...params}
            label={label}
          />
        </div>
      )}
    />
  );
}
