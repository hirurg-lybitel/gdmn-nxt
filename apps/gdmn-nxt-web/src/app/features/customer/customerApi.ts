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
    async list(): Promise<any> {
      console.log('request', "GET", `${baseUrl}contacts`);

      const response = await fetch(`${baseUrl}contacts`, {
        method: "GET",
        headers: _headers
      });

      const resBodу = await response.json();

      console.log('✉️ response', response.status,  resBodу);

      if (!response.ok) {
        throw resBodу;
      }
      return resBodу;

      //return {errorMessage: "error_Test"};

    },
    async update(customerData: IContactWithID): Promise<any> {
      console.log('request', "PUT", `${baseUrl}contacts/${customerData.ID}`);

      const response = await fetch(`${baseUrl}contacts/${customerData.ID}`, {
        method: "PUT",
        headers: _headers,
        body: JSON.stringify(customerData)
      });

      const status = response.status;
      const resBodу = await response.json();

      console.log('✉️ response', response.status,  resBodу);

      if (!response.ok) {
        throw resBodу;
      }
      return resBodу;
    },
    async add(customer: IContactWithID): Promise<IContactWithID | IError> {
      console.log('request', "POST", `${baseUrl}contacts`);

      const response = await fetch(`${baseUrl}contacts`, {
        method: "POST",
        headers: _headers,
        body: JSON.stringify(customer)
      });

      const responseBodу = await response.json();

      console.log('✉️ response', response.status,  responseBodу);

      if (!response.ok) {
        //console.log('customerAPI_add', responseBodу);
        throw responseBodу;
      }

      return responseBodу;
    },
    async delete(id: number): Promise< any | IError> {
      console.log('request', "DELETE", `${baseUrl}contacts/${id}`);

      const response = await fetch(`${baseUrl}contacts/${id}`, {
        method: "DELETE",
        headers: _headers
      });

      const responseBodу = await response.json();

      console.log('✉️ response', response.status,  responseBodу);

      if (!response.ok) {
        throw responseBodу;
      }

      return responseBodу;
    }
  }
};

export default customerAPI;
