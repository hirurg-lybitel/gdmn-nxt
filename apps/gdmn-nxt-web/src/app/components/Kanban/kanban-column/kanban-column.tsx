import './kanban-column.module.less';
import { useCallback, useMemo, useState } from 'react';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import { Box, Button, CardActions, CardContent, CardHeader, Divider, Stack, Typography, Input, IconButton, useTheme, Chip, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';
import { DraggableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from 'react-beautiful-dnd';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { IKanbanCard, IKanbanColumn } from '@gsbelarus/util-api-types';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';


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
  const { onEdit, onDelete, onAddCard } = props;

  const theme = useTheme();

  const [upsertCard, setUpsertCard] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const cardHandlers = {
    handleSubmit: async (card: IKanbanCard, deleting: boolean) => {
      if (deleting) {
        return;
      };

      if (card.ID) {
        return;
      };

      onAddCard(card);

      setUpsertCard(false);
    },
    handleCancel: async () => setUpsertCard(false),
    handleClose: async (e: any, reason: string) => {
      if (reason === 'backdropClick') setUpsertCard(false);
    },
  };

  const handleConfirmOkClick = useCallback(() => {
    setConfirmOpen(false);
    onDelete(item);
  }, [item]);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const [editTitleText, setEditTitleText] = useState(false);
  const [titleText, setTitleText] = useState(item.USR$NAME);

  const header = () => {
    const handleEditTitle = () => {
      setEditTitleText(true);
    };

    const handleTitleKeyPress = (event: any) => {
      if (event.keyCode === 13) {
        onEdit({ ...item, USR$NAME: titleText });
        setEditTitleText(false);
        return;
      }

      if (event.keyCode === 27) {
        setTitleText(item.USR$NAME);
        setEditTitleText(false);
        return;
      }
    };

    const onBlur = (e: any) => {
      setTitleText(item.USR$NAME);
      setEditTitleText(false);
    };

    return (
      <Stack
        direction="row"
        onKeyPress={handleTitleKeyPress}
        onKeyDown={handleTitleKeyPress}
        // maxWidth="200px"
        sx={{
          '&:hover .title': {
            opacity: 0.3
          },
          '&:hover .actions': {
            display: 'inline',
            alignSelf: 'center'
          },
          '&:hover .quantity': {
            display: 'none'
          }
        }}
      >
        <Box
          style={{
            flex: 1,
            padding: 3,
            textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}
        >
          {editTitleText
            // ? <Input
            //   value={titleText}
            //   onChange={(e) => setTitleText(e.target.value)}
            //   // onBlur={(e) => onBlur(e)}
            //   autoFocus
            // />
            ? <TextField
              value={titleText}
              variant="standard"
              onChange={(e) => setTitleText(e.target.value)}
              onBlur={(e) => onBlur(e)}
              autoFocus
              fullWidth
            />
            : <Stack
              className="title"
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <TextField
                value={item.USR$NAME}
                variant="standard"
                fullWidth
                sx={{
                  '& .MuiInputBase-input': {
                    textOverflow: 'ellipsis',
                  }
                }}
                InputProps={{
                  disableUnderline: true,
                  readOnly: true,
                  style: { ...theme.typography.h4 },
                }}

              />
              {/* <Typography
                variant="h4"
                noWrap
                // className="title"
                // textAlign={'center'}
                // justifyContent={'center'}
              >
                {`${item.USR$NAME}`}
              </Typography> */}
              <Box flex={1} />
              <Chip className="quantity" label={item.CARDS.length} />
            </Stack>
          }
        </Box>
        <div
          className="actions"
          hidden
        >
          <IconButton size="small" onClick={() => handleEditTitle()}>
            <EditIcon fontSize="small" />
          </IconButton >
          <IconButton size="small" onClick={() => setConfirmOpen(true)}>
            <DeleteIcon fontSize="small" />
          </IconButton >
        </div>
      </Stack>
    );
  };

  const memoAddCard = useMemo(() => {
    return <KanbanEditCard
      open={upsertCard}
      currentStage={item}
      stages={columns}
      onSubmit={cardHandlers.handleSubmit}
      onCancelClick={cardHandlers.handleCancel}
      onClose={cardHandlers.handleClose}
    />;
  }, [upsertCard]);

  return (
    <Box
      style={{ display: 'flex', flex: 1, height: 'calc(100vh - 255px)', }}
      flexDirection={'column'}
    >
      <Box px={2} pb={1} {...provided.dragHandleProps}>
        {header()}
      </Box>
      <CustomizedCard
        // borders
        style={{
          // minWidth: '250px',
          // maxWidth: '400px',
          width: '350px',
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          // height: 'calc(100vh - 420px)',
          backgroundColor: theme.palette.mode === 'dark' ? '' : 'rgb(229, 231, 235)',
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
        {/* <CardHeader
          sx={{ height: 10 }}
          title={header()}
          {...provided.dragHandleProps}
        /> */}
        {/* <Divider /> */}
        <CardContent
          style={{
            flex: 1,
            paddingLeft: 0,
            paddingRight: 0,
            height: 'calc(100vh - 420px)',
            ...(dropSnapshot.isDraggingOver
              ? {
                backgroundColor: theme.palette.mode === 'dark' ? '#616161' : '#deebff',
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
          <PermissionsGate actionCode={1}>
            {item.USR$INDEX === 0
              ? <Button onClick={() => setUpsertCard(true)} startIcon={<AddIcon/>} color="primary">Сделка</Button>
              : <></>}
          </PermissionsGate>
        </CardActions>
      </CustomizedCard>
      {memoAddCard}
      <ConfirmDialog
        open={confirmOpen}
        title={'Удаление группы: ' + item.USR$NAME}
        text="Вы уверены, что хотите продолжить?"
        dangerous={true}
        confirmClick={handleConfirmOkClick}
        cancelClick={handleConfirmCancelClick}
      />
    </Box>
  );
}

export default KanbanColumn;
