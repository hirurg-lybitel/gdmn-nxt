import { IContactWithID, IContactWithLabels } from '@gsbelarus/util-api-types';
import { baseUrlApi } from '../../const';

const _headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

interface IError {
  errorMessage: string
};

const customerAPI = {
  customers: {
    async list(options?: any): Promise<any> {
      const startTimeM = new Date().getTime();
      const params = [];

      for (const key in options) {
        for (const [name, value] of Object.entries(options[key])) {
          params.push(`${name}=${value}`);
        };
      };

      const response = await fetch(`${baseUrlApi}contacts?${params.join('&')}`, {
        method: 'GET',
        headers: _headers
      });

      const resBodу = await response.json();

      if (!response.ok) {
        throw resBodу;
      }
      return resBodу;
    },
    async listByRootID(rootId: string): Promise<any> {
      const response = await fetch(`${baseUrlApi}contacts/rootId/${rootId}`, {
        method: 'GET',
        headers: _headers
      });

      const resBodу = await response.json();
      if (!response.ok) {
        throw resBodу;
      }
      return resBodу;
    },
    async update(customerData: IContactWithLabels): Promise<any> {
      const response = await fetch(`${baseUrlApi}contacts/${customerData.ID}`, {
        method: 'PUT',
        headers: _headers,
        body: JSON.stringify(customerData)
      });

      const status = response.status;
      const resBodу = await response.json();

      if (!response.ok) {
        throw resBodу;
      }
      return resBodу;
    },
    async add(customer: IContactWithLabels): Promise<IContactWithLabels | IError> {
      const response = await fetch(`${baseUrlApi}contacts`, {
        method: 'POST',
        headers: _headers,
        body: JSON.stringify(customer)
      });

      const responseBodу = await response.json();

      if (!response.ok) {
        throw responseBodу;
      }

      return responseBodу;
    },
    async delete(id: number): Promise< any | IError> {
      const response = await fetch(`${baseUrlApi}contacts/${id}`, {
        method: 'DELETE',
        headers: _headers
      });

      const responseBodу = await response.json();

      if (!response.ok) {
        throw responseBodу;
      }

      return responseBodу;
    },
    async hierarchy(): Promise<any> {
      const response = await fetch(`${baseUrlApi}contacts/hierarchy`, {
        method: 'GET',
        headers: _headers
      });

      const resBodу = await response.json();
      if (!response.ok) {
        throw resBodу;
      }
      return resBodу;
    }

  }
};

export default customerAPI;
