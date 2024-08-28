import { IRequestResult, UnprocessableEntityException } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { timeTrackingService } from '../service';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  const userId = req.user['id'];
  try {
    const response = await timeTrackingService.findAll(
      sessionID,
      {
        userId
      }
    );

    const result: IRequestResult = {
      queries: { timeTracking: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const findAllByGroup: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  const userId = req.user['id'];
  try {
    const response = await timeTrackingService.findAllByGroup(
      sessionID,
      {
        userId
      }
    );

    const result: IRequestResult = {
      queries: { timeTracking: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const findInProgress: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  const userId = req.user['id'];
  try {
    const response = await timeTrackingService.findInProgress(
      sessionID,
      {
        userId
      }
    );

    const result: IRequestResult = {
      queries: { timeTracking: [response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const create: RequestHandler = async (req, res) => {
  try {
    const userId = req.user['id'];

    const timeTrack = await timeTrackingService.create(
      req.sessionID,
      {
        user: {
          ID: userId
        },
        ...req.body
      }
    );

    const result: IRequestResult = {
      queries: { timeTracking: [timeTrack] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const update: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw UnprocessableEntityException('Field ID is not defined or is not numeric');
  }

  try {
    const updatedTimeTrack = await timeTrackingService.update(
      req.sessionID,
      id,
      req.body
    );

    const result: IRequestResult = {
      queries: { timeTracking: [updatedTimeTrack] },
      _params: [{ id }],
      _schema: {}
    };
    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const remove: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw UnprocessableEntityException('Field ID is not defined or is not numeric');
  }

  try {
    const isDeleted = await timeTrackingService.remove(req.sessionID, id);
    res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const timeTrackingController = {
  findAll,
  findAllByGroup,
  findInProgress,
  create,
  update,
  remove,
};
