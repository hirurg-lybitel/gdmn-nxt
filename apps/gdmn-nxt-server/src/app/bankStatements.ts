import { IDataSchema, IRequestResult } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { getReadTransaction, releaseReadTransaction } from './utils/db-connection';
import { resultError } from './responseMessages';

export const get: RequestHandler = async(req, res) => {
  const customerId = parseInt(req.params.customerId);

  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  try {
    const schema: IDataSchema = {
      actCompletion: {
        DOCUMENTDATE: {
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

    const query = {
      name: 'bankStatements',
      query: `
          SELECT
            doc.id,
            job.USR$NUMBER as job,
            dep.NAME as dep,
            doc.NUMBER,
            doc.DOCUMENTDATE,
            l.CSUMNCU,
            l.COMMENT
          FROM
            BN_BANKSTATEMENTLINE l
            left join gd_document doc on doc.ID = l.ID
            left join USR$BG_CONTRACTJOB job on job.ID = l.USR$CONTRACTJOBKEY
            left join gd_contact dep on dep.ID = l.USR$DEPARTMENTKEY
            ${isNaN(customerId) ? '' : 'WHERE l.COMPANYKEY = ?'}
          ORDER BY
            doc.DOCUMENTDATE DESC`,
      params: isNaN(customerId) ? undefined : [customerId]
    };

    const bankStatements = await Promise.resolve(execQuery(query));

    const result: IRequestResult = {
      queries: { bankStatements },
      _params: isNaN(customerId) ? undefined : [{ customerId: customerId }],
      _schema: schema
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  }
};

export default { get };
