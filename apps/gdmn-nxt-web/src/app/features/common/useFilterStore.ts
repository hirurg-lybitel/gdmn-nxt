import { useEffect, useState } from 'react';
import { useAddFilterMutation, useDeleteFilterMutation, useGetFilterByEntityNameQuery, useUpdateFilterMutation } from '../filters/filtersApi';
import { IFilteringData } from '@gsbelarus/util-api-types';
import { IFiltersState, saveFilterData, setLoadFilter } from '../../store/filtersSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from './useDebunce';
import { RootState } from '../../store';

export function useFilterStore(filterEntityName: string): any {
  const filter = useSelector((state: RootState) => state.filtersStorage);
  const { data: filters, isLoading: filtersIsLoading, isFetching: filtersIsFetching } = useGetFilterByEntityNameQuery(filterEntityName);
  const [addFilter, { isLoading: addIsLoading }] = useAddFilterMutation();
  const [deleteFilter, { isLoading: deleteIsLoading }] = useDeleteFilterMutation();
  const [updateFilter, { isLoading: updateIsLoading }] = useUpdateFilterMutation();
  const [lastFilter, setLastFilter] = useState<IFilteringData | null>(null);
  const [filterId, setFilterId] = useState<number | null>(null);
  const [pendingRequest, setPendingRequest] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!updateIsLoading && !deleteIsLoading && !addIsLoading && !filtersIsLoading && !filtersIsFetching) {
      setPendingRequest(null);
    }
  }, [pendingRequest]);

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
    if (filters === undefined || filter.loadFilters?.[`${filterEntityName}`] === true) return;
    setFilterId(filters?.ID || null);
    dispatch(saveFilterData({ [`${filterEntityName}`]: filters?.FILTERS || {} }));
    dispatch(setLoadFilter({ [`${filterEntityName}`]: true }));
  }, [filtersIsLoading]);

  const debouncedFilterData = useDebounce(filter.filterData?.[`${filterEntityName}`], (1000 * 10));

  const save = (filterData: IFilteringData | undefined) => {
    if (!filterData === undefined && !filterId) return;
    setLastFilter(filterData || {});
    if (!lastFilter) return;
    if (Object.keys(filterData || {}).length < 1) {
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
        FILTERS: filterData || {}
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
      FILTERS: filterData || {}
    });
  };

  useEffect(() => {
    save(debouncedFilterData);
  }, [debouncedFilterData]);

  const handleSave = () => save(filter.filterData?.[`${filterEntityName}`] || {});

  return [filtersIsLoading, filtersIsFetching, handleSave];
}
