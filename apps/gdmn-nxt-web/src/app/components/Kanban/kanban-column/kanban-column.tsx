import './kanban-column.module.less';
import { useCallback, useMemo, useState } from 'react';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import { Box, Button, CardActions, CardContent, Stack, IconButton, useTheme, Chip, TextField, Skeleton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';
import { DraggableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from '@hello-pangea/dnd';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { ColorMode, IKanbanCard, IKanbanColumn, IPermissionByUser } from '@gsbelarus/util-api-types';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import { Action } from '../../../features/permissions';


export interface KanbanColumnProps {
  provided: DraggableProvided;
  dragSnapshot: DraggableStateSnapshot;
  dropSnapshot: DroppableStateSnapshot;
  columns: IKanbanColumn[];
  children: JSX.Element[];
  item: IKanbanColumn;
  isFetching: boolean,
  onEdit: (newColumn: IKanbanColumn) => void;
  onDelete: (column: IKanbanColumn) => void;
  onAddCard: (card: IKanbanCard) => void;
}

export function KanbanColumn(props: KanbanColumnProps) {
  const { provided, dragSnapshot, dropSnapshot, isFetching } = props;
  const { children, item, columns } = props;
  const { onEdit, onDelete, onAddCard } = props;

  const theme = useTheme();
  const colorMode = useSelector((state: RootState) => state.settings.customization.mode);

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
            ? <>
              {isFetching ? <Skeleton variant="text" />
                :
                <TextField
                  value={titleText}
                  variant="standard"
                  onChange={(e) => setTitleText(e.target.value)}
                  onBlur={(e) => onBlur(e)}
                  autoFocus
                  fullWidth
                />
              }
            </>
            :
            <Stack
              className="title"
              direction="row"
              alignItems="center"
              spacing={1}
            >
              {isFetching ? <Skeleton variant="text" width={'80%'} /> :
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
              }
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
              {isFetching ?
                <Skeleton variant="circular" width={'33px'} height={'32px'}/>
                :
                <Chip className="quantity" label={item.CARDS.length} />
              }
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
    return (
      <KanbanEditCard
        open={upsertCard}
        currentStage={item}
        stages={columns}
        onSubmit={cardHandlers.handleSubmit}
        onCancelClick={cardHandlers.handleCancel}
        onClose={cardHandlers.handleClose}
      />
    );
  }, [upsertCard]);

  return (
    <Box
      style={{ display: 'flex', flex: 1, height: 'calc(100vh - 255px)', }}
      flexDirection={'column'}
    >
      <Box px={2} pb={1} {...provided.dragHandleProps}>
        {header()}
      </Box>
      {isFetching ? <Skeleton variant="rectangular" height={'100%'} style={{ borderRadius: '12px 12px 12px 12px' }}/> :
        <>
          <CustomizedCard
            borders={colorMode === ColorMode.Light}
            style={{
              // minWidth: '250px',
              // maxWidth: '400px',
              width: '350px',
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              // height: 'calc(100vh - 420px)',
              backgroundColor: theme.palette.background.paper,
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
            <CardContent
              style={{
                flex: 1,
                paddingLeft: 0,
                paddingRight: 0,
                height: 'calc(100vh - 420px)',
                ...(dropSnapshot.isDraggingOver
                  ? {
                    backgroundColor: theme.palette.background.paper,
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
              <PermissionsGate actionCode={Action.CreateDeal}>
                {item.USR$INDEX === 0 &&
                <Button onClick={() => setUpsertCard(true)} startIcon={<AddIcon/>} color="primary">Сделка</Button>
                }
              </PermissionsGate>
            </CardActions>
          </CustomizedCard>
          {memoAddCard}
        </>
      }
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
