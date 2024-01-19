import './kanban-column.module.less';
import React, { useCallback, useMemo, useState } from 'react';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import { Box, Button, CardActions, CardContent, Stack, IconButton, useTheme, Chip, TextField, Skeleton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';
import { DraggableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from '@hello-pangea/dnd';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import { ColorMode, IKanbanCard, IKanbanColumn, IKanbanTask, Permissions } from '@gsbelarus/util-api-types';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import CustomizedScrollBox from '../../Styled/customized-scroll-box/customized-scroll-box';

export interface KanbanColumnProps {
  provided?: DraggableProvided;
  dragSnapshot?: DraggableStateSnapshot;
  dropSnapshot?: DroppableStateSnapshot;
  columns: IKanbanColumn[];
  children: React.JSX.Element[];
  item: IKanbanColumn;
  isFetching: boolean,
  addIsFetching?: boolean,
  disabledAddDeal?: boolean;
  onEdit: (newColumn: IKanbanColumn) => void;
  onDelete?: (column: IKanbanColumn) => void;
  onEditCard?: (newColumn: IKanbanCard) => void;
  onDeleteCard?: (card: IKanbanCard) => void;
  onAddCard?: (card: IKanbanCard) => void;
}

export function KanbanColumn(props: KanbanColumnProps) {
  const { provided, dragSnapshot, dropSnapshot, isFetching, addIsFetching = false, disabledAddDeal = false } = props;
  const { children, item, columns } = props;
  const { onEdit, onDelete, onEditCard, onAddCard, onDeleteCard } = props;
  const theme = useTheme();
  const colorMode = useSelector((state: RootState) => state.settings.customization.colorMode);

  const [upsertCard, setUpsertCard] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  const cardHandlers = {
    handleSubmit: async (newCard: IKanbanCard, deleting: boolean) => {
      if (deleting) {
        onDeleteCard && onDeleteCard(newCard);
        setUpsertCard(false);
      };
      if (newCard.ID && !deleting) {
        onEditCard && onEditCard(newCard);
        setUpsertCard(false);
      } else {
        onAddCard && onAddCard(newCard);
        setUpsertCard(false);
      }
    },
    handleCancel: async (newCard: IKanbanCard) => {
      setUpsertCard(false);
    },
  };

  const handleConfirmOkClick = useCallback(() => {
    setConfirmOpen(false);
    onDelete && onDelete(item);
  }, [item]);

  const handleConfirmCancelClick = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const [editTitleText, setEditTitleText] = useState(false);
  const [titleText, setTitleText] = useState(item.USR$NAME);

  const header = () => {
    const handleEditColumn = () => {
      setEditTitleText(true);
    };

    const handleDeleteColumn = () => {
      setConfirmOpen(true);
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
          '& .title': {
            letterSpacing: '0.5px'
          },
          '&:hover .title': {
            opacity: 0.3,
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
              height={32}
            >
              {isFetching
                ? <Skeleton variant="text" width={'80%'} />
                : <Typography variant="subtitle1">{item.USR$NAME}</Typography>
              }
              <Box flex={1} />
              {isFetching ?
                <Skeleton
                  variant="circular"
                  width={'33px'}
                  height={'32px'}
                />
                :
                <Chip className="quantity" label={item.CARDS?.length} />
              }
            </Stack>
          }
        </Box>
        <div
          className="actions"
          hidden
        >
          <PermissionsGate actionAllowed={userPermissions?.stages?.PUT}>
            <IconButton size="small" onClick={handleEditColumn}>
              <EditIcon fontSize="small" />
            </IconButton >
          </PermissionsGate>
          <PermissionsGate actionAllowed={userPermissions?.stages?.DELETE}>
            <IconButton size="small" onClick={handleDeleteColumn}>
              <DeleteIcon fontSize="small" />
            </IconButton >
          </PermissionsGate>
        </div>
      </Stack>
    );
  };
  const memoAddCard = useMemo(() => {
    if (!upsertCard) return <></>;
    return (
      <KanbanEditCard
        open={upsertCard}
        currentStage={item}
        stages={columns}
        onSubmit={cardHandlers.handleSubmit}
        onCancelClick={cardHandlers.handleCancel}
      />
    );
  }, [upsertCard]);

  return (
    <Box
      style={{ display: 'flex', flex: 1, height: 'calc(100vh - 140px)', }}
      flexDirection={'column'}
    >
      <Box
        px={2}
        pb={1}
        {...provided?.dragHandleProps}
      >
        {header()}
      </Box>
      {isFetching
        ? <Skeleton
          variant="rectangular"
          height={'100%'}
          style={{ borderRadius: '12px' }}
        />
        : <>
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
              ...(dragSnapshot?.isDragging
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
                ...(dropSnapshot?.isDraggingOver
                  ? {
                    backgroundColor: theme.palette.background.paper,
                  }
                  : {
                  })
              }}
            >
              <CustomizedScrollBox
                withBlur
                backgroundColor={theme.palette.background.paper}
                style={{ paddingRight: '16px', paddingLeft: '16px' }}
              >
                <Stack
                  direction="column"
                  spacing={2}
                >
                  {children}
                </Stack>
              </CustomizedScrollBox>
            </CardContent>
            <CardActions>
              <PermissionsGate actionAllowed={userPermissions?.deals.POST}>
                {!disabledAddDeal && item.USR$INDEX === 0 &&
                <Button
                  disabled={addIsFetching}
                  onClick={() => setUpsertCard(true)}
                  startIcon={<AddIcon/>}
                  color="primary"
                >Сделка</Button>
                }
              </PermissionsGate>
            </CardActions>
          </CustomizedCard>
          {memoAddCard}
        </>
      }
      <ConfirmDialog
        open={confirmOpen}
        title={'Удаление этапа'}
        text={`Этап **${item.USR$NAME}** будет удалён.<br>
          Вы уверены, что хотите продолжить?`}
        dangerous={true}
        confirmClick={handleConfirmOkClick}
        cancelClick={handleConfirmCancelClick}
      />
    </Box>
  );
}

export default KanbanColumn;
