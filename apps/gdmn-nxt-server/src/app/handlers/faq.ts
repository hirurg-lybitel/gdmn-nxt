import { faq } from './../../../../gdmn-nxt-web/src/app/features/FAQ/faqApi';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { ResultSet } from 'node-firebird-driver-native';
import { importedModels } from '../models';
import { resultError } from '../responseMessages';
import { getReadTransaction, releaseReadTransaction, releaseTransaction, rollbackTransaction, startTransaction } from '../utils/db-connection';
import { genId } from '../utils/genId';

const eintityName = 'TgdcAttrUserDefinedUSR_CRM_LABELS';

function instanceOfFaq(data: any): data is faq {
  return data;
}

const faqs:faq[] = [
  {
    question: 'вопрос 1',
    answer: 'Ответ на вопрос 1',
  },
  {
    question: 'вопрос 2',
    answer: 'Ответ на вопрос 2',
  },
  {
    question: 'вопрос 3',
    answer: 'Ответ на вопрос 3',
  },
  {
    question: 'вопрос 4',
    answer: 'Ответ на вопрос 4',
  },
  {
    question: 'вопрос 5',
    answer: 'Ответ на вопрос 5',
  },
  {
    question: 'вопрос 6',
    answer: 'Ответ на вопрос 6',
  },
  {
    question: 'вопрос 7',
    answer: 'Ответ на вопрос 7',
  },
  {
    question: 'вопрос 8',
    answer: 'Ответ на вопрос 8',
  },
  {
    question: 'вопрос 9',
    answer: 'Ответ на вопрос 9',
  },
  {
    question: 'вопрос 10',
    answer: 'Ответ на вопрос 10',
  },
  {
    question: 'вопрос 11',
    answer: 'Ответ на вопрос 11',
  }
];

const get: RequestHandler = async(req, res) => {
  try {
    return res.status(200).json(faqs);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  }
};

const post: RequestHandler = async(req, res) => {
  try {
    const faq:faq = req.body;
    if (Object.keys(faq).length === 2 && 'question' in faq && 'answer' in faq) {
      faqs.push(req.body);
    } else {
      throw 'expected {\'question\': some, \'answer\': some}';
    }
    return res.status(200).json(faqs);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  }
};

const put: RequestHandler = async(req, res) => {
  try {
    const faq:faq = req.body.faq;
    const index:number = req.body.index;
    if (isNaN(index)) {
      throw 'expected number';
    }
    if (faqs.length < index) {
      throw 'uncorrect number';
    }
    if (Object.keys(faq).length === 2 && 'question' in faq && 'answer' in faq) {
      faqs[index] = faq;
    } else {
      throw 'expected {\'question\': some, \'answer\': some}';
    }
    return res.status(200).json(faqs);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  }
};

const remove: RequestHandler = async(req, res) => {
  try {
    const index:number = req.body.index;
    if (isNaN(index)) {
      throw 'expected number';
    }
    if (faqs.length < index) {
      throw 'uncorrect number';
    }
    faqs.splice(index, 1);
    return res.status(200).json(faqs);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  }
};

export default { get, post, put, remove };
