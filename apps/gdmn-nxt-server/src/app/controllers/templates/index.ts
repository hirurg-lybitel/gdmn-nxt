import { RequestHandler } from 'express';
import { resultError } from '../../responseMessages';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { ERROR_MESSAGES } from '@gdmn/constants/server';
import { templatesRepository } from '@gdmn-nxt/repositories/templates';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const { pageSize, pageNo, name } = req.query;
    let fromRecord = 0;
    let toRecord: number;

    if (pageNo && pageSize) {
      fromRecord = Number(pageNo) * Number(pageSize);
      toRecord = fromRecord + Number(pageSize);
    };

    const templates = await templatesRepository.find(sessionID);

    const dataWithFilter = (name && name !== '') ? templates.filter(item => item['NAME'].indexOf(name.toString()) !== -1) : templates;
    const count = dataWithFilter.length;
    const dataWitPagination = dataWithFilter.slice(fromRecord, toRecord);

    const result: IRequestResult = {
      queries: { templates: dataWitPagination, count },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
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

    const template = await templatesRepository.findOne(sessionID, { ID: id });
    if (!template?.ID) {
      return res.status(404).json(resultError(ERROR_MESSAGES.DATA_NOT_FOUND));
    }

    const result: IRequestResult = {
      queries: { templates: [template] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

const createTemplate: RequestHandler = async (req, res) => {
  try {
    const newTemplate = await templatesRepository.save(req.sessionID, req.body);
    const template = await templatesRepository.findOne(req.sessionID, { id: newTemplate.ID });

    const result: IRequestResult = {
      queries: { templates: [template] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
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
    const updatedTemplate = await templatesRepository.update(req.sessionID, id, req.body);
    if (!updatedTemplate?.ID) {
      return res.sendStatus(404);
    }
    const template = await templatesRepository.findOne(req.sessionID, { id: updatedTemplate.ID });

    const result: IRequestResult = {
      queries: { templates: [template] },
      _params: [{ id }],
      _schema: {}
    };
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
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
    const checkTemplate = await templatesRepository.findOne(req.sessionID, { ID: id });
    if (!checkTemplate?.ID) {
      return res.status(404).json(resultError(ERROR_MESSAGES.DATA_NOT_FOUND));
    }

    await templatesRepository.remove(req.sessionID, id);

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

export const templatesController = {
  findAll,
  findOne,
  createTemplate,
  updateById,
  removeById
};
