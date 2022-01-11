import { baseUrl } from '../../const';
import { IContactWithID } from '../contact/contactApi';

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

      console.log('list', `${baseUrl}/contacts`);
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
    }
  }
};

export default customerAPI;
