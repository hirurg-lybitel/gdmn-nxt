import { RequestHandler } from 'express';
import { resultError } from '../../responseMessages';
import { segmentsRepository } from '@gdmn-nxt/repositories/segments';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { ERROR_MESSAGES } from '@gdmn/constants/server';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const segments = await segmentsRepository.find(sessionID);

    const result: IRequestResult = {
      queries: { segments },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
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

    const segment = await segmentsRepository.findOne(sessionID, { ID: id });
    if (!segment?.ID) {
      return res.status(404).json(resultError(ERROR_MESSAGES.DATA_NOT_FOUND));
    }

    const result: IRequestResult = {
      queries: { segments: [segment] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

const createSegment: RequestHandler = async (req, res) => {
  try {
    const newSegment = await segmentsRepository.save(req.sessionID, req.body);
    const segment = await segmentsRepository.findOne(req.sessionID, { id: newSegment.ID });

    const result: IRequestResult = {
      queries: { segments: [segment] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
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
    const updatedSegment = await segmentsRepository.update(req.sessionID, id, req.body);
    if (!updatedSegment?.ID) {
      return res.sendStatus(404);
    }
    const segment = await segmentsRepository.findOne(req.sessionID, { id: updatedSegment.ID });

    const result: IRequestResult = {
      queries: { segments: [segment] },
      _params: [{ id }],
      _schema: {}
    };
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
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
    const checkSegment = await segmentsRepository.findOne(req.sessionID, { ID: id });
    if (!checkSegment?.ID) {
      return res.status(404).json(resultError(ERROR_MESSAGES.DATA_NOT_FOUND));
    }

    await segmentsRepository.remove(req.sessionID, id);

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

export const segmentsController = {
  findAll,
  findOne,
  createSegment,
  updateById,
  removeById
};
