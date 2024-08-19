import { useMemo } from 'react';
import { useGetKanbanTasksQuery } from '../../../features/kanban/kanbanApi';
import useUserData from '@gdmn-nxt/components/helpers/hooks/useUserData';
import KanbanTasksList from '@gdmn-nxt/components/Kanban/kanban-tasks-list/kanban-tasks-list';

export interface CustomerTasksProps {
  customerId: number
}

export function CustomerTasks({
  customerId
}: CustomerTasksProps) {
  const { id: userId } = useUserData();
  const { data: columns = [], isFetching } = useGetKanbanTasksQuery({
    userId,
    customers: [{ ID: customerId }],
  });

  const KanbanListMemo = useMemo(() =>
    <KanbanTasksList columns={columns} isLoading={isFetching} />,
  [columns, isFetching]);

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        marginTop: '-45px'
      }}
    >
      {KanbanListMemo}
    </div>
  );
}
