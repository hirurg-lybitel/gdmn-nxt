import { IContactHierarchy, IContactWithLabels } from '@gsbelarus/util-api-types';
import {
  createSlice,
  createEntityAdapter,
  PayloadAction
} from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { addCustomer, deleteCustomer, fetchCustomers, fetchCustomersByRootID, fetchHierarchy, updateCustomer, ValidationErrors } from './actions';

interface Customer extends IContactWithLabels {
  error: string | null | undefined;
  loading: boolean;
};

const initialState: Customer = {
  error: null,
  loading: false,
  ID: 0,
  NAME: '',
  labels: []
};

export const customersAdapter = createEntityAdapter<Customer>({
  selectId: (customer) => customer.ID,
  sortComparer: (a, b) => b.ID - a.ID,
});

const customersSlice = createSlice({
  name: 'customers',
  initialState: customersAdapter.getInitialState(initialState),
  reducers: {
    selectAllCustomers: customersAdapter.setAll,
    selectHierarchy(state) {
      console.log('selectHierarchy');
    }
  },
  extraReducers: {
    [updateCustomer.fulfilled.toString()](state, action) {
      const { ID, ...changes } = action.payload.queries.contact[0];
      state.loading = false;

      customersAdapter.updateOne(state, { id: ID, changes });
    },
    [updateCustomer.rejected.toString()](state, action) {
      state.loading = false;
      if (action.payload) {
        state.error = action.payload.errorMessage;
      } else {
        state.error = action.errorMessage;
      }
    },
    [updateCustomer.pending.toString()](state, action) {
      state.loading = true;
      state.error = null;
    },
    [fetchCustomers.fulfilled.toString()](state, action) {
      state.loading = false;
      state.error = null;
      customersAdapter.setAll(state, action.payload.queries.contacts);
    },
    [fetchCustomers.pending.toString()](state, action) {
      state.loading = true;
    },
    [fetchCustomers.rejected.toString()](state, action) {
      console.log('fetchCustomers_rejected', action);
      state.error = action.payload.errorMessage;
    },
    [addCustomer.fulfilled.toString()](state, action) {
      state.loading = false;
      state.error = null;

      const newCustomer: Customer = { ...initialState, ...action.payload.queries.contact[0] };

      customersAdapter.addOne(state, newCustomer);
    },
    [addCustomer.pending.toString()](state, action) {
      state.loading = true;
      state.error = null;
    },
    [addCustomer.rejected.toString()](state, action: PayloadAction<ValidationErrors>) {
      state.loading = false;
      state.error = action.payload.errorMessage;
    },
    [deleteCustomer.fulfilled.toString()](state, action) {
      state.loading = false;
      state.error = null;

      customersAdapter.removeOne(state, action.payload);
    },
    [deleteCustomer.rejected.toString()](state, action) {
      console.log('deleteCustomer_rejected', action);
      state.loading = false;
      if (action.payload) {
        state.error = action.payload.errorMessage;
      } else {
        state.error = action.errorMessage;
      }
    },
    [deleteCustomer.pending.toString()](state, action) {
      state.loading = true;
      state.error = null;
      console.log('deleteCustomer_pending', action);
    },
    [fetchCustomersByRootID.fulfilled.toString()](state, action) {
      state.loading = false;
      state.error = null;
      customersAdapter.setAll(state, action.payload.queries.contacts);
    },
    [fetchCustomersByRootID.pending.toString()](state, action) {
      state.loading = true;
    },
    [fetchCustomersByRootID.rejected.toString()](state, action) {
      state.error = action.payload.errorMessage;
    },
  }
});


interface IHierarchy extends IContactHierarchy {
  error: string | null | undefined;
  loading: boolean;
};

const initialStateHierarchy: IHierarchy = {
  error: null,
  loading: false,
  ID: 0,
  NAME: '',
  LB: 0,
  RB: 0
};

export const hierarchysAdapter = createEntityAdapter<IHierarchy>({
  selectId: (hierarchy) => hierarchy.ID,
  sortComparer: (a, b) => b.LB - a.LB,
});

export const hierarchySlice = createSlice({
  name: 'customerHierarchy',
  initialState: hierarchysAdapter.getInitialState(initialStateHierarchy),
  reducers: {
    selectAllHierarchy: hierarchysAdapter.setAll,
  },
  extraReducers: {
    [fetchHierarchy.fulfilled.toString()](state, action) {
      state.loading = false;
      state.error = null;

      customersAdapter.setAll(state, action.payload.queries.hierarchy);
    },
    [fetchHierarchy.pending.toString()](state, action) {
      state.loading = true;
      state.error = null;
    },
    [fetchHierarchy.rejected.toString()](state, action) {
      state.loading = false;
      state.error = action.payload.errorMessage;
    }
  }
});


export const { selectAllCustomers, selectHierarchy } = customersSlice.actions;
export const { selectAllHierarchy } = hierarchySlice.actions;


export const customersSelectors = customersAdapter.getSelectors<RootState>(
  (state) => state.customers
);

export const hierarchySelectors = hierarchysAdapter.getSelectors<RootState>(
  (state) => state.customersHierarchy
);

export const customersReducer = customersSlice.reducer;
export const hierarchyReducer = hierarchySlice.reducer;
