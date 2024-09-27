import { timeTrackerTasksRepository } from '../repository';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  const userId = filter?.userId;
  const customerId = filter?.customerId;

  try {
    const tasks = await timeTrackerTasksRepository.find(sessionID);

    return tasks.reduce((filteredArray, t) => {
      let checkConditions = true;

      if (customerId) {
        checkConditions = checkConditions && (t.project.customer.ID === Number(customerId));
      }

      if (checkConditions) {
        filteredArray.push(t);
      }

      return filteredArray;
    }, []);
  } catch (error) {
    throw error;
  }
};

const findOne = async (
  sessionID: string,
  id: number
) => {
  try {
    const task = await timeTrackerTasksRepository.findOne(sessionID, { id });

    return task;
  } catch (error) {
    throw error;
  }
};

export const timeTrackerTasksService = {
  findAll,
  findOne
};
