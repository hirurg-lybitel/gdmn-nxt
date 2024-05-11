import { RequestHandler } from 'express';
import { resultDescription, resultError } from '../../responseMessages';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { mailingRepository } from '@gdmn-nxt/repositories/mailing';
import { customersRepository } from '@gdmn-nxt/repositories/customers';
import { sendEmail } from '@gdmn/mailer';
import { forEachAsync } from '@gsbelarus/util-helpers';
import Mustache from 'mustache';
import { ERROR_MESSAGES } from '@gdmn/constants/server';

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

    const mailing = await mailingRepository.findOne(sessionID, { ID: id });

    if (!mailing) {
      return res.status(404).send(resultError(`Не найдена рассылка с id=${id}`));
    }

    if (mailing.segments.length === 0) {
      return res.status(200).send(resultDescription('Нет получателей'));
    }

    const customersClause = new Map();
    mailing.segments.forEach(({ FIELDS }) => {
      FIELDS.forEach(({ NAME, VALUE }) => customersClause.set(NAME, VALUE));
    });

    const customers = await customersRepository.find(sessionID, { ...Object.fromEntries(customersClause.entries()) });

    if (customers.length === 0) {
      return res.status(204);
    }

    mailingRepository.update(
      sessionID,
      id,
      {
        LAUNCHDATE: new Date()
      });

    const subject = 'Тема письма';
    const from = `Belgiss <${process.env.SMTP_USER}>`;

    /** Выбранный шаблон письма (НЕ ссылка, а копия для текущей рассылки)  */
    // const html = `
    //   <html>
    //     <body>
    //       <div>
    //       Приветствуем, {{ name }}.
    //       </div>
    //     </body>
    //   </html>`;
    const html = mailing.TEMPLATE ?? '';

    if (html === '') {
      return res.status(500).send(resultError('Не найден шаблон письма'));
    }

    await forEachAsync(customers, async ({ NAME, EMAIL }) => {
      const view = {
        name: NAME
      };

      const renderedHtml = Mustache.render(html, view);

      await sendEmail(
        from,
        EMAIL,
        subject,
        '',
        renderedHtml);
    });

    return res.sendStatus(200);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

const createMailing: RequestHandler = async (req, res) => {
  try {
    const newMailing = await mailingRepository.save(req.sessionID, req.body);
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
