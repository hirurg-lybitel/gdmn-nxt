import { RequestHandler } from 'express';
import { ForbiddenException, IRequestResult, UserType } from '@gsbelarus/util-api-types';
import { resultError } from '@gsbelarus/util-helpers';
import { ticketsUserService } from '../service';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const type = req.user['type'];

    const response = await ticketsUserService.findAll(
      sessionID,
      {
        ...req.query,
        ...(type === UserType.Tickets ? { companyKey: req.user['companyKey'] } : {}),
      },
      type,
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

const create: RequestHandler = async (req, res) => {
  try {
    const type = req.user['type'];

    if (type === UserType.Tickets && req.body.company.ID !== req.user['companyKey']) {
      throw ForbiddenException('Организация создаваемого ответственного лица отличается от вашей');
    }

    const users = await ticketsUserService.create(req.sessionID, req.body);

    const result: IRequestResult = {
      queries: { users: [users] },
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
    const updatedUser = await ticketsUserService.updateById(
      req.sessionID,
      id,
      { ...req.body, password: undefined }
    );

    const result: IRequestResult = {
      queries: { users: [updatedUser] },
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
    await ticketsUserService.removeById(req.sessionID, id, req.user['type'], req.user['companyKey']);
    res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const ticketsUserController = {
  findAll,
  create,
  updateById,
  removeById
};
