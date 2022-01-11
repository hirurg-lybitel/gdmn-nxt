import { IContactWithID } from '@gsbelarus/util-api-types';
import { baseUrl } from '../../const';

const _headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

interface IError {
  errorMessage: string
}

const customerAPI = {
  customers: {
    async list(): Promise<IContactWithID[] | IError> {
      const result = await fetch(`${baseUrl}contacts`, {
        method: "GET",
        headers: _headers
      });

      const status = result.status;
      const resBodу = await result.json();

      console.log('customerAPI_list', status, resBodу);

      if (!result.ok) {
        throw resBodу;
      }
      return resBodу;

      //return {errorMessage: "error_Test"};

    },
    async update(customerData: IContactWithID): Promise<IContactWithID | IError> {
      const result = await fetch(`${baseUrl}contacts/${customerData.ID}`, {
        method: "PUT",
        headers: _headers,
        body: JSON.stringify(customerData)
      });

      const status = result.status;
      const resBodу = await result.json();

      console.log('customerAPI_update', status, resBodу);

      if (!result.ok) {
        throw resBodу;
      }
      return resBodу;
    },
    async add(customer: IContactWithID): Promise<IContactWithID | IError> {
      const response = await fetch(`${baseUrl}contacts`, {
        method: "POST",
        headers: _headers,
        body: JSON.stringify(customer)
      });
      const responseBodу = await response.json();

      if (!response.ok) {
        //console.log('customerAPI_add', responseBodу);
        throw responseBodу;
      }

      return responseBodу;
    },
    async delete(id: number): Promise< any | IError> {
      const response = await fetch(`${baseUrl}contacts/${id}`, {
        method: "DELETE",
        headers: _headers
      });

      console.log('customerAPI_delete', response.body);
      const responseBodу = await response.json();

      if (!response.ok) {
        throw responseBodу;
      }

      return responseBodу;
    }
  }
};

export default customerAPI;
