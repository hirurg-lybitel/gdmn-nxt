import { IDataSchema, IRequestResult } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { resultError } from '../responseMessages';
import { getReadTransaction, releaseReadTransaction } from '../utils/db-connection';

const getSumByPeriod: RequestHandler = async(req, res) => {
  // sumbyperiod/?departmentId=147016912&dateBegin=1577912400000&dateEnd=1643662800000

  const departmentId = req.query.departmentId as string;
  if (departmentId && isNaN(parseInt(departmentId, 10))) {
    return res.status(422).send(resultError('Неверный формат "departmentId"'));
  };

  const dateBegin = new Date(Number(req.query.dateBegin));
  if (isNaN(dateBegin.getTime())) {
    return res.status(422).send(resultError('Не указано поле "dateBegin"'));
  };

  const dateEnd = new Date(Number(req.query.dateEnd));
  if (isNaN(dateEnd.getTime())) {
    return res.status(422).send(resultError('Не указано поле "dateEnd"'));
  };

  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  try {
    const schema: IDataSchema = {
      sumByperiod: {
        ONDATE: {
          type: 'date'
        }
      }
    };

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      const rs = await attachment.executeQuery(transaction, query, params);
      try {
        const data = await rs.fetchAsObject();
        const sch = schema[name];

        if (sch) {
          for (const rec of data) {
            for (const fld of Object.keys(rec)) {
              if ((sch[fld]?.type === 'date' || sch[fld]?.type === 'timestamp') && rec[fld] !== null) {
                rec[fld] = (rec[fld] as Date).getTime();
              }
            }
          }
        };

        return data;
      } finally {
        await rs.close();
      }
    };

    const getParams: any = (withKeys = false) => {
      const arr: Array<any | { [key: string]: any}> = [];
      dateBegin
        ? withKeys ? arr.push({ dateBegin }) : arr.push(dateBegin)
        : null;
      dateEnd
        ? withKeys ? arr.push({ dateEnd }) : arr.push(dateEnd)
        : null;
      departmentId
        ? withKeys ? arr.push({ departmentId }) : arr.push(departmentId)
        : null;

      return (arr?.length > 0 ? arr : undefined);
    };

    const query = {
      name: 'sumByperiod',
      query: `
        SELECT
          CAST(c.USR$DOCDATE AS DATE) AS ONDATE,
          SUM(c.USR$SUMNCU) AMOUNT
        FROM
          USR$CRM_CUSTOMER c
          JOIN gd_document doc on doc.ID = c.USR$ID
          JOIN gd_contact dep on dep.ID = c.USR$DEPOTKEY
        WHERE
          c.USR$DOCDATE BETWEEN ? AND ?
          ${departmentId ? 'AND dep.ID = ?' : ''}
        GROUP BY CAST(c.USR$DOCDATE AS DATE)
        ORDER BY 1`,
      params: getParams(false)
    };

    const sumByperiod = await Promise.resolve(execQuery(query));

    const result: IRequestResult = {
      queries: { sumByperiod },
      _params: getParams(true),
      _schema: schema
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  };
};


export default { getSumByPeriod };
