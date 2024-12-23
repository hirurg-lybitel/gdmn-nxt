import { resultError } from '@gsbelarus/util-helpers';
import { RequestHandler } from 'express';
import { dealFeedbackService } from '../service';
import { IRequestResult, UnprocessableEntityException } from '@gsbelarus/util-api-types';

const findByDeal: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  try {
    const dealId = parseInt(req.params.dealId);
    if (isNaN(dealId)) {
      throw UnprocessableEntityException('Field dealId is not defined or is not numeric');
    }

    const response = await dealFeedbackService.findByDeal(
      sessionID,
      dealId
    );

    const result: IRequestResult = {
      queries: { feedback: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const createFeedback: RequestHandler = async (req, res) => {
  try {
    const feedback = await dealFeedbackService.createFeedback(req.sessionID, req.body);


    const result: IRequestResult = {
      queries: { feedback: [feedback] },
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
    throw UnprocessableEntityException('Field ID is not defined or is not numeric');
  }

  try {
    const updatedFeedback = await dealFeedbackService.updateFeedback(
      req.sessionID,
      id,
      req.body
    );

    const result: IRequestResult = {
      queries: { feedback: [updatedFeedback] },
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
    throw UnprocessableEntityException('Field ID is not defined or is not numeric');
  }

  try {
    const isDeleted = await dealFeedbackService.removeById(req.sessionID, id);
    res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const dealFeedbackController = {
  findByDeal,
  createFeedback,
  updateById,
  removeById,
};
