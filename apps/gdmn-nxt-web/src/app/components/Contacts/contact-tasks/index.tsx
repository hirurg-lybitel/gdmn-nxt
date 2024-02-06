import useUserData from '@gdmn-nxt/components/helpers/hooks/useUserData';
import { useGetKanbanTasksQuery } from '../../../features/kanban/kanbanApi';
import KanbanTasksList from '@gdmn-nxt/components/Kanban/kanban-tasks-list/kanban-tasks-list';
import { useMemo } from 'react';

interface Props {
  contactId: number
}

export default function ContactsTasks({
  contactId
}: Props) {
  const { id: userId } = useUserData();
  const { data: columns = [], isFetching } = useGetKanbanTasksQuery({
    userId,
    performers: [{ ID: contactId }],
    creators: [{ ID: contactId }],
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
