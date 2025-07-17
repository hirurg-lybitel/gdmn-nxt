import { RequestHandler } from 'express';
import { IRequestResult, UserType } from '@gsbelarus/util-api-types';
import { filtersService } from '../service';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const entityName = req.params.entityName;

    const userId = req.user['id'];

    const ticketsUser = req.user['ticketsUser'];

    const response = await filtersService.findAll(
      sessionID,
      userId,
      ticketsUser ? UserType.Tickets : UserType.CRM,
      entityName
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

const createFilter: RequestHandler = async (req, res) => {
  try {
    const userId = req.user['id'];
    const filters = await filtersService.createFilter(req.sessionID, userId, req.body, req.user['ticketsUser'] ? UserType.Tickets : UserType.CRM);

    const result: IRequestResult = {
      queries: { filters: [filters] },
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
    const updatedFIlter = await filtersService.updateById(
      req.sessionID,
      id,
      req.body,
      req.user['ticketsUser'] ? UserType.Tickets : UserType.CRM
    );

    const result: IRequestResult = {
      queries: { filters: [updatedFIlter] },
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
    await filtersService.removeById(req.sessionID, id, req.user['ticketsUser'] ? UserType.Tickets : UserType.CRM);
    res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const filtersController = {
  findAll,
  createFilter,
  updateById,
  removeById
};
