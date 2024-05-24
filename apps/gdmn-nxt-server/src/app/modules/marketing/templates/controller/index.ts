import { RequestHandler } from 'express';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { templatesService } from '../service';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const response = await templatesService.findAll(
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

    const template = await templatesService.findOne(sessionID, id);

    const result: IRequestResult = {
      queries: { templates: [template] },
      _params: [{ id }],
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const createTemplate: RequestHandler = async (req, res) => {
  try {
    const template = await templatesService.createTemplate(req.sessionID, req.body);

    const result: IRequestResult = {
      queries: { templates: [template] },
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
    const updatedTemplate = await templatesService.updateById(
      req.sessionID,
      id,
      req.body
    );

    const result: IRequestResult = {
      queries: { templates: [updatedTemplate] },
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
    const isDeleted = await templatesService.removeById(req.sessionID, id);

    res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const templatesController = {
  findAll,
  findOne,
  createTemplate,
  updateById,
  removeById
};
