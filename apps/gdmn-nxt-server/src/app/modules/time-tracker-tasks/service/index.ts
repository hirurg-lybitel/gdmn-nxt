import { InternalServerErrorException, ITimeTrackTask, NotFoundException } from '@gsbelarus/util-api-types';
import { timeTrackerTasksRepository } from '../repository';
import { favoriteTimeTrackerTasksRepository } from '../repository/favoriteTimeTrackerTasks';
import { ERROR_MESSAGES } from '@gdmn/constants/server';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  const userId = filter?.userId;
  const customerId = filter?.customerId;
  const projectId = filter?.projectId;
  const isActive = filter?.isActive;
  const considerProjectStatus = filter?.considerProjectStatus;

  try {
    const tasks = await timeTrackerTasksRepository.find(sessionID,
      {
        ...(projectId && { 'USR$PROJECT': projectId }),
        ...(isActive ? { 'USR$ISACTIVE': isActive === 'true' ? 1 : 0 } : {}),
        ...(considerProjectStatus && { 'p.USR$DONE': 0 })
      }
    );

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
    }, [] as ITimeTrackTask[]).sort((a, b) => a.isFavorite ? -1 : 1);
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

const update = async (
  sessionID: string,
  id: number,
  userId: number,
  body: Partial<ITimeTrackTask>
) => {
  try {
    const task = await timeTrackerTasksRepository.findOne(sessionID, { id });
    if (!task) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND_WITH_ID(id));
    }
    const updatedTask =
        await timeTrackerTasksRepository.update(
          sessionID,
          id,
          body
        );
    if (body.isFavorite !== task.isFavorite) {
      if (body.isFavorite === true) {
        await timeTrackerTasksService.addToFavorites(sessionID, userId, task.ID);
      }
      if (body.isFavorite === false) {
        await timeTrackerTasksService.removeFromFavorites(sessionID, userId, task.ID);
      }
    }
    if (!updatedTask) {
      throw InternalServerErrorException(ERROR_MESSAGES.UPDATE_FAILED);
    }

    return await timeTrackerTasksRepository.findOne(sessionID, { id });
  } catch (error) {
    throw error;
  }
};

const create = async (
  sessionID: string,
  userId: number,
  body: ITimeTrackTask
) => {
  try {
    const task = await timeTrackerTasksRepository.save(sessionID, body);
    if (task.isFavorite) {
      await timeTrackerTasksService.addToFavorites(sessionID, userId, task.ID);
    }
    return task;
  } catch (error) {
    throw error;
  }
};

const remove = async (
  sessionID: string,
  id: number
) => {
  try {
    const task = await timeTrackerTasksRepository.findOne(sessionID, { id });
    if (!task) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND_WITH_ID(id));
    }

    const isDeleted = await timeTrackerTasksRepository.remove(sessionID, id);

    if (!isDeleted) {
      throw InternalServerErrorException(ERROR_MESSAGES.DELETE_FAILED);
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
  removeFromFavorites,
  update,
  create,
  remove
};
