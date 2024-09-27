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
      id
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


export const timeTrackerTasksController = {
  findAll,
  findById
};
