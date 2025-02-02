import { IRequestResult, UnprocessableEntityException } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { resultError } from '@gsbelarus/util-helpers';
import { timeTrackingProjectTypesService } from '../service';

const findAll: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  const userId = req.user['id'];
  try {
    const response = await timeTrackingProjectTypesService.findAll(
      sessionID,
      {
        userId,
        ...req.query
      }
    );

    const result: IRequestResult = {
      queries: { timeTrackingProjectsTypes: [...response] },
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

    const projectType = await timeTrackingProjectTypesService.create(
      req.sessionID,
      {
        user: {
          ID: userId
        },
        ...req.body
      }
    );

    const result: IRequestResult = {
      queries: { timeTrackingProjectsTypes: [projectType] },
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
    const updatedPtojectType = await timeTrackingProjectTypesService.update(
      req.sessionID,
      id,
      req.body
    );

    const result: IRequestResult = {
      queries: { timeTrackingProjectsTypes: [updatedPtojectType] },
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
    const isDeleted = await timeTrackingProjectTypesService.remove(req.sessionID, id);
    res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const timeTrackingProjectTypesController = {
  findAll,
  create,
  update,
  remove,
};
