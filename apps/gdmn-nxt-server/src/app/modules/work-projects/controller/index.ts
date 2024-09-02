import { IRequestResult, UnprocessableEntityException } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { workProjectsService } from '../service';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  try {
    const response = await workProjectsService.findAll(
      sessionID
    );

    const result: IRequestResult = {
      queries: { workProjects: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const create: RequestHandler = async (req, res) => {
  try {
    const workProject = await workProjectsService.create(req.sessionID, req.body);

    const result: IRequestResult = {
      queries: { workProjects: [workProject] },
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
    const updatedWorkProject = await workProjectsService.update(
      req.sessionID,
      id,
      req.body
    );

    const result: IRequestResult = {
      queries: { workProjects: [updatedWorkProject] },
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
    const isDeleted = await workProjectsService.remove(req.sessionID, id);
    res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const workProjectsController = {
  findAll,
  create,
  update,
  remove,
};
