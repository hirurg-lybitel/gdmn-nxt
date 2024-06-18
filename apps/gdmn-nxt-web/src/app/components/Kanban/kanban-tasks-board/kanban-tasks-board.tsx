import { IKanbanColumn } from '@gsbelarus/util-api-types';
import styles from './kanban-tasks-board.module.less';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { Box, Stack } from '@mui/material';
import { useCallback, useMemo } from 'react';
import KanbanColumn from '../kanban-column/kanban-column';
import KanbanTasksCard from '../kanban-tasks-card/kanban-tasks-card';

export interface KanbanTasksBoardProps {
  columns: IKanbanColumn[];
  isLoading: boolean,
}

export function KanbanTasksBoard(props: KanbanTasksBoardProps) {
  const { columns, isLoading } = props;

  const skeletonsColumns: IKanbanColumn[] = useMemo(() => ([...Array(5)].map((el, idx) => ({ ID: idx } as IKanbanColumn))), []);

  const columnHandlers = {
    handleTitleEdit: useCallback((newColumn: IKanbanColumn) => {}, []), // updateColumn(newColumn);
  };

  return (
    <PerfectScrollbar
      style={{
        display: 'flex',
        paddingBottom: '10px',
        pointerEvents: isLoading ? 'none' : 'auto'
      }}
    >
      <Box display="flex" flex={1}>
        <Stack
          direction="row"
          spacing={4}
          display="flex"
          overflow="auto"
          flex={1}
        >
          {(isLoading ? skeletonsColumns : columns).map((column, index) => (
            <Box
              key={index}
              display="flex"
              flex={1}
            >
              <Box
                style={{
                  display: 'flex',
                  width: '350px',
                }}
              >
                <KanbanColumn
                  disabledAddDeal
                  key={column.ID || 1}
                  item={column || {} as IKanbanColumn}
                  columns={columns || [] as IKanbanColumn[]}
                  onEdit={columnHandlers.handleTitleEdit}
                  // onEditCard={cardHandlers.handleEditCard}
                  // onDelete={columnHandlers.handleTitleDelete}
                  // onDeleteCard={cardHandlers.handleDeleteCard}
                  // onAddCard={cardHandlers.handleAddCard}
                  isFetching={isLoading}
                >
                  {column.CARDS
                    ?.map((card, index) => {
                      return (
                        <Box
                          key={index}
                          className={styles.boardItem}
                        >
                          <KanbanTasksCard
                            card={card}
                          />
                        </Box>
                      );
                    })}
                </KanbanColumn>
              </Box>
            </Box>
          ))}
        </Stack>

      </Box>
    </PerfectScrollbar>
  );
}

export default KanbanTasksBoard;
