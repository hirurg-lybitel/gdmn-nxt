import { RequestHandler } from 'express';
import { IRequestResult, } from '@gsbelarus/util-api-types';
import { ticketsLabelsService } from '../service';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const response = await ticketsLabelsService.findAll(sessionID);

    const result: IRequestResult = {
      queries: { ...response },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const createLabel: RequestHandler = async (req, res) => {
  try {
    const labels = await ticketsLabelsService.createLabel(req.sessionID, req.body);

    const result: IRequestResult = {
      queries: { labels: [labels] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const updateById: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    throw new Error('Идентификатор поля не определен или не является числовым');
  }

  try {
    const updatedLabel = await ticketsLabelsService.updateById(
      req.sessionID,
      id,
      req.body
    );

    const result: IRequestResult = {
      queries: { labels: [updatedLabel] },
      _params: [{ id }],
      _schema: {}
    };
    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const removeById: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    throw new Error('Идентификатор поля не определен или не является числовым');
  }

  try {
    await ticketsLabelsService.removeById(req.sessionID, id);
    res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const ticketsLabelsController = {
  findAll,
  createLabel,
  updateById,
  removeById
};
