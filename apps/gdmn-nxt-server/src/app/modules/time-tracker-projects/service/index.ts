import { InternalServerErrorException, ITimeTrackProject, ITimeTrackTask, NotFoundException } from '@gsbelarus/util-api-types';
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
    const projects = await timeTrackerProjectsRepository.find(
      sessionID,
      {
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

    const response: ITimeTrackProject[] = [];

    /** Split projects into favorite and non-favorite */
    projects.forEach((project) => {
      const projectTasks = tasks.get(project.ID) ?? [];

      const favoriteTasks = projectTasks.filter(({ isFavorite }) => isFavorite);
      const nonFavoriteTasks = projectTasks.filter(({ isFavorite }) => !isFavorite);

      if (favoriteTasks.length > 0) {
        response.push({
          ...project,
          isFavorite: true,
          tasks: favoriteTasks
        });
      }

      if (nonFavoriteTasks.length > 0) {
        response.push({
          ...project,
          isFavorite: false,
          tasks: nonFavoriteTasks
        });
      }
    });

    return response.sort((a, b) => (a.isFavorite ? -1 : 1));
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

const getFilters = async (
  sessionID: string
) => {
  try {
    const filters = await favoriteTimeTrackerProjectsRepository.getFilters(sessionID);
    return filters;
  } catch (error) {
    throw error;
  }
};

export const timeTrackerProjectsService = {
  findAll,
  addToFavorites,
  removeFromFavorites,
  getFilters
};
