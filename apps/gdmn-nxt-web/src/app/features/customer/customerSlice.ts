import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  PayloadAction
} from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { store, RootState } from "../../store";
import { contactApi, IContacts, IContactWithID } from "../contact/contactApi";
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
  IContactWithID | ValidationErrors,
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

      console.log('updateCustomer', response);

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



interface Customer extends IBaseContact {
  error: string | null | undefined;
  loading: boolean;
  ids: Array<number>;
  entities: Record<any, any>
};

const initialState: Customer = {
  error: null,
  loading: false,
  ID: 0,
  NAME: "",
  ids: [],
  entities: {},
};

export const customersAdapter = createEntityAdapter<Customer>({
  selectId: (customer) => customer.ID,
});

const customersSlice = createSlice({
  name: "customers",
  initialState: initialState,
  reducers: {
    addCustomer: customersAdapter.addOne,
    selectAllCustomers: customersAdapter.setAll,
    // updateCustomer(state, action) {
    //   console.log("updateCustomer_state", state);
    //   console.log("updateCustomer_action", action);
    // },
    deleteCustomer: customersAdapter.removeOne
  },
  extraReducers:{
    [updateCustomer.fulfilled.toString()](state, action: PayloadAction<IContactWithID> ) {
      const { ID, ...changes } = action.payload;

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
      console.log('fetchCustomers_fulfilled');
      state.loading = false;
      state.error = null;
      customersAdapter.setAll(state, action.payload.queries.contacts)
    },
    [fetchCustomers.pending.toString()](state, action) {
      state.loading = true;
    },
    [fetchCustomers.rejected.toString()](state, action) {
      console.log('fetchCustomers_rejected', action);
    },




    // builder.addCase(
    //   updateCustomer.fulfilled,
    //   (state, { payload }) =>{
    //     console.log('extraReducers_fulfilled_payload', payload);
    //     const { ID, ...changes } = payload as IContactWithID ;

    //     console.log('extraReducers_fulfilled_payload2', ID, changes);
    //     customersAdapter.updateOne(state,  { id: ID, changes } );
    //   }
    // )
    // builder.addCase(
    //   updateCustomer.rejected,
    //   (state, action) => {
    //     //console.log('extraReducers_rejected_state', state);
    //     if (action.payload) {
    //       console.log('extraReducers_rejected_payload', action.payload);
    //       state.error = action.payload.errorMessage;
    //     } else {
    //       console.log('extraReducers_rejected_payload', action.error.message);
    //       state.error = action.error.message as string;
    //     }
    //   }
    // )
    // builder.addCase( fetchCustomers.fulfilled, (state, action ) => {
    //   console.log('fetchCustomers_fulfilled', action);
    //   //customersAdapter.upsertMany(state, action.payload.customers);
    // })
    // builder.addCase(fetchCustomers.pending, (state, action) => {
    //   console.log('fetchCustomers_rejected', action);
    //   state.loading = true;
    // });
    // builder.addCase( fetchCustomers.rejected, (state, action ) => {
    //   console.log('fetchCustomers_rejected', action);
    //   //state.error = action.payload.errorMessage;
    // })
  }

});

export const { selectAllCustomers, addCustomer, deleteCustomer } = customersSlice.actions;


export const customersSelectors = customersAdapter.getSelectors<RootState>(
  (state) => state.cutomers
);

export default customersSlice.reducer;
