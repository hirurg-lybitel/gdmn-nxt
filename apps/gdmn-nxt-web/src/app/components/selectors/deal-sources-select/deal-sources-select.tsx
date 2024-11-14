import { IDealSource, IKanbanCard } from '@gsbelarus/util-api-types';
import { Autocomplete, Button, createFilterOptions, TextField } from '@mui/material';
import { FormikProps, getIn } from 'formik';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CustomPaperComponent from '../../helpers/custom-paper-component/custom-paper-component';
import filterOptions from '../../helpers/filter-options';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { useAddDealSourceMutation, useGetDealSourcesQuery } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanCatalogsApi';
import DealSourceUpsert from '../../Kanban/deal-source-upsert/deal-source-upsert';
import { useAutocompleteVirtualization } from '@gdmn-nxt/components/helpers/hooks/useAutocompleteVirtualization';
import { maxVirtualizationList } from '@gdmn/constants/client';

interface DealSourcesSelectProps {
  formik: FormikProps<IKanbanCard>;
};

export function DealSourcesSelect(props: DealSourcesSelectProps) {
  const {
    formik
  } = props;

  const { data: dealSources = [], isFetching: dealSourcesIsFetching } = useGetDealSourcesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [insertDealSource, { isSuccess: insertDealSourceIsSuccess, isLoading: insertDealSourceIsLoading, data: newDealSource }] = useAddDealSourceMutation();

  const [addDealSource, setAddDealSource] = useState(false);

  useEffect(() => {
    insertDealSourceIsSuccess && (formik.values.DEAL?.SOURCE?.ID !== newDealSource?.ID) && formik.setFieldValue('DEAL.SOURCE', newDealSource);
  }, [formik.values.DEAL?.SOURCE?.ID, insertDealSourceIsSuccess, newDealSource]);

  const handleAddDealSource = useCallback(() => setAddDealSource(true), []);

  const handleSubmitDealSource = useCallback((dealSource: IDealSource) => {
    insertDealSource(dealSource);
    setAddDealSource(false);
  }, []);

  const handleCancelDealSource = useCallback(() => setAddDealSource(false), []);

  const memoPaperFooter = useMemo(() =>
    <div>
      <Button
        startIcon={<AddCircleRoundedIcon />}
        onClick={handleAddDealSource}
      >Создать источник</Button>
    </div>,
  []);

  const memoDealSourceUpsert = useMemo(() =>
    <DealSourceUpsert
      open={addDealSource}
      onCancel={handleCancelDealSource}
      onSubmit={handleSubmitDealSource}
    />, [addDealSource]);

  const [ListboxComponent] = useAutocompleteVirtualization();

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: maxVirtualizationList,
    ignoreCase: true,
    stringify: (option: IDealSource) => `${option.NAME}`,
  });

  return (
    <>
      <Autocomplete
        filterOptions={filterOptions}
        fullWidth
        ListboxComponent={ListboxComponent}
        PaperComponent={CustomPaperComponent({ footer: memoPaperFooter })}
        getOptionLabel={option => option.NAME}
        loading={dealSourcesIsFetching || insertDealSourceIsLoading}
        {...(insertDealSourceIsLoading
          ? {
            options: [],
            value: null
          }
          : {
            options: dealSources,
            value: dealSources?.find(el => el.ID === formik.values.DEAL?.SOURCE?.ID) || null
          })
        }
        loadingText="Загрузка данных..."
        onChange={(event, value) => formik.setFieldValue('DEAL.SOURCE', value)}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.ID}>
              {option.NAME}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Источник"
            placeholder={`${insertDealSourceIsLoading ? 'Создание...' : 'Выберите источник'}`}
            name="DEAL.SOURCE"
            error={getIn(formik.touched, 'DEAL.SOURCE') && Boolean(getIn(formik.errors, 'DEAL.SOURCE'))}
            helperText={getIn(formik.touched, 'DEAL.SOURCE') && getIn(formik.errors, 'DEAL.SOURCE')}
          />
        )}
      />
      {memoDealSourceUpsert}
    </>
  );
};
