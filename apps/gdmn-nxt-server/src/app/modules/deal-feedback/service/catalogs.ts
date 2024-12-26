import { competenceFeedbackRepository } from '../repository/catalogs/competence';
import { resultFeedbackRepository } from '../repository/catalogs/result';
import { satisfactionFeedbackRepository } from '../repository/catalogs/satisfaction';
import { satisfactionRateFeedbackRepository } from '../repository/catalogs/satisfaction-rate';

const findAllCompetences = async (
  sessionID: string,
  clause = {}
) => {
  try {
    return await competenceFeedbackRepository.find(sessionID, clause);
  } catch (error) {
    throw error;
  }
};

const findAllSatisfactions = async (
  sessionID: string,
  clause = {}
) => {
  try {
    return await satisfactionFeedbackRepository.find(sessionID, clause);
  } catch (error) {
    throw error;
  }
};

const findAllResults = async (sessionID: string, clause = {}) => {
  try {
    return await resultFeedbackRepository.find(sessionID, clause);
  } catch (error) {
    throw error;
  }
};

const findAllSatisfactionRates = async (sessionID: string, clause = {}) => {
  try {
    return await satisfactionRateFeedbackRepository.find(sessionID, clause);
  } catch (error) {
    throw error;
  }
};

export const dealFeedbackCatalogs = {
  findAllCompetences,
  findAllSatisfactions,
  findAllResults,
  findAllSatisfactionRates,
};
