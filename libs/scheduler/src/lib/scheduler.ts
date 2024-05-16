import { CronJob } from 'cron';

interface SchedulerData {
  startDate: Date;
  action: any;
}

export interface CreateSchedulerProps {
  name: string;
  data?: SchedulerData[];
  dataGetter?: () => Promise<SchedulerData[]>;
  refreshInterval?: number;
}

/**
 * Create scheduler for custom actions.
 * @param data array of actions
 * @param dataGetter callback for refreshing actions array
 * @param refreshInterval repeat interval for dataGetter callback
 */
export const createScheduler = ({
  name,
  data = [],
  dataGetter,
  refreshInterval = 5000
}: CreateSchedulerProps) => {
  let protectedData = [...data];

  if (dataGetter) {
    const getData = async () => {
      protectedData = await dataGetter();
    };
    getData();
    setInterval(getData, refreshInterval);
  }

  // const job = new CronJob('0 9-17 * * 1-5', sendEmailNotifications);
  // job.start();


  return {
    name,
    data: protectedData,
    getData: () => protectedData
  };
};
