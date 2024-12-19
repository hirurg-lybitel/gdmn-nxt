import { RequestHandler } from 'express';
import { timeTrackerProjectsService } from '../service';
import { IRequestResult, UnprocessableEntityException } from '@gsbelarus/util-api-types';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  const userId = req.user['id'];
  try {
    const response = await timeTrackerProjectsService.findAll(
      sessionID,
      {
        userId,
        ...req.query
      }
    );

    const result: IRequestResult = {
      queries: { timeTrackerProjects: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const addToFavorites: RequestHandler = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      throw UnprocessableEntityException('Field projectId is not defined or is not numeric');
    }

    const { id: sessionID } = req.session;
    const userId = req.user['id'];

    await timeTrackerProjectsService.addToFavorites(sessionID, userId, projectId);

    return res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const removeFromFavorites: RequestHandler = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      throw UnprocessableEntityException('Field projectId is not defined or is not numeric');
    }

    const { id: sessionID } = req.session;
    const userId = req.user['id'];

    const isDeleted = await timeTrackerProjectsService.removeFromFavorites(sessionID, userId, projectId);
    res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const getFilters: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const response = await timeTrackerProjectsService.getFilters(sessionID);

    const result: IRequestResult = {
      queries: { filters: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const timeTrackerProjectsController = {
  findAll,
  addToFavorites,
  removeFromFavorites,
  getFilters
};
