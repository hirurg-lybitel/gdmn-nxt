import style from './email-template.module.less';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button, Divider, TextField } from '@mui/material';

import { useEffect, useState } from 'react';

export interface EmailTemplateProps {
}


const components: any[] = [
  {
    id: 0,
    title: 'Тест',
    component: null,
    completed: false,
  },
  {
    id: 1,
    title: 'Картинка',
    component: null,
    completed: false,
  },
  {
    id: 2,
    title: 'Кнопка',
    component: null,
    completed: true,
  },
  {
    id: 3,
    title: 'Резделитель',
    component: null,
    completed: true,
  },
];

const EmailTemplate = () => {
  const [templates, setTemplates] = useState<any>([]);
  const [lastId, setLastId] = useState(10);
  console.log(templates);
  console.log(components);

  const findeComponent = (id: number) => {
    switch (id) {
      case 0:
        return <TextField multiline/>;
      case 1:
        return (<div style={{ background: 'blue' }}>Картинка</div>);
      case 2:
        return <Button>Кнопка</Button>;
      case 3:
        return <div style={{ paddingTop: '5px', paddingBottom: '5px' }}><Divider /></div>;
      default: return (<div>nope</div>);
    }
  };

  const handleDragEnd = (result: any) => {
    console.log(result);
    if (!result.destination) return;
    if (result.source.droppableId === 'compotents') {
      if (result.destination.droppableId === 'tamplate') {
        const startIndex = result.source.index;
        const copyComponents = [...components];
        const component = { ...copyComponents[startIndex] };
        component.component = findeComponent(component.id);
        component.id = lastId;
        console.log(component);
        setLastId(lastId + 1);
        const copyTamplate = [...templates];
        if (copyTamplate.length === 0) {
          setTemplates([component]);
        } else {
          const startIndex = result.source.index;
          const endIndex = result.destination.index;
          const copyTamplate = [...templates];
          copyTamplate.splice(endIndex, 0, component);
          setTemplates(copyTamplate);
        }
      }
    }
    if (result.source.droppableId === 'tamplate') {
      if (result.destination.droppableId === 'compotents') return;
      const startIndex = result.source.index;
      const endIndex = result.destination.index;
      const copyTamplate = [...templates];
      const [reorderTodo] = copyTamplate.splice(startIndex, 1);
      copyTamplate.splice(endIndex, 0, reorderTodo);
      setTemplates(copyTamplate);
    }
  };

  return (
    <div style={{ width: '100%', overflow: 'hidden', height: '100%', display: 'flex' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ width: '100%', background: 'green', height: '100%' }}>
          <Droppable droppableId="tamplate" >
            {(droppableProvider) => (
              <div
                style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', background: 'gray' }}
                ref={droppableProvider.innerRef}
                {...droppableProvider.droppableProps}
              >
                {templates.map((todo: any, index: any) => (
                  <Draggable
                    index={index}
                    key={todo.id}
                    draggableId={`${todo.id}`}
                  >
                    {(draggableProvider) => (
                      <div
                        className={style.template}
                        ref={draggableProvider.innerRef}
                        {...draggableProvider.draggableProps}
                        {...draggableProvider.dragHandleProps}
                      >
                        {todo.component}
                      </div>
                    )}
                  </Draggable>
                ))}
                {droppableProvider.placeholder}
              </div>
            )}
          </Droppable>
        </div>
        <div style={{ width: '400px', height: '100%', background: 'red' }}>
          <Droppable droppableId="compotents" >
            {(droppableProvider) => (
              <div
                className={style.componentBody}
                ref={droppableProvider.innerRef}
              >
                {components.map((todo: any, index: any) => (
                  <Draggable
                    index={index}
                    key={todo.id}
                    draggableId={`${todo.id}`}
                  >
                    {(draggableProvider) => {
                      console.log(draggableProvider);
                      return (
                        <div
                          className={style.component}
                          ref={draggableProvider.innerRef}
                          {...draggableProvider.draggableProps}
                          {...draggableProvider.dragHandleProps}
                        >
                          {todo.title}
                        </div>
                      );
                    }}
                  </Draggable>
                ))}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
};

export default EmailTemplate;
