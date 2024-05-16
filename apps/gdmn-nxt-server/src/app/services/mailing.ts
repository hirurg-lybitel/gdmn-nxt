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
    return resultDescription('Нет получателей');
  }

  const customersClause = new Map();
  mailing.segments.forEach(({ FIELDS }) => {
    FIELDS.forEach(({ NAME, VALUE }) => customersClause.set(NAME, VALUE));
  });

  const customers = await customersRepository.find(sessionID, { ...Object.fromEntries(customersClause.entries()) });

  if (customers.length === 0) {
    throw NoContentException();
  }

  mailingRepository.update(
    sessionID,
    id,
    {
      STARTDATE: new Date()
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
    throw InternalServerErrorException('Не найден шаблон письма');
  }

  await forEachAsync(customers, async ({ NAME, EMAIL }) => {
    const view = {
      name: NAME
    };

    const renderedHtml = Mustache.render(html, view);

    // await sendEmail(
    //   from,
    //   EMAIL,
    //   subject,
    //   '',
    //   renderedHtml);
  });

  mailingRepository.update(
    sessionID,
    id,
    {
      FINISHDATE: new Date()
    });

  return 'Рассылка выполнена';
};

export const mailingService = {
  launchMailing
};
