import { RequestHandler } from 'express';
import { resultDescription, resultError } from '../../responseMessages';
import { IMailing, IRequestResult } from '@gsbelarus/util-api-types';
import { mailingRepository } from '@gdmn-nxt/repositories/mailing';
import { customersRepository } from '@gdmn-nxt/repositories/customers';
import { sendEmail } from '@gdmn/mailer';
import { forEachAsync } from '@gsbelarus/util-helpers';
import Mustache from 'mustache';
import { ERROR_MESSAGES } from '@gdmn/constants/server';
import dayjs from 'dayjs';
import { mailingService } from '../../services/mailing';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const mailings = await mailingRepository.find(sessionID);

    const result: IRequestResult = {
      queries: { mailings },
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

    const mailing = await mailingRepository.findOne(sessionID, { ID: id });
    if (!mailing?.ID) {
      return res.status(404).json(resultError(ERROR_MESSAGES.DATA_NOT_FOUND));
    }

    const result: IRequestResult = {
      queries: { mailings: [mailing] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

const launchMailing: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res
      .status(422)
      .send(resultError('Field ID is not defined or is not numeric'));
  }

  try {
    const { id: sessionID } = req.session;

    const response = await mailingService.launchMailing(sessionID, id);

    return res.status(200).send(response);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const createMailing: RequestHandler<{}, {}, Omit<IMailing, 'ID'>> = async (req, res) => {
  try {
    const { FINISHDATE, ...newMailingModel } = req.body;
    newMailingModel.STATUS = 0;

    if (newMailingModel.LAUNCHDATE) {
      if (!dayjs(newMailingModel.LAUNCHDATE).isValid()) {
        return res.status(422).send(resultError('Дата запуска указана неверно'));
      }

      const currentDate = new Date();
      if (dayjs(newMailingModel.LAUNCHDATE).isBefore(currentDate)) {
        return res.status(422).send(resultError('Дата запуска меньше текущей'));
      }
    }

    const newMailing = await mailingRepository.save(req.sessionID, newMailingModel);
    const mailing = await mailingRepository.findOne(req.sessionID, { id: newMailing.ID });

    const result: IRequestResult = {
      queries: { mailings: [mailing] },
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
    const updatedMailing = await mailingRepository.update(req.sessionID, id, req.body);
    if (!updatedMailing?.ID) {
      return res.sendStatus(404);
    }
    const mailing = await mailingRepository.findOne(req.sessionID, { id: updatedMailing.ID });

    const result: IRequestResult = {
      queries: { mailings: [mailing] },
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
    const checkMailing = await mailingRepository.findOne(req.sessionID, { ID: id });
    if (!checkMailing?.ID) {
      return res.status(404).json(resultError(ERROR_MESSAGES.DATA_NOT_FOUND));
    }

    await mailingRepository.remove(req.sessionID, id);

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

export const mailingController = {
  findAll,
  findOne,
  launchMailing,
  createMailing,
  updateById,
  removeById
};
