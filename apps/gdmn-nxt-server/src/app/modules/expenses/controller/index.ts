import { RequestHandler } from 'express';
import { expensesService } from '../service';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  const dateBegin = new Date(Number(req.params.dateBegin));
  const dateEnd = new Date(Number(req.params.dateEnd));
  try {
    if (isNaN(dateBegin.getTime()) || isNaN(dateEnd.getTime())) {
      return res.send(resultError('Некорретная дата в периоде'));
    }

    const response = await expensesService.findAll(
      sessionID,
      {
        dateBegin,
        dateEnd,
        ...req.query
      }
    );

    const result: IRequestResult = {
      queries: { expenses: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const expensesController = {
  findAll
};
