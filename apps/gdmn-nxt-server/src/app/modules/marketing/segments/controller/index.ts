import { RequestHandler } from 'express';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { segmentsService } from '../service';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const response = await segmentsService.findAll(
      sessionID,
      {
        ...req.query
      }
    );

    const result: IRequestResult = {
      queries: { ...response },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const findOne: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res
      .status(422)
      .send(resultError('Field ID is not defined or is not numeric'));
  }

  try {
    const { id: sessionID } = req.session;

    const segment = await segmentsService.findOne(sessionID, id);

    const result: IRequestResult = {
      queries: { segments: [segment] },
      _params: [{ id }],
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const createSegment: RequestHandler = async (req, res) => {
  try {
    const segment = await segmentsService.createSegment(req.sessionID, req.body);

    const result: IRequestResult = {
      queries: { segments: [segment] },
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
    return res
      .status(422)
      .send(resultError('Field ID is not defined or is not numeric'));
  }

  try {
    const updatedSegment = await segmentsService.updateById(
      req.sessionID,
      id,
      req.body
    );

    const result: IRequestResult = {
      queries: { segments: [updatedSegment] },
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
    return res
      .status(422)
      .send(resultError('Field ID is not defined or is not numeric'));
  }

  try {
    const isDeleted = await segmentsService.removeById(req.sessionID, id);
    res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const calcCustomersCount: RequestHandler = async (
  req,
  res
) => {
  const { includeSegments = [], excludeSegments = [] } = req.body;

  try {
    const count = await segmentsService.calcCustomersCount(
      req.sessionID,
      includeSegments,
      excludeSegments
    );

    res.status(200).json({ count });
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const segmentsController = {
  findAll,
  findOne,
  createSegment,
  updateById,
  removeById,
  calcCustomersCount
};
