import { IContactWithID } from "@gsbelarus/util-api-types";
import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  PayloadAction
} from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { store, RootState } from "../../store";
import { contactApi, IContacts, useUpdateContactMutation } from "../contact/contactApi";
import customerAPI from "./customerApi";

export interface IBaseContact {
  ID: number;
  NAME: string;
  PHONE?: string;
  EMAIL?: string;
  FOLDERNAME?: string;
};

interface ValidationErrors {
  errorMessage: string
  field_errors?: Record<string, string>
}

// interface IError {
//   errorMessage: string
// }

export const fetchCustomers = createAsyncThunk<
IContactWithID[] | ValidationErrors,
  void,
  {rejectValue:ValidationErrors}
>(
  "customers/fetchCustomers",
  async (_, { rejectWithValue}) => {
    try {
      const response = await customerAPI.customers.list();
      console.log('fetchCustomers', response);

      return response;

    } catch (error: any) {
      const err: AxiosError<ValidationErrors> = error;
      // if (!err.response){
      //   throw error;
      // }

      return rejectWithValue(error);
    }
  }
);


export const updateCustomer = createAsyncThunk<
  any,
  IContactWithID,
  {
    rejectValue: ValidationErrors
    //fulfilledMeta: IContactWithID
  }
  >(
  "customers/updateCustomers",
  async (customerData: IContactWithID, { fulfillWithValue, rejectWithValue }) => {
    try {
      const response = await customerAPI.customers.update(customerData);

      return response;

    } catch (error: any) {
      const err: AxiosError<ValidationErrors> = error;
      // if (!err.response){
      //   throw error;
      // }

      return rejectWithValue(error);
    }

    //return response.data.customer;

    // normalize the data so reducers can responded to a predictable payload, in this case: `action.payload = { users: {}, articles: {}, comments: {} }`
    //const normalized = normalize(data, articleEntity);
    //return normalized.entities;
  }
);

export const addCustomer = createAsyncThunk(
  "customers/addCustomer",
  async (newCustomer: IContactWithID, { fulfillWithValue, rejectWithValue }) => {
    try {
      const response = await customerAPI.customers.add(newCustomer);

      return (response);

    } catch (error: any) {
      console.log('addCustomer', error.errorMessage);
      return rejectWithValue(error);

    };
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id: number, { fulfillWithValue, rejectWithValue} ) => {
    try {
      const response = await customerAPI.customers.delete(id);

      return fulfillWithValue(response);

    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
)



interface Customer extends IContactWithID {
  error: string | null | undefined;
  loading: boolean;
};

const initialState: Customer = {
  error: null,
  loading: false,
  ID: 0,
  NAME: "",
};

export const customersAdapter = createEntityAdapter<Customer>({
  selectId: (customer) => customer.ID,
  sortComparer: (a, b) => b.ID - a.ID,
});

const customersSlice = createSlice({
  name: "customers",
  initialState: customersAdapter.getInitialState(initialState),
  reducers: {
    //addCustomer: customersAdapter.addOne,
    selectAllCustomers: customersAdapter.setAll,
    // updateCustomer(state, action) {
    //   console.log("updateCustomer_state", state);
    //   console.log("updateCustomer_action", action);
    // },
    //deleteCustomer: customersAdapter.removeOne
  },
  extraReducers:{
    [updateCustomer.fulfilled.toString()](state, action ) {
      const { ID, ...changes } = action.payload.queries.contact[0];
      state.loading = false;

      customersAdapter.updateOne(state,  { id: ID, changes } );
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
      customersAdapter.setAll(state, action.payload.queries.contacts)
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
      console.log('addCustomer_rejected', action);
      state.loading = false;
      state.error = action.payload.errorMessage;
    },
    [deleteCustomer.fulfilled.toString()](state, action){
      state.loading = false;
      state.error = null;

      console.log('deleteCustomer_fulfilled', action);
      customersAdapter.removeOne(state, action.payload);
    },
    [deleteCustomer.rejected.toString()](state, action){
      console.log('deleteCustomer_rejected', action);
      state.loading = false;
      if (action.payload) {
        state.error = action.payload.errorMessage;
      } else {
        state.error = action.errorMessage;
      }
    },
    [deleteCustomer.pending.toString()](state, action){
      state.loading = true;
      state.error = null;
      console.log('deleteCustomer_pending', action);
    }
  }
});

export const { selectAllCustomers } = customersSlice.actions;


export const customersSelectors = customersAdapter.getSelectors<RootState>(
  (state) => state.cutomers
);

export default customersSlice.reducer;
