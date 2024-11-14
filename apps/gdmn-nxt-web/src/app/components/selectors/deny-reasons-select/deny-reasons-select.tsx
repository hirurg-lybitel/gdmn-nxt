import { IDenyReason, IKanbanCard } from '@gsbelarus/util-api-types';
import { Autocomplete, Button, createFilterOptions, TextField } from '@mui/material';
import { useAddDenyReasonMutation, useGetDenyReasonsQuery } from 'apps/gdmn-nxt-web/src/app/features/kanban/kanbanCatalogsApi';
import { FormikProps, getIn } from 'formik';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import DenyReasonsUpsert from '../../Kanban/deny-reasons-upsert/deny-reasons-upsert';
import CustomPaperComponent from '../../helpers/custom-paper-component/custom-paper-component';
import filterOptions from '../../helpers/filter-options';
import { useAutocompleteVirtualization } from '@gdmn-nxt/components/helpers/hooks/useAutocompleteVirtualization';
import { maxVirtualizationList } from '@gdmn/constants/client';

interface DenyReasonsSelectProps {
  formik: FormikProps<IKanbanCard>;
};

export function DenyReasonsSelect(props: DenyReasonsSelectProps) {
  const { formik } = props;

  const { data: denyReasons = [], isFetching: denyReasonsIsFetching } = useGetDenyReasonsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [insertDenyReason, { isSuccess: insertDenyReasonIsSuccess, isLoading: insertDenyReasonIsLoading, data: newDenyReason }] = useAddDenyReasonMutation();

  const [addDenyReason, setAddDenyReason] = useState(false);

  useEffect(() => {
    insertDenyReasonIsSuccess && (formik.values.DEAL?.DENYREASON?.ID !== newDenyReason?.ID) && formik.setFieldValue('DEAL.DENYREASON', newDenyReason);
  }, [formik.values.DEAL?.DENYREASON?.ID, insertDenyReasonIsSuccess, newDenyReason]);

  const handleAddDenyReason = useCallback(() => setAddDenyReason(true), []);

  const handleSubmitDenyReason = useCallback((denyReason: IDenyReason) => {
    insertDenyReason(denyReason);
    setAddDenyReason(false);
  }, []);

  const handleCancelDenyReason = useCallback(() => setAddDenyReason(false), []);

  const memoPaperFooter = useMemo(() =>
    <div>
      <Button
        startIcon={<AddCircleRoundedIcon />}
        onClick={handleAddDenyReason}
      >Создать причину</Button>
    </div>,
  []);

  const memoDenyReasonUpsert = useMemo(() =>
    <DenyReasonsUpsert
      open={addDenyReason}
      onCancel={handleCancelDenyReason}
      onSubmit={handleSubmitDenyReason}
    />, [addDenyReason]);

  const [ListboxComponent] = useAutocompleteVirtualization();

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: maxVirtualizationList,
    ignoreCase: true,
    stringify: (option: IDenyReason) => `${option.NAME}`,
  });

  return (
    <>
      <Autocomplete
        filterOptions={filterOptions}
        fullWidth
        PaperComponent={CustomPaperComponent({ footer: memoPaperFooter })}
        getOptionLabel={option => option.NAME}
        ListboxComponent={ListboxComponent}
        loading={denyReasonsIsFetching || insertDenyReasonIsLoading}
        {...(insertDenyReasonIsLoading
          ? {
            options: [],
            value: null
          }
          : {
            options: denyReasons,
            value: denyReasons?.find(el => el.ID === formik.values.DEAL?.DENYREASON?.ID) || null
          })
        }
        loadingText="Загрузка данных..."
        onChange={(event, value) => formik.setFieldValue('DEAL.DENYREASON', value)}
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
            label="Причина отказа"
            placeholder={`${insertDenyReasonIsLoading ? 'Создание...' : 'Выберите причину отказа'}`}
            name="DEAL.DENYREASON"
            required
            error={getIn(formik.touched, 'DEAL.DENYREASON') && Boolean(getIn(formik.errors, 'DEAL.DENYREASON'))}
            helperText={getIn(formik.touched, 'DEAL.DENYREASON') && getIn(formik.errors, 'DEAL.DENYREASON')}
          />
        )}
      />
      {memoDenyReasonUpsert}
    </>
  );
};
