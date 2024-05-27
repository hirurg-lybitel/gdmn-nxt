import { RequestHandler } from 'express';
import { IMailing, IRequestResult } from '@gsbelarus/util-api-types';
import { mailingService } from '../service';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const response = await mailingService.findAll(
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

    const mailing = await mailingService.findOne(sessionID, id);

    const result: IRequestResult = {
      queries: { mailings: [mailing] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const launchMailing: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res
      .status(422)
      .send(resultError('Field ID is not defined or is not numeric'));
  }

  try {
    const { id: sessionID } = req.session;

    const response = await mailingService.launchMailing(sessionID, id);

    return res.status(200).send(response);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const createMailing: RequestHandler<{}, {}, Omit<IMailing, 'ID'>> = async (req, res) => {
  try {
    const mailing = await mailingService.createMailing(req.sessionID, req.body);

    const result: IRequestResult = {
      queries: { mailings: [mailing] },
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
    const updatedMailing = await mailingService.updateById(
      req.sessionID,
      id,
      req.body
    );

    const result: IRequestResult = {
      queries: { mailings: [updatedMailing] },
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
    const isDeleted = await mailingService.removeById(req.sessionID, id);
    res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const mailingController = {
  findAll,
  findOne,
  launchMailing,
  createMailing,
  updateById,
  removeById
};
