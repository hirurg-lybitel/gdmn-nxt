import { InternalServerErrorException, ITimeTrackTask, NotFoundException } from '@gsbelarus/util-api-types';
import { timeTrackerProjectsRepository } from '../repository';
import { timeTrackerTasksService } from '@gdmn-nxt/modules/time-tracker-tasks/service';
import { favoriteTimeTrackerProjectsRepository } from '../repository/favoriteTimeTrackerProjects';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  const userId = filter.userId;
  const customerId = filter.customerId;

  try {
    const projects = await timeTrackerProjectsRepository.find(sessionID, {
      ...(customerId && { 'USR$CUSTOMER': customerId }),
    });

    const favorites = await favoriteTimeTrackerProjectsRepository.find(sessionID, { 'USR$USER': userId });

    const tasks = new Map<number, ITimeTrackTask[]>();

    (await timeTrackerTasksService.findAll(sessionID, { userId }))
      ?.forEach(({ project, ...task }) => {
        const projectId = project.ID;
        if (tasks.has(projectId)) {
          if (tasks.get(projectId)?.findIndex(({ ID }) => ID === task.ID) < 0) {
            tasks.get(projectId)?.push(task);
          }
        } else {
          tasks.set(projectId, [task]);
        };
      });

    return projects.map(p => ({
      ...p,
      isFavorite: favorites.findIndex(f => f.project.ID === p.ID) >= 0,
      tasks: tasks.get(p.ID) ?? []
    }));
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
    const workProject = await timeTrackerProjectsRepository.findOne(sessionID, { id: taskId });
    if (!workProject) {
      throw NotFoundException(`Не найдена запись с id=${taskId}`);
    }

    const newFavorite = await favoriteTimeTrackerProjectsRepository.save(
      sessionID,
      userId,
      taskId);

    return await favoriteTimeTrackerProjectsRepository.find(
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
    const favorite = await favoriteTimeTrackerProjectsRepository.find(
      sessionID, {
        'USR$USER': userId,
        id: taskId
      });
    if (!favorite) {
      throw NotFoundException(`Не найден проект с id=${taskId}`);
    }

    const isDeleted = await favoriteTimeTrackerProjectsRepository.remove(
      sessionID,
      userId,
      taskId);

    if (!isDeleted) {
      throw InternalServerErrorException('Ошибка при удалении проекта из избранных');
    }

    return isDeleted;
  } catch (error) {
    throw error;
  }
};

export const timeTrackerProjectsService = {
  findAll,
  addToFavorites,
  removeFromFavorites
};
