import { customersRepository } from '@gdmn-nxt/repositories/customers';
import { mailingRepository } from '@gdmn-nxt/repositories/mailing';
import { sendEmail } from '@gdmn/mailer';
import { InternalServerErrorException, NoContentException, NotFoundException } from '@gsbelarus/util-api-types';
import { forEachAsync } from '@gsbelarus/util-helpers';
import Mustache from 'mustache';
import { resultDescription } from '../responseMessages';

const launchMailing = async (sessionID: string, id: number) => {
  const mailing = await mailingRepository.findOne(sessionID, { ID: id });

  if (!mailing) {
    throw NotFoundException(`Не найдена рассылка с id=${id}`);
  }

  if (mailing.segments.length === 0) {
    await updateStatus(sessionID, id, 2, 'Нет получателей');
    return resultDescription('Нет получателей');
  }

  const customersClause = new Map();
  mailing.segments.forEach(({ FIELDS }) => {
    FIELDS.forEach(({ NAME, VALUE }) => customersClause.set(NAME, VALUE));
  });

  const customers = await customersRepository.find(sessionID, { ...Object.fromEntries(customersClause.entries()) });

  if (customers.length === 0) {
    await updateStatus(sessionID, id, 2, 'Нет получателей');
    return resultDescription('Нет получателей');
  }

  await mailingRepository.update(
    sessionID,
    id,
    {
      STARTDATE: new Date()
    });

  const subject = 'Тема письма';
  const from = `Belgiss <${process.env.SMTP_USER}>`;

  /** Выбранный шаблон письма (НЕ ссылка, а копия для текущей рассылки)  */
  const html = mailing.TEMPLATE ?? '';

  if (html === '') {
    await updateStatus(sessionID, id, 2, 'Не найден шаблон письма');
    throw InternalServerErrorException('Не найден шаблон письма');
  }

  await forEachAsync(customers, async ({ NAME, EMAIL }) => {
    const view = {
      NAME
    };

    const renderedHtml = Mustache.render(html, view);

    await sendEmail(
      from,
      EMAIL,
      subject,
      '',
      renderedHtml);
  });

  await mailingRepository.update(
    sessionID,
    id,
    {
      FINISHDATE: new Date()
    });

  await updateStatus(sessionID, id, 1, 'Рассылка выполнена');
  return 'Рассылка выполнена';
};

const updateStatus = async (
  sessionID: string,
  id: number,
  status: 0 | 1 | 2,
  description: string
) => {
  const mailing = await mailingRepository.findOne(sessionID, { ID: id });

  if (!mailing) {
    throw NotFoundException(`Не найдена рассылка с id=${id}`);
  }

  mailingRepository.update(
    sessionID,
    id,
    {
      STATUS: status,
      STATUS_DESCRIPTION: description
    });
};

export const mailingService = {
  launchMailing,
  updateStatus
};
