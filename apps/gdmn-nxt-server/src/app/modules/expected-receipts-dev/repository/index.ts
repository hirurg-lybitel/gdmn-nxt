import { FindHandler, IExpectedReceiptDev } from '@gsbelarus/util-api-types';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';

const find: FindHandler<IExpectedReceiptDev> = async (
  sessionID,
  clause
) => {
  const dateBegin = clause['dateBegin'];
  const dateEnd = clause['dateEnd'];
  const includeZeroRest = clause['includeZeroRest'];

  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const testData: IExpectedReceiptDev[] = [{
      customer: {
        NAME: 'БМКК',
        ID: -1
      },
      contracts: [
        {
          number: '№ 23 10.01.2010',
          dateBegin: '16.01.2010',
          dateEnd: '30.06.2010',
          expired: 0,
          planned: false,
          subject: 'Автоматизация отгрузки',
          amount: {
            value: 100000,
            currency: 50000
          },
          done: {
            value: 0,
            currency: 0
          },
          paid: {
            value: 0,
            currency: 0
          },
          rest: {
            value: 100000,
            currency: 40000
          }
        },
        {
          number: '№ 23 10.01.2010',
          dateBegin: '16.01.2010',
          dateEnd: '30.06.2010',
          expired: 0,
          planned: false,
          subject: 'Автоматизация отгрузки',
          amount: {
            value: 100000,
            currency: 50000
          },
          done: {
            value: 0,
            currency: 0
          },
          paid: {
            value: 0,
            currency: 0
          },
          rest: {
            value: 100000,
            currency: 40000
          }
        }
      ]
    }];

    return testData;
  } finally {
    await releaseReadTransaction();
  }
};

export const expectedReceiptsDevRepository = {
  find
};
