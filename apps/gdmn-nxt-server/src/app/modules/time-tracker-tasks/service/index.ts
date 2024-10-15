import { InternalServerErrorException, NotFoundException } from '@gsbelarus/util-api-types';
import { timeTrackerTasksRepository } from '../repository';
import { favoriteTimeTrackerTasksRepository } from '../repository/favoriteTimeTrackerTasks';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  const userId = filter?.userId;
  const customerId = filter?.customerId;

  try {
    const tasks = await timeTrackerTasksRepository.find(sessionID);

    const favorites = await favoriteTimeTrackerTasksRepository.find(sessionID, { 'USR$USER': userId });

    return tasks.reduce((filteredArray, t) => {
      let checkConditions = true;

      t.isFavorite = favorites.findIndex(f => f.task.ID === t.ID) >= 0;

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
  id: number,
  userId
) => {
  try {
    const task = await timeTrackerTasksRepository.findOne(sessionID, { id });

    const favorites = await favoriteTimeTrackerTasksRepository.find(sessionID, { 'USR$USER': userId });

    task.isFavorite = favorites.findIndex(f => f.task.ID === task.ID) >= 0;

    return task;
  } catch (error) {
    throw error;
  }
};

const addToFavorites = async (
  sessionID: string,
  userId: number,
  taskId: number
) => {
  try {
    const workProject = await timeTrackerTasksRepository.findOne(sessionID, { id: taskId });
    if (!workProject) {
      throw NotFoundException(`Не найдена запись с id=${taskId}`);
    }

    const newFavorite = await favoriteTimeTrackerTasksRepository.save(
      sessionID,
      userId,
      taskId);

    return await favoriteTimeTrackerTasksRepository.find(
      sessionID,
      {
        id: newFavorite.ID
      });
  } catch (error) {
    throw error;
  }
};

const removeFromFavorites = async (
  sessionID: string,
  userId: number,
  taskId: number
) => {
  try {
    const favorite = await favoriteTimeTrackerTasksRepository.find(
      sessionID, {
        'USR$USER': userId,
        id: taskId
      });
    if (!favorite) {
      throw NotFoundException(`Не найдена задача с id=${taskId}`);
    }

    const isDeleted = await favoriteTimeTrackerTasksRepository.remove(
      sessionID,
      userId,
      taskId);

    if (!isDeleted) {
      throw InternalServerErrorException('Ошибка при удалении задачи из избранных');
    }

    return isDeleted;
  } catch (error) {
    throw error;
  }
};

export const timeTrackerTasksService = {
  findAll,
  findOne,
  addToFavorites,
  removeFromFavorites
};
