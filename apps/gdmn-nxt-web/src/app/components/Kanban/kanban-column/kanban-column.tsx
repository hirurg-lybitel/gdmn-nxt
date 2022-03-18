import './kanban-column.module.less';
import { useState } from 'react';
import CustomizedCard from '../../customized-card/customized-card';
import { Box, Button, CardActions, CardContent, CardHeader, Divider, Stack, Typography, Input, IconButton, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';
import { DraggableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from 'react-beautiful-dnd';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { IKanbanCard, IKanbanColumn } from '@gsbelarus/util-api-types';


export interface KanbanColumnProps {
  provided: DraggableProvided;
  dragSnapshot: DraggableStateSnapshot;
  dropSnapshot: DroppableStateSnapshot;
  columns: IKanbanColumn[];
  children: JSX.Element[];
  item: IKanbanColumn;
  onEdit: (newColumn: IKanbanColumn) => void;
  onDelete: (column: IKanbanColumn) => void;
  onAddCard: (card: IKanbanCard) => void;
}

export function KanbanColumn(props: KanbanColumnProps) {
  const { provided, dragSnapshot, dropSnapshot } = props;
  const { children, item, columns } = props;
  const { onEdit, onDelete, onAddCard} = props;

  const theme = useTheme();

  const [upsertCard, setUpsertCard] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);


  const cardHandlers = {
    handleSubmit: async (card: IKanbanCard, deleting: boolean) => {
      if (deleting) {
        return;
      };

      if (card.ID > 0) {
        return;
      };

      onAddCard(card);

      setUpsertCard(false);
    },
    handleCancel: async () => setUpsertCard(false),
  };

  const [editTitleHidden, setEditTitleHidden] = useState(true);
  const [editTitleText, setEditTitleText] = useState(false);
  const [titleText, setTitleText] = useState(item.USR$NAME);

  const header = () => {
    const handleTitleOnMouseEnter = () => {
      setEditTitleHidden(false);
    };
    const handleTitleOnMouseLeave = () => {
      setEditTitleHidden(true);
    };
    const handleEditTitle = () => {
      setEditTitleText(true);
    };

    const handleTitleKeyPress = (event: any) => {
      if (event.keyCode === 13 ) {
        onEdit({...item, USR$NAME: titleText});
        setEditTitleText(false);
        return;
      }

      if (event.keyCode === 27 ) {
        setTitleText(item.USR$NAME);
        setEditTitleText(false);
        return;
      }
    };

    const onBlur = (e: any) => {
      setTitleText(item.USR$NAME);
      setEditTitleText(false);
    };

    return(
      <Stack
        direction="row"
        onMouseEnter={handleTitleOnMouseEnter}
        onMouseLeave={handleTitleOnMouseLeave}
        onKeyPress={handleTitleKeyPress}
        onKeyDown={handleTitleKeyPress}
        onBlur={(e) => onBlur(e)}
        maxWidth="200px"
      >
        <Box
          style={{
            flex: 1,
            padding: 3,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {editTitleText
            ? <Input
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}

                autoFocus
              />
            : <Typography
                variant="h4"
                noWrap
                style={{
                  opacity: `${editTitleHidden ? 1 : 0.3}`,
                }}
              > {item.USR$NAME}</Typography>
            }
        </Box>
        <div
          style={{
            display: `${editTitleHidden ? 'none' : 'inline'}`
          }}
        >
          <IconButton size="small" onClick={() => handleEditTitle()}>
            <EditIcon fontSize="small" />
          </IconButton >
          <IconButton size="small" onClick={() => setConfirmOpen(true)}>
            <DeleteIcon fontSize="small" />
          </IconButton >
        </div>
      </Stack>

    )
  }

  return (
    <Box
      style={{ display: 'flex'}}
    >
      <CustomizedCard
        borders
        style={{
          minWidth: '230px',
          maxWidth: '400px',
          width: '250px',
          display: 'flex',
          flexDirection: 'column',
          ...(dragSnapshot.isDragging
            ? {
              backgroundColor: '#deebff',
              opacity: 0.7,
              border: `solid ${theme.menu?.backgroundColor}`
            }
            : {
            }),
      }}
      >
        <CardHeader
          sx={{ height: 10 }}
          title={header()}
          {...provided.dragHandleProps}
        />
        <Divider />
        <CardContent
          style={{
            flex: 1,
            paddingLeft: 0,
            paddingRight: 0,
            maxHeight: 'calc(100vh - 240px)',
            ...(dropSnapshot.isDraggingOver
              ? {
                backgroundColor: '#deebff',
              }
              : {
              })
          }}
        >
          <PerfectScrollbar
            style={{
              overflow: 'auto',
              paddingRight: '16px',
              paddingLeft: '16px'
            }}
          >
            <Stack
              direction="column"
              spacing={2}
            >
              {children}
            </Stack>
          </PerfectScrollbar>
        </CardContent>
        <CardActions>
          <Button onClick={() => setUpsertCard(true)} startIcon={<AddIcon/>}>Сделка</Button>
        </CardActions>
      </CustomizedCard>
      {upsertCard &&
        <KanbanEditCard
          currentStage={item}
          stages={columns}
          onSubmit={cardHandlers.handleSubmit}
          onCancelClick={cardHandlers.handleCancel}
        />}
      <ConfirmDialog
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title={"Удаление группы: " + item.USR$NAME}
        text="Вы уверены, что хотите продолжить?"
        onConfirm={() => onDelete(item)}
      />
    </Box>
  );
}

export default KanbanColumn;
