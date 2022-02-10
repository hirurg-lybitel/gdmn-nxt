import './kanban-column.module.less';
import { useDrag, useDrop} from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useEffect, useRef, useState } from 'react';
import MainCard from '../../main-card/main-card';
import { Box, Button, CardActions, CardContent, CardHeader, Divider, Stack, Typography, TextField, Input, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ICard, IColumn } from '../../../pages/Dashboard/deals/deals';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';

/* eslint-disable-next-line */
export interface KanbanColumnProps {
  columns: IColumn[];
  children: JSX.Element[];
  item: IColumn;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (newColumn: IColumn) => void;
  onDelete: (column: IColumn) => void;
  onAddCard: (card: ICard) => void;
}

interface IItem {
  id: number;
  index: number;
}

export function KanbanColumn(props: KanbanColumnProps) {
  const { children, item, index: ind, columns } = props;
  const { moveCard, onEdit, onDelete, onAddCard} = props;

  const [index, setIndex] = useState(ind);

  const [upsertCard, setUpsertCard] = useState(false);


  const [{ canDrop, isOver, isDid }, dropRef] = useDrop(() => ({
    //accept: ['toDo', 'doing', 'done', 'error'].filter(el => el !== item.id),
    accept: ['card', 'group2'],
    hover: (it: IItem, monitor) => {
      if (it.index === index || item.id === monitor.getItem().id) return;
      console.log('group_hover', item, index, it, monitor.getItem());

      //moveCard(monitor.getItem().index, index,  );

      //monitor.getItem().index = index;
      //setIndex(it.index)


      //moveCard(monitor.getItem().index, index);

      // console.log('mutable_index_before', monitor.getItem().index);
      //if (index > monitor.getItem().index ) return;
      //monitor.getItem().index = index;
      // console.log('mutable_index_after', monitor.getItem().index);
    },
    drop: (it, monitor) => {
      console.log('group_drop_end', item, index, it.index, monitor.getItem());

      //moveCard((monitor.getItem() as {index: number}).index, index);
      //monitor.getItem().index = index;
      //moveCard(monitor.getItem().index, index);
      return monitor.getItem();
    },
    collect: (monitor) => ({
      isDid: monitor.didDrop(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  const [{ opacity }, dragRef] = useDrag(() => ({
    type: 'group',
    item: {
      id: item.id,
      index: index
    },
    end: (it, monitor) => {
      if (!monitor.didDrop()) return;

      console.log('group_end', item, index, it.index, monitor.getItem(), monitor.getDropResult());

      //moveCard(index, (monitor.getItem() as {index: number}).index);

    },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
      canDrop: monitor.canDrag(),
      isOver: monitor.didDrop
    })
  }), []
  );

  function attachRef(el: any) {
    dragRef(el)
    dropRef(el)
  }

  const cardHandlers = {
    handleSubmit: async (card: ICard, deleting: boolean) => {
      console.log('handleSubmitCard', card, deleting);

      if (deleting) {
        return;
      };

      if (card.id > 0) {
        return;
      };

      onAddCard(card);

      setUpsertCard(false);
    },
    handleCancel: async () => setUpsertCard(false),
  };

  const [editTitleHidden, setEditTitleHidden] = useState(true);
  const [editTitleText, setEditTitleText] = useState(false);
  const [titleText, setTitleText] = useState(item.title);

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
        onEdit({...item, title: titleText});
        setEditTitleText(false);
        return;
      }

      if (event.keyCode === 27 ) {
        setTitleText(item.title);
        setEditTitleText(false);
        return;
      }
    };

    const onBlur = (e: any) => {
      //editTitleText && setEditTitleText(false);
      console.log('onBlur', e, item);
    };

    return(
      <Stack
        direction="row"
        onMouseEnter={handleTitleOnMouseEnter}
        onMouseLeave={handleTitleOnMouseLeave}
        onKeyPress={handleTitleKeyPress}
        onKeyDown={handleTitleKeyPress}
        onBlur={(e) => onBlur(e)}
        position="relative"
      >
        {editTitleText
          ? <Input
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}

              autoFocus
            />
          : <Typography
              variant="h4"
              align="center"
              flex={1}
              style={{
                opacity: `${editTitleHidden ? 1 : 0.3}`
              }}
            > {item.title}</Typography>
          }
        <div
          style={{
            position: 'absolute',
            right: 0,
            height: '100%',
            display: `${editTitleHidden ? 'none' : 'inline'}`
          }}
        >
          <IconButton size="small" onClick={() => handleEditTitle()}>
            <EditIcon fontSize="small" />
          </IconButton >
          <IconButton size="small" onClick={() => onDelete(item)}>
            <DeleteIcon fontSize="small" />
          </IconButton >
        </div>
      </Stack>

    )
  }

  return (
    <div
      ref={attachRef}
    >
      <MainCard
        border
        boxShadow
        //ref={dragRef}
        style={{
          opacity,
          width: 200,
          height: '830px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* <input type="text" size={40}/> */}
        <CardHeader
          sx={{ height: 10 }}
          title={header()}
        />
        <Divider />
        <CardContent style={{ flex: 1}}>
        <Box
          overflow="auto"
          flex={1}
          display="flex"
          height='100%'
        >
          <Stack
            direction="column"
            spacing={2}
            flex={1}
          >
            {children}
          </Stack>
        </Box>
        </CardContent>
        <CardActions>
          <Button onClick={() => setUpsertCard(true)} startIcon={<AddIcon/>}>Сделка</Button>
        </CardActions>
      </MainCard>
      {upsertCard &&
        <KanbanEditCard
          currentStage={item}
          stages={columns}
          onSubmit={cardHandlers.handleSubmit}
          onCancelClick={cardHandlers.handleCancel}
        />}
    </div>
  );
}

export default KanbanColumn;
