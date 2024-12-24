import { RequestHandler } from 'express';
import { timeTrackerTasksService } from '../service';
import { IRequestResult, UnprocessableEntityException } from '@gsbelarus/util-api-types';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  const userId = req.user['id'];
  try {
    const response = await timeTrackerTasksService.findAll(
      sessionID,
      {
        userId,
        ...req.query
      }
    );

    const result: IRequestResult = {
      queries: { timeTrackerTasks: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const findById: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  const userId = req.user['id'];

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw UnprocessableEntityException('Field ID is not defined or is not numeric');
  }

  try {
    const task = await timeTrackerTasksService.findOne(
      sessionID,
      id,
      userId
    );

    const result: IRequestResult = {
      queries: { timeTrackerTasks: [task] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const addToFavorites: RequestHandler = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      throw UnprocessableEntityException('Field taskId is not defined or is not numeric');
    }

    const { id: sessionID } = req.session;
    const userId = req.user['id'];

    await timeTrackerTasksService.addToFavorites(sessionID, userId, taskId);

    return res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const removeFromFavorites: RequestHandler = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      throw UnprocessableEntityException('Field taskId is not defined or is not numeric');
    }

    const { id: sessionID } = req.session;
    const userId = req.user['id'];

    const isDeleted = await timeTrackerTasksService.removeFromFavorites(sessionID, userId, taskId);
    res.sendStatus(200);
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
    const updatedTimeTrack = await timeTrackerTasksService.update(
      req.sessionID,
      id,
      req.body
    );

    const result: IRequestResult = {
      queries: { timeTrackerTasks: [updatedTimeTrack] },
      _params: [{ id }],
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

    const task = await timeTrackerTasksService.create(req.sessionID, req.body);

    const result: IRequestResult = {
      queries: { timeTrackerTasks: [task] },
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
    const isDeleted = await timeTrackerTasksService.remove(req.sessionID, id);
    res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const timeTrackerTasksController = {
  findAll,
  findById,
  addToFavorites,
  removeFromFavorites,
  update,
  create,
  remove
};
