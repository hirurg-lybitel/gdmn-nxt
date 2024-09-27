import { ITimeTrackTask } from '@gsbelarus/util-api-types';
import { timeTrackerProjectsRepository } from '../repository';
import { timeTrackerTasksService } from '@gdmn-nxt/modules/time-tracker-tasks/service';

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

    const tasks = new Map<number, ITimeTrackTask[]>();

    (await timeTrackerTasksService.findAll(sessionID))
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
      tasks: tasks.get(p.ID) ?? []
    }));
  } catch (error) {
    throw error;
  }
};

export const timeTrackerProjectsService = {
  findAll,
};
