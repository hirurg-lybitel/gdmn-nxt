import { GridFilterModel } from '@mui/x-data-grid-pro';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IFilteringData } from '../customers/customers-filter/customers-filter';

export interface IFiltersState {
  filterModels: { [key: string]: GridFilterModel | undefined };
  filterData: { [key: string]: IFilteringData };
};

const initialState: IFiltersState = {
  filterModels: {},
  filterData: {}
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
    }
  }
});

export const {
  saveFilterData,
  saveFilterModel
} = filtersSlice.actions;

export default filtersSlice.reducer;
