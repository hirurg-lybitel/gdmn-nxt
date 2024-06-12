import { GridFilterModel } from '@mui/x-data-grid-pro';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IFilteringData } from '../customers/customers-filter/customers-filter';

export interface IFiltersState {
  filterModels: { [key: string]: GridFilterModel | undefined };
  filterData: { [key: string]: IFilteringData };
  loadFilters: { [key: string]: boolean };
};

export interface IDateFilter {
  ID: number,
  name: string
}

const initialState: IFiltersState = {
  filterModels: {},
  filterData: {},
  loadFilters: {}
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
    clearFilterData: (state, action: PayloadAction<string>) => {
      /** Никогда не удаляем deals.deadline  */
      const deadline = [...(state.filterData[action.payload]?.deadline || [])];
      const { [action.payload]: deletedData, ...clearedFilterData } = state.filterData;
      const newFilterData = { ...clearedFilterData, ...(deadline.length > 0 ? { [action.payload]: { deadline } } : {}) };

      return { ...state, filterData: newFilterData };
    },
    setLoadFilter: (state, action: PayloadAction<{ [key: string]: boolean }>) => {
      return { ...state, loadFilters: { ...state.loadFilters, ...action.payload } };
    },
  }
});

export const {
  saveFilterData,
  saveFilterModel,
  clearFilterData,
  setLoadFilter
} = filtersSlice.actions;

export default filtersSlice.reducer;
