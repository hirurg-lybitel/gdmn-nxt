import { GridFilterModel } from '@mui/x-data-grid-pro';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IFilteringData } from '../customers/customers-filter/customers-filter';

export interface IFiltersState {
  filterModels: { [key: string]: GridFilterModel | undefined };
  filterData: { [key: string]: IFilteringData };
  lastFilterData: { [key: string]: IFilteringData }
};

const initialState: IFiltersState = {
  filterModels: {},
  filterData: {},
  lastFilterData: {}
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
    clearFilterData: (state) => {
      return { ...state, filterData: {}, lastFilterData: state.filterData };
    }
  }
});

export const {
  saveFilterData,
  saveFilterModel,
  clearFilterData
} = filtersSlice.actions;

export default filtersSlice.reducer;
