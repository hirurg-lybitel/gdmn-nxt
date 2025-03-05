import { RequestHandler } from 'express';
import { expectedReceiptsService } from '../service';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { resultError } from '@gsbelarus/util-helpers';
import { parseIntDef } from '@gsbelarus/util-useful';

const findAll: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  const dateBegin = new Date(parseIntDef(req.params.dateBegin, new Date().getTime()));
  const dateEnd = new Date(parseIntDef(req.params.dateEnd, new Date().getTime()));
  try {
    const response = await expectedReceiptsService.findAll(
      sessionID,
      {
        dateBegin,
        dateEnd,
        ...req.query
      }
    );

    const result: IRequestResult = {
      queries: { expectedReceipts: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const expectedReceiptsController = {
  findAll
};
