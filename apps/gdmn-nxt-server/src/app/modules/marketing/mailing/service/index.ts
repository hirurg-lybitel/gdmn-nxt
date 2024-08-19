import {
  CustomerFeedbackType,
  IMailing,
  InternalServerErrorException,
  Like,
  MailAttachment,
  MailingStatus,
  NotFoundException,
  UnprocessableEntityException
} from '@gsbelarus/util-api-types';
import { IAttachment, sendEmail, sendEmailByTestAccount } from '@gdmn/mailer';
import { forEachAsync, resultDescription } from '@gsbelarus/util-helpers';
import Mustache from 'mustache';
import dayjs from 'dayjs';
import { mailingRepository } from '../repository';
import fs from 'fs/promises';
import path from 'path';
import { segmentsService } from '../../segments/service';
import { feedbackService } from '@gdmn-nxt/modules/feedback/service';

function extractImgSrc(htmlString: string) {
  const imgTags = htmlString.match(/<img [^>]*src="[^"]*"/g);
  if (!imgTags) {
    return [];
  }
  return imgTags.map(tag => tag.match(/src="([^"]*)"/)[1]);
}

async function createTempFile(base64String: string, filename: string) {
  const tempImagePath = path.join(__dirname, filename);
  const base64Data = base64String.split(',')[1];
  await fs.writeFile(tempImagePath, base64Data, 'base64');
  return tempImagePath;
}


async function getHtmlWithAttachments(html: string) {
  const imgSrcArray = extractImgSrc(html);

  const attachments: IAttachment[] = [];
  let modifiedHtml = html;
  await forEachAsync(imgSrcArray, async (item, idx) => {
    const filename = `image${idx}.png`;
    const cid = `image${idx}@cid`;
    const filePath = await createTempFile(item, filename);

    modifiedHtml = modifiedHtml.replace(item, `cid:${cid}`);

    attachments.push(
      {
        filename,
        path: filePath,
        cid,
      }
    );
  });

  return {
    html: modifiedHtml,
    attachments
  };
}

const findAll = async (
  sessionID: string,
  query?: { [key: string]: any }
) => {
  try {
    const {
      pageSize,
      pageNo,
      field: sortField = 'NAME',
      sort: sortMode = 'ASC',
      name,
      ...where
    } = query;


    const mailings = await mailingRepository.find(
      sessionID,
      {
        ...(name && { USR$NAME: Like(name) }),
        ...where
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
    throw error;
  }
};

const findOne = async (
  sessionID: string,
  id: number
) => {
  try {
    const mailing = await mailingRepository.findOne(sessionID, { ID: id });
    if (!mailing?.ID) {
      throw NotFoundException(`Не найдена рассылка с id=${id}`);
    }

    return mailing;
  } catch (error) {
    throw error;
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

    if (mailing.STATUS === MailingStatus.completed) {
      throw UnprocessableEntityException('Рассылка уже выполнена');
    }

    if (mailing.STATUS === MailingStatus.inProgress) {
      throw UnprocessableEntityException('Рассылка уже выполняется');
    }

    await updateStatus(sessionID, id, MailingStatus.inProgress);

    if (mailing.includeSegments.length === 0) {
      await updateStatus(sessionID, id, MailingStatus.error, 'Нет получателей');
      return resultDescription('Нет получателей');
    }

    const customers = await segmentsService.getSegmentsCustomers(
      sessionID,
      mailing.includeSegments,
      mailing.excludeSegments
    );

    if (customers.length === 0) {
      await updateStatus(sessionID, id, MailingStatus.error, 'Нет получателей');
      return resultDescription('Нет получателей');
    }

    const subject = mailing.NAME;
    const from = `Belgiss <${process.env.SMTP_USER}>`;

    const originalHtml = mailing.TEMPLATE.replaceAll('#NAME#', '{{ NAME }}') ?? '';

    if (originalHtml === '') {
      await updateStatus(sessionID, id, MailingStatus.error, 'Не найден шаблон письма');
      throw InternalServerErrorException('Не найден шаблон письма');
    }

    const { html, attachments: imagesAttachments } = await getHtmlWithAttachments(originalHtml);

    const attachmentsSummaryPromise = mailing.attachments?.map(async ({ fileName, content }, idx): Promise<IAttachment> => ({
      filename: fileName,
      path: await createTempFile(content, fileName),
      cid: `file${idx}@cid`
    })) ?? [];

    const attachmentsSummary = (await Promise.all([...attachmentsSummaryPromise])).concat(imagesAttachments);

    const response = {
      accepted: [],
      rejected: []
    };

    await forEachAsync(customers, async ({ ID, NAME, EMAIL }) => {
      const view = {
        NAME
      };

      if (!EMAIL) {
        response.rejected.push({ [ID]: 'Не указан email' });
        return;
      };

      const renderedHtml = Mustache.render(html, view);


      try {
        const { accepted, rejected } = await sendEmail(
          from,
          EMAIL,
          subject,
          '',
          renderedHtml,
          attachmentsSummary);

        if (accepted.length > 0) {
          response.accepted.push({ [ID]: accepted.toString() });
        }
        if (rejected.length > 0) {
          response.rejected.push({ [ID]: 'Не доставлено' });
        }
      } catch (error) {
        throw new Error(error.message);
      }
    });

    await updateStatus(sessionID, id, MailingStatus.completed, 'Рассылка выполнена');

    try {
      await forEachAsync(response.accepted, async r => {
        const customerId = Object.keys(r).length > 0 ? Number(Object.keys(r)[0]) : -1;
        await feedbackService.createFeedback(sessionID, {
          type: CustomerFeedbackType.email,
          customer: {
            ID: customerId,
            NAME: ''
          },
          mailing
        });
      });
    } catch (error) {
      console.error('Error while creating email feedback');
      throw error;
    }

    return {
      ...resultDescription('Тестовая рассылка выполнена'),
      ...response
    };
  } catch (error) {
    throw error;
  }
};

const createMailing = async (
  sessionID: string,
  body: Omit<IMailing, 'ID'>
) => {
  try {
    const { STARTDATE, FINISHDATE, ...newMailingModel } = body;
    newMailingModel.STATUS = newMailingModel.STATUS ?? MailingStatus.manual;

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
    throw error;
  }
};

const updateById = async (
  sessionID: string,
  id: number,
  body: Partial<Omit<IMailing, 'ID'>>
) => {
  try {
    const mailing = await findOne(sessionID, id);
    if (!mailing?.ID) {
      throw NotFoundException(`Не найдена рассылка с id=${id}`);
    }

    const updatedMailing = await mailingRepository.update(
      sessionID,
      id,
      body
    );
    if (!updatedMailing?.ID) {
      throw NotFoundException(`Не найдена рассылка с id=${id}`);
    }
    const response = await findOne(sessionID, id);

    return response;
  } catch (error) {
    throw error;
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
    throw error;
  }
};

const updateStatus = async (
  sessionID: string,
  id: number,
  status: MailingStatus,
  description = ''
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
      STATUS_DESCRIPTION: description,
      ...(status === MailingStatus.inProgress && { STARTDATE: new Date() }),
      ...(status === MailingStatus.completed && { FINISHDATE: new Date() })
    });
};

const testLaunchMailing = async (
  emails: string[],
  template: string,
  subject = 'Тестовая рассылка',
  attachments: MailAttachment[] = [],
) => {
  try {
    if (emails.length === 0) {
      throw UnprocessableEntityException('Не указаны адреса для рассылок');
    }

    const from = `Belgiss <${process.env.SMTP_USER}>`;

    const originalHtml = template.replaceAll('#NAME#', '{{ NAME }}') ?? '';

    if (originalHtml === '') {
      throw UnprocessableEntityException('Не указан шаблон письма');
    }

    const { html, attachments: imagesAttachments } = await getHtmlWithAttachments(originalHtml);

    const response = {
      accepted: [],
      rejected: []
    };

    const attachmentsSummaryPromise = attachments.map(async ({ fileName, content }, idx): Promise<IAttachment> => ({
      filename: fileName,
      path: await createTempFile(content, fileName),
      cid: `file${idx}@cid`
    }));

    const attachmentsSummary = (await Promise.all([...attachmentsSummaryPromise])).concat(imagesAttachments);

    await forEachAsync(emails, async (email) => {
      const view = {
        NAME: '<наименование клиента>'
      };

      const renderedHtml = Mustache.render(html, view);

      try {
        const { accepted, rejected } = await sendEmail(
          from,
          email,
          subject,
          '',
          renderedHtml,
          attachmentsSummary);

        response.accepted.push(...accepted);
        response.rejected.push(...rejected);
      } catch (error) {
        throw new Error(error.message);
      }
    });

    return {
      ...resultDescription('Тестовая рассылка выполнена'),
      ...response
    };
  } catch (error) {
    throw error;
  }
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
