import { IContactWithID, IContactWithLabels } from '@gsbelarus/util-api-types';
import { baseUrlApi } from '../../const';

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
      const startTimeM = new Date().getTime();
      console.log('⏩ request', "GET", `${baseUrlApi}contacts`);

      const response = await fetch(`${baseUrlApi}contacts`, {
        method: "GET",
        headers: _headers
      });

      const resBodу = await response.json();

      const durationM = new Date().getTime() - startTimeM

      console.log('✉️ response', response.status,  resBodу, `Duration: ${durationM/1000} sec.`);

      if (!response.ok) {
        throw resBodу;
      }
      return resBodу;

      //return {errorMessage: "error_Test"};

    },
    async listByRootID(rootId: string): Promise<any> {
      const startTimeM = new Date().getTime();
      console.log('⏩ request', "GET", `${baseUrlApi}contacts/rootId/${rootId}`);

      const response = await fetch(`${baseUrlApi}contacts/rootId/${rootId}`, {
        method: "GET",
        headers: _headers
      });

      const resBodу = await response.json();

      const durationM = new Date().getTime() - startTimeM

      console.log('✉️ response', response.status,  resBodу, `Duration: ${durationM/1000} sec.`);

      if (!response.ok) {
        throw resBodу;
      }
      return resBodу;

      //return {errorMessage: "error_Test"};

    },
    async update(customerData: IContactWithLabels): Promise<any> {
      console.log('request', "PUT", `${baseUrlApi}contacts/${customerData.ID}`);

      const response = await fetch(`${baseUrlApi}contacts/${customerData.ID}`, {
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
    async add(customer: IContactWithLabels): Promise<IContactWithLabels | IError> {
      console.log('request', "POST", `${baseUrlApi}contacts`);

      const response = await fetch(`${baseUrlApi}contacts`, {
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
      console.log('request', "DELETE", `${baseUrlApi}contacts/${id}`);

      const response = await fetch(`${baseUrlApi}contacts/${id}`, {
        method: "DELETE",
        headers: _headers
      });

      const responseBodу = await response.json();

      console.log('✉️ response', response.status,  responseBodу);

      if (!response.ok) {
        throw responseBodу;
      }

      return responseBodу;
    },
    async hierarchy(): Promise<any> {
      const startTimeM = new Date().getTime();
      console.log('⏩ request', "GET", `${baseUrlApi}contacts/hierarchy`);

      const response = await fetch(`${baseUrlApi}contacts/hierarchy`, {
        method: "GET",
        headers: _headers
      });

      const resBodу = await response.json();

      const durationM = new Date().getTime() - startTimeM
      console.log('✉️ response', response.status,  resBodу, `Duration: ${durationM/1000} sec.`);

      if (!response.ok) {
        throw resBodу;
      }
      return resBodу;
    }

  }
};

export default customerAPI;
