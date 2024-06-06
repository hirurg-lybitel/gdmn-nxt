import {
  IMailing,
  InternalServerErrorException,
  Like,
  NotFoundException,
  UnprocessableEntityException
} from '@gsbelarus/util-api-types';
import { customersRepository } from '@gdmn-nxt/repositories/customers';
import { IAttachment, sendEmail } from '@gdmn/mailer';
import { forEachAsync, resultDescription } from '@gsbelarus/util-helpers';
import Mustache from 'mustache';
import { ERROR_MESSAGES } from '@gdmn/constants/server';
import dayjs from 'dayjs';
import { mailingRepository } from '../repository';
import fs from 'fs/promises';
import path from 'path';

function extractImgSrc(htmlString: string) {
  const imgTags = htmlString.match(/<img [^>]*src="[^"]*"/g);
  if (!imgTags) {
    return [];
  }
  return imgTags.map(tag => tag.match(/src="([^"]*)"/)[1]);
}

async function createTempImageFile(base64String: string, filename: string) {
  const tempImagePath = path.join(__dirname, filename);
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  await fs.writeFile(tempImagePath, base64Data, 'base64');
  return tempImagePath;
}

const findAll = async (
  sessionID: string,
  query?: { [key: string]: any }
) => {
  try {
    const pageSize = query?.pageSize;
    const pageNo = query?.pageNo;
    const name = query?.name;

    const sortField = query.field ?? 'NAME';
    const sortMode = query.sort ?? 'ASC';


    const mailings = await mailingRepository.find(
      sessionID,
      {
        ...(name && { USR$NAME: Like(name) }),
      },
      {
        [sortField]: sortMode
      }
    );

    let fromRecord = 0;
    let toRecord: number;

    if (pageNo && pageSize) {
      fromRecord = Number(pageNo) * Number(pageSize);
      toRecord = fromRecord + Number(pageSize);
    };

    const mailingsWithPagination = mailings.slice(fromRecord, toRecord);
    const count = mailings.length;

    return {
      mailings: mailingsWithPagination,
      count
    };
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const findOne = async (
  sessionID: string,
  id: number
) => {
  try {
    const mailing = await mailingRepository.findOne(sessionID, { ID: id });
    if (!mailing?.ID) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND);
    }

    return mailing;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const launchMailing = async (
  sessionID: string,
  id: number
) => {
  try {
    const mailing = await findOne(sessionID, id);
    if (!mailing?.ID) {
      throw NotFoundException(`Не найдена рассылка с id=${id}`);
    }

    if (mailing.includeSegments.length === 0) {
      await updateStatus(sessionID, id, 2, 'Нет получателей');
      return resultDescription('Нет получателей');
    }

    const customersClause = new Map();
    mailing.includeSegments.forEach(({ FIELDS }) => {
      FIELDS.forEach(({ NAME, VALUE }) => customersClause.set(NAME, VALUE));
    });

    const customers = await customersRepository.find(sessionID, { ...Object.fromEntries(customersClause.entries()) });

    if (customers.length === 0) {
      await updateStatus(sessionID, id, 2, 'Нет получателей');
      return resultDescription('Нет получателей');
    }

    await updateById(
      sessionID,
      id,
      {
        STARTDATE: new Date()
      });

    const subject = mailing.NAME;
    const from = `Belgiss <${process.env.SMTP_USER}>`;

    const html = mailing.TEMPLATE.replaceAll('#NAME#', '{{ NAME }}') ?? '';

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

    await updateById(
      sessionID,
      id,
      {
        FINISHDATE: new Date()
      });

    await updateStatus(sessionID, id, 1, 'Рассылка выполнена');
    return resultDescription('Рассылка выполнена');
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const createMailing = async (
  sessionID: string,
  body: Omit<IMailing, 'ID'>
) => {
  try {
    const { FINISHDATE, ...newMailingModel } = body;
    newMailingModel.STATUS = 0;

    if (newMailingModel.LAUNCHDATE) {
      if (!dayjs(newMailingModel.LAUNCHDATE).isValid()) {
        throw UnprocessableEntityException('Дата запуска указана неверно');
      }

      const currentDate = new Date();
      if (dayjs(newMailingModel.LAUNCHDATE).isBefore(currentDate)) {
        throw UnprocessableEntityException('Дата запуска меньше текущей');
      }
    }

    const newMailing = await mailingRepository.save(sessionID, newMailingModel);
    const mailing = await mailingRepository.findOne(sessionID, { id: newMailing.ID });

    return mailing;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const updateById = async (
  sessionID: string,
  id: number,
  body: Partial<Omit<IMailing, 'ID'>>
) => {
  try {
    const updatedMailing = await mailingRepository.update(
      sessionID,
      id,
      body
    );
    if (!updatedMailing?.ID) {
      throw NotFoundException(`Не найдена рассылка с id=${id}`);
    }
    const mailing = await findOne(sessionID, id);

    return mailing;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const removeById = async (
  sessionID: string,
  id: number
) => {
  try {
    const checkMailing = await findOne(sessionID, id);

    return await mailingRepository.remove(sessionID, id);
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const updateStatus = async (
  sessionID: string,
  id: number,
  status: 0 | 1 | 2,
  description: string
) => {
  const mailing = await findOne(sessionID, id);

  if (!mailing) {
    throw NotFoundException(`Не найдена рассылка с id=${id}`);
  }

  updateById(
    sessionID,
    id,
    {
      STATUS: status,
      STATUS_DESCRIPTION: description
    });
};

const testLaunchMailing = async (
  emails: string[],
  template: string,
  subject = 'Тестовая рассылка',
) => {
  if (emails.length === 0) {
    throw UnprocessableEntityException('Не указаны адреса для рассылок');
  }

  const from = `Belgiss <${process.env.SMTP_USER}>`;

  const html = template.replaceAll('#NAME#', '{{ NAME }}') ?? '';

  if (html === '') {
    throw UnprocessableEntityException('Не указан шаблон письма');
  }

  const imgSrcArray = extractImgSrc(html);

  const attachments: IAttachment[] = [];
  let modifiedHtml = html;
  await forEachAsync(imgSrcArray, async (item, idx) => {
    const base64Data = item.replace(/^data:image\/png;base64,/, '');

    const filename = `image${idx}.png`;
    const cid = `image${idx}@cid`;
    const filePath = await createTempImageFile(base64Data, filename);

    modifiedHtml = modifiedHtml.replace(item, `cid:${cid}`);

    attachments.push(
      {
        filename,
        path: filePath,
        cid,
      }
    );
  });

  await forEachAsync(emails, async (email) => {
    const view = {
      NAME: '<наименование клиента>'
    };

    const renderedHtml = Mustache.render(modifiedHtml, view);

    await sendEmail(
      from,
      email,
      subject,
      '',
      renderedHtml,
      attachments);
  });

  return resultDescription('Тестовая рассылка выполнена');
};

export const mailingService = {
  findAll,
  findOne,
  launchMailing,
  createMailing,
  updateById,
  removeById,
  testLaunchMailing
};
