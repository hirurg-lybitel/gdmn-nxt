import dayjs from 'dayjs';
import { CronJob } from 'cron';

interface SchedulerTask {
  startDate: Date;
  action: () => void;
}

export interface CreateSchedulerProps {
  name?: string;
  dataGetter?: () => Promise<SchedulerTask[]>;
  refreshInterval?: number;
}

/**
 * Create scheduler for custom actions.
 * @param name name
 * @param dataGetter callback for getting an actions array
 * @param refreshInterval repeat interval for dataGetter callback
 */
export const createScheduler = ({
  name = 'default',
  dataGetter,
  refreshInterval = 10000
}: CreateSchedulerProps) => {
  const jobs = new Map<string, CronJob>();
  let dataGetterID: NodeJS.Timeout;
  let tasks: SchedulerTask[] = [];

  const rescheduleTasks = (tasks: SchedulerTask[]) => {
    jobs.forEach(j => j.stop());
    jobs.clear();

    tasks.forEach(task => {
      const { startDate, action } = task;
      const now = dayjs();
      /** Если задача по каким-то причинам была пропущена, то выполнить немедленно */
      if (dayjs(startDate).isBefore(now)) {
        action();
        return;
      }

      const time = dayjs(startDate).format('ss mm HH DD MM *');
      const job = new CronJob(time, action, null, true, 'Europe/Minsk');
      jobs.set(startDate.toString(), job);
    });
  };

  if (dataGetter) {
    const getData = async () => {
      tasks = await dataGetter();
      rescheduleTasks(tasks);
    };
    getData();
    dataGetterID = setInterval(getData, refreshInterval);
  }

  const clear = () => {
    tasks = [];
    clearInterval(dataGetterID);

    jobs.forEach(j => j.stop());
    jobs.clear();
  };

  return {
    name,
    getData: () => tasks,
    clear
  };
};
