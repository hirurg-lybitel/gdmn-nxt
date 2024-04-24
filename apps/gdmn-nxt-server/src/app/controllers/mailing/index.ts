import { RequestHandler } from 'express';
import { resultError } from '../../responseMessages';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { mailingRepository } from '@gdmn-nxt/repositories/mailing';
import { customersRepository } from '@gdmn-nxt/repositories/customers';
import { sendEmail } from '@gdmn/mailer';
import { forEachAsync } from '@gsbelarus/util-helpers';
import Mustache from 'mustache';

const getAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const mailing = await mailingRepository.find(sessionID);

    const result: IRequestResult = {
      queries: { mailing },
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
      return res.status(404).send(resultError('Data not found'));
    }

    const customersClause = new Map();
    mailing.segments.forEach(({ FIELDS }) => {
      FIELDS.forEach(({ NAME, VALUE }) => customersClause.set(NAME, VALUE));
    });

    const customers = await customersRepository.find(sessionID, { ...Object.fromEntries(customersClause.entries()) });

    const subject = 'Тема письма';
    const from = `Belgiss <${process.env.SMTP_USER}>`;

    const html = `
      <html>
        <body>
          <div>
          Приветствуем, {{ name }}.
          </div>
        </body>
      </html>`;

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


export const mailingController = {
  getAll,
  launchMailing
};
