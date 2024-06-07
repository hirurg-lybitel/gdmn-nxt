import { useEffect, useState } from 'react';
import { useAddFilterMutation, useDeleteFilterMutation, useGetFilterByEntityNameQuery, useUpdateFilterMutation } from '../filters/filtersApi';
import { IFilteringData } from '@gsbelarus/util-api-types';
import { saveFilterData } from '../../store/filtersSlice';
import { useDispatch } from 'react-redux';
import { useDebounce } from './useDebunce';

export function useFilterStore(filterEntityName: string, filterData: IFilteringData): any {
  const { data: filters, isLoading: filtersIsLoading, isFetching: filtersIsFetching } = useGetFilterByEntityNameQuery(filterEntityName);
  const [addFilter] = useAddFilterMutation();
  const [deleteFilter] = useDeleteFilterMutation();
  const [updateFilter] = useUpdateFilterMutation();
  const [lastFilter, setLastFilter] = useState<IFilteringData | null>(null);
  const [filterId, setFilterId] = useState<number | null>(null);
  const [pendingRequest, setPendingRequest] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setFilterId(filters?.ID || null);
    if (pendingRequest) {
      setPendingRequest(null);
      if (!filters?.ID) return;
      if (pendingRequest === 'delete') {
        deleteFilter(filters?.ID);
        return;
      }
      if (pendingRequest === 'update') {
        updateFilter({
          ID: filters?.ID,
          ENTITYNAME: filterEntityName,
          FILTERS: debouncedFilterData
        });
      }
    }
  }, [filters]);

  useEffect(() => {
    if (filters === undefined) return;
    setFilterId(filters?.ID || null);
    dispatch(saveFilterData({ [`${filterEntityName}`]: filters?.FILTERS || {} }));
  }, [filtersIsLoading]);

  const debouncedFilterData = useDebounce(filterData, 1000);

  useEffect(() => {
    if (!debouncedFilterData && !filterId) return;
    setLastFilter(debouncedFilterData || {});
    if (!lastFilter) return;
    if (Object.keys(debouncedFilterData || {}).length < 1) {
      if (!filterId) {
        setPendingRequest('delete');
        return;
      }
      deleteFilter(filterId);
      setFilterId(null);
      return;
    }
    if (Object.keys(lastFilter).length > 0) {
      if (!filterId) {
        setPendingRequest('update');
        return;
      }
      updateFilter({
        ID: filterId,
        ENTITYNAME: filterEntityName,
        FILTERS: debouncedFilterData
      });
      return;
    }
    if (pendingRequest) {
      setPendingRequest('update');
      return;
    }
    addFilter({
      ID: -1,
      ENTITYNAME: filterEntityName,
      FILTERS: debouncedFilterData
    });
  }, [debouncedFilterData]);
  return [filtersIsLoading, filtersIsFetching];
}
