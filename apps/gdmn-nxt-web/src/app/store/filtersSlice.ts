import { GridFilterModel } from '@mui/x-data-grid-pro';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IFilteringData } from '../customers/customers-filter/customers-filter';

export interface IFiltersState {
  filterModels: { [key: string]: GridFilterModel | undefined };
  filterData: { [key: string]: IFilteringData };
  filterDebounce: { [key: string]: NodeJS.Timeout };
  lastFilter: { [key: string]: IFilteringData };
  filterId: { [key: string]: number | null }
};

export interface IDateFilter {
  ID: number,
  name: string
}

const initialState: IFiltersState = {
  filterModels: {},
  filterData: {},
  filterDebounce: {},
  lastFilter: {},
  filterId: {}
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    saveFilterData: (state, action: PayloadAction<{ [key: string]: IFilteringData }>) => {
      return { ...state, filterData: { ...state.filterData, ...action.payload } };
    },
    saveFilterModel: (state, action: PayloadAction<{ [key: string]: GridFilterModel | undefined }>) => {
      return { ...state, filterModels: { ...state.filterModels, ...action.payload } };
    },
    clearFilterData: (state, action: PayloadAction<{filterEntityName: string, saveFields?: string[]}>) => {
      const { filterEntityName, saveFields } = action.payload;
      const fields: any = {};

      if (saveFields) {
        for (let i = 0;i < saveFields?.length;i++) {
          const fieldName = saveFields[i];
          fields[fieldName] = state.filterData[filterEntityName]?.[fieldName];
        }
      }

      const { [filterEntityName]: deletedData, ...clearedFilterData } = state.filterData;
      const newFilterData = { ...clearedFilterData, ...{ [filterEntityName]: fields } };

      return { ...state, filterData: newFilterData };
    },
    setDebounce: (state, action: PayloadAction<{ name: string, callBack: () => void, time: number }>) => {
      clearTimeout(state.filterDebounce[`${action.payload.name}`]);
      const timeout = setTimeout(action.payload.callBack, action.payload.time);
      return { ...state, filterDebounce: { ...state.filterDebounce, [`${action.payload.name}`]: timeout } };
    },
    setLastFilter: (state, action: PayloadAction<{ [key: string]: IFilteringData }>) => {
      return { ...state, lastFilter: { ...state.lastFilter, ...action.payload } };
    },
    setFilterId: (state, action: PayloadAction<{ [key: string]: number | null }>) => {
      return { ...state, filterId: { ...state.filterId, ...action.payload } };
    },
  }
});

export const {
  saveFilterData,
  saveFilterModel,
  clearFilterData,
  setDebounce,
  setLastFilter,
  setFilterId
} = filtersSlice.actions;

export default filtersSlice.reducer;
