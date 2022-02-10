import './kanban-column.module.less';
import { useDrag, useDrop} from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useEffect, useRef } from 'react';
import MainCard from '../../main-card/main-card';
import { Box, Button, CardActions, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { IColumn } from '../../../pages/Dashboard/deals/deals';

/* eslint-disable-next-line */
export interface KanbanColumnProps {
  children: JSX.Element[],
  item: IColumn;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

interface IItem {
  id: number;
  index: number;
}

export function KanbanColumn(props: KanbanColumnProps) {
  const { children, item, index, moveCard } = props;

  const myRef = useRef(null);


  const [{ canDrop, isOver, isDid }, dropRef] = useDrop(() => ({
    //accept: ['toDo', 'doing', 'done', 'error'].filter(el => el !== item.id),
    accept: ['card', 'group'],
    hover: (it: IItem, monitor) => {
      //if (it.index === index ) return;
      console.log('group_hover', item, index, it, monitor.getItem());

      moveCard(monitor.getItem().index, index);

      // console.log('mutable_index_before', monitor.getItem().index);
      //if (index > monitor.getItem().index ) return;
      monitor.getItem().index = index;
      // console.log('mutable_index_after', monitor.getItem().index);
    },
    drop: (it, monitor) => {
      console.log('group_drop_end', item, index, it.index, monitor.getItem());

      //moveCard((monitor.getItem() as {index: number}).index, index);
      //monitor.getItem().index = index;
      return monitor.getItem();
    },
    collect: (monitor) => ({
      isDid: monitor.didDrop(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  //console.log('isOver', isOver);
  //console.log('isDid', isDid);



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

  return (
    <div
      ref={dropRef}
    >
      <MainCard
        border
        boxShadow
        ref={dragRef}
        style={{
          opacity,
          width: 200,
          height: '830px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <CardHeader
          sx={{ height: 10 }}
          title={<Typography variant="h4" align="center"> {item.title}</Typography>}
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
          <Button startIcon={<AddIcon/>}>Сделка</Button>
        </CardActions>
      </MainCard>
    </div>
  );
}

export default KanbanColumn;
