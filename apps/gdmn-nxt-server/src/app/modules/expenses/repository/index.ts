import { FindHandler, IExpense } from '@gsbelarus/util-api-types';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';

const find: FindHandler<IExpense> = async (
  sessionID,
  clause
) => {
  const dateBegin = clause['dateBegin'];
  const dateEnd = clause['dateEnd'];

  const { fetchAsObject, releaseReadTransaction, blob2String } = await acquireReadTransaction(sessionID);

  try {
    // let sql = `${'asd'}`;

    // const data = await fetchAsObject<IContract>(sql, { dateBegin, dateEnd });

    const test: IExpense[] = [
      {
        article: 'Статья1',
        amount: 1000,
        valAmount: 300
      },
      {
        article: 'бббббб',
        amount: 800,
        valAmount: 200
      },
      {
        article: 'Ааааа',
        amount: 2000,
        valAmount: 600
      }
    ];

    return test;
  } finally {
    await releaseReadTransaction();
  }
};

export const expensesRepository = {
  find
};
