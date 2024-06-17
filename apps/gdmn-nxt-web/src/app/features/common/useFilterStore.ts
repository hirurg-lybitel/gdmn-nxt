import { useCallback, useEffect, useState } from 'react';
import { useAddFilterMutation, useDeleteFilterMutation, useGetAllFiltersQuery, useUpdateFilterMutation } from '../filters/filtersApi';
import { IFilteringData } from '@gsbelarus/util-api-types';
import { saveFilterData, setDebounce, setLoadFilter } from '../../store/filtersSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';

export function useFilterStore(filterEntityName: string): any {
  const filter = useSelector((state: RootState) => state.filtersStorage);
  const debounceTime = 1000 * 10;
  const { data: filtersData, isLoading: filtersIsLoading, isFetching: filtersIsFetching } = useGetAllFiltersQuery();
  const filters = filtersData?.find(filterData => filterData.entityName === filterEntityName);
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
          entityName: filterEntityName,
          filters: currentFilterData
        });
      }
    }
  }, [filters]);

  useEffect(() => {
    if (filters === undefined || filter.loadFilters?.[`${filterEntityName}`] === true) {
      setLastFilter(filter.filterData?.[`${filterEntityName}`] || {});
      return;
    }
    setFilterId(filters?.ID || null);
    setLastFilter(filters?.filters || {});
    dispatch(saveFilterData({ [`${filterEntityName}`]: filters?.filters || {} }));
    dispatch(setLoadFilter({ [`${filterEntityName}`]: true }));
  }, [filtersIsLoading]);

  const currentFilterData = filter.filterData?.[`${filterEntityName}`];

  const save = useCallback((filterData: IFilteringData | undefined) => {
    if (filterData === undefined && !filterId) return;
    if (JSON.stringify(filterData) === JSON.stringify(filters?.filters)) return;
    if (lastFilter === null) return;
    if (Object.keys(filterData || {}).length < 1) {
      setLastFilter(filterData || {});
      if (!filterId) {
        setPendingRequest('delete');
        return;
      }
      deleteFilter(filterId);
      setFilterId(null);
      return;
    }
    if (Object.keys(lastFilter).length > 0) {
      setLastFilter(filterData || {});
      if (!filterId) {
        setPendingRequest('update');
        return;
      }
      updateFilter({
        ID: filterId,
        entityName: filterEntityName,
        filters: filterData || {}
      });
      return;
    }
    setLastFilter(filterData || {});
    if (pendingRequest) {
      setPendingRequest('update');
      return;
    }
    addFilter({
      ID: -1,
      entityName: filterEntityName,
      filters: filterData || {}
    });
  }, [addFilter, deleteFilter, filterEntityName, filterId, lastFilter, pendingRequest, updateFilter, filters?.filters]);

  useEffect(() => {
    dispatch(setDebounce({ name: filterEntityName, callBack: () => save(currentFilterData), time: debounceTime }));
  }, [currentFilterData]);

  return [filtersIsLoading, filtersIsFetching];
}
