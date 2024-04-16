import style from './email-template.module.less';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button, Divider, IconButton, TextField, useTheme } from '@mui/material';
import { useEffect, useReducer, useState } from 'react';
import CustomizedScrollBox from '../Styled/customized-scroll-box/customized-scroll-box';
import { useForm } from 'react-hook-form';
import { useOutsideClick } from '../../features/common/useOutsideClick';
import EmailTemplateEdit from './email-template-edit/email-template-edit';
import { extend } from 'dayjs';
import Draft from './draft/draft';
export interface EmailTemplateProps {
}

export type componentTypes = 'text' | 'image' | 'button' | 'divider'

export interface baseComponent {
  id: number,
  title: string,
  type: componentTypes,
  width: {
    auto: boolean,
    value: number
  },
  height?: {
    auto: boolean,
    value: number
  }
}

export interface ITextComponent extends baseComponent {
  font?: string,
  fontSize?: number,
  letterSpacing?: number
}

export interface IImageComponent extends baseComponent {
}

export interface IDeviderComponent extends baseComponent {
}

export interface IButtonComponent extends baseComponent {
}

export interface IComponent extends ITextComponent, IImageComponent, IDeviderComponent, IButtonComponent {}

const components: IComponent[] = [
  {
    id: 0,
    title: 'Текст',
    type: 'text',
    width: {
      auto: true,
      value: 100
    },
    font: 'auto',
    fontSize: 16,
    letterSpacing: 0
  },
  {
    id: 1,
    title: 'Картинка',
    type: 'image',
    width: {
      auto: true,
      value: 100
    },
    height: {
      auto: true,
      value: 100
    }
  },
  {
    id: 2,
    title: 'Кнопка',
    type: 'button',
    width: {
      auto: true,
      value: 100
    }
  },
  {
    id: 3,
    title: 'Резделитель',
    type: 'divider',
    width: {
      auto: true,
      value: 100
    }
  },
];

export interface EmailTemplate {
  [key: string]: IComponent
}

const EmailTemplate = () => {
  const [lastId, setLastId] = useState(10);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    reset,
    getValues,
    clearErrors,
    setError
  } = useForm<EmailTemplate>({
    mode: 'onSubmit'
  });
  const findComponent = (component: IComponent, index: number) => {
    console.log(component.id === lastId);
    switch (component.type) {
      case 'text':
        return (
          <div>
            <Draft isOpen={index === editedIndex} width={component.width.auto ? 'auto' : component.width.value + '%'}/>
          </div>
        );
      case 'image':
        return (<div style={{ background: 'blue' }}>Картинка</div>);
      case 'button':
        return <Button>Кнопка</Button>;
      case 'divider':
        return <div style={{ paddingTop: '5px', paddingBottom: '5px' }}><Divider /></div>;
      default: return <div />;
    }
  };

  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    if (result.source.droppableId === 'compotents') {
      if (result.destination.droppableId === 'tamplate') {
        const startIndex = result.source.index;
        const copyComponents = [...components];
        const component = { ...copyComponents[startIndex] };
        component.id = lastId;
        setLastId(lastId + 1);
        const copyTamplate = Object.values(getValues());
        if (copyTamplate.length === 0) {
          reset({ 0: component });
        } else {
          const endIndex = result.destination.index;
          copyTamplate.splice(endIndex, 0, component);
          const newTemplate: any = {};
          copyTamplate.forEach((el, index) => {
            newTemplate[`${index}`] = el;
          });
          reset(newTemplate);
        }
      }
    }
    if (result.source.droppableId === 'tamplate') {
      if (result.destination.droppableId === 'compotents') return;
      const startIndex = result.source.index;
      const endIndex = result.destination.index;
      const copyTamplate = Object.values(getValues());
      const [reorderTodo] = copyTamplate.splice(startIndex, 1);
      copyTamplate.splice(endIndex, 0, reorderTodo);
      const newTemplate: any = {};
      copyTamplate.forEach((el, index) => {
        newTemplate[`${index}`] = el;
      });
      if (editedIndex === startIndex) {
        setEditedIndex(endIndex);
      }
      reset(newTemplate);
    }
  };


  const theme = useTheme();

  const [editedIndex, setEditedIndex] = useState<number | null>(null);

  const openEditForm = (id: number) => () => {
    setEditedIndex(id);
  };


  const closeEditForm = () => {
    setEditedIndex(null);
  };

  useEffect((): any => {
    if (editedIndex || editedIndex === 0) {
      const closeEvent = (e: any) => {
        if (e.key === 'Escape')closeEditForm();
      };
      document.addEventListener('keydown', closeEvent);
      return () => {
        document.removeEventListener('keydown', closeEvent);
      };
    }
  }, [editedIndex]);

  // const [ref] = useOutsideClick(true, closeEditForm);

  return (
    <div style={{ width: '100%', overflow: 'hidden', height: '100%', display: 'flex', background: theme.palette.background.paper }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ width: '100%', background: theme.palette.background.paper, height: '100%' }}>
          <Droppable droppableId="tamplate" >
            {(droppableProvider) => (
              <div
                className={style.templateBody}
                ref={droppableProvider.innerRef}
                {...droppableProvider.droppableProps}
              >
                <CustomizedScrollBox className={style.templateScrollBox}>
                  {Object.values(getValues()).map((template: baseComponent, index: any) => (
                    <Draggable
                      index={index}
                      key={template.id}
                      draggableId={`${template.id}`}
                    >
                      {(draggableProvider) => (
                        <div
                          onMouseDown={openEditForm(index)}
                          ref={draggableProvider.innerRef}
                          {...draggableProvider.draggableProps}
                          {...draggableProvider.dragHandleProps}
                        >
                          <div style={{ border: index === editedIndex ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent', }}>
                            {findComponent(template, index)}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </CustomizedScrollBox>
                {droppableProvider.placeholder}
              </div>
            )}
          </Droppable>
        </div>
        <div
          style={{ width: '400px', height: '100%', background: theme.palette.background.paper,
            borderLeft: `1px solid ${theme.mainContent.borderColor}`, borderRadius: '20px 0 0 20px'
          }}
        >
          {editedIndex || editedIndex === 0
            ? <EmailTemplateEdit
              editedIndex={editedIndex as number}
              close={closeEditForm}
              getValues={getValues}
              setValue={setValue}
              register={register}
              forceUpdate={forceUpdate}
              />
            : <Droppable droppableId="compotents" >
              {(droppableProvider) => (
                <div
                  className={style.componentBody}
                  ref={droppableProvider.innerRef}
                >
                  {components.map((component: any, index: any) => (
                    <Draggable
                      index={index}
                      key={component.id}
                      draggableId={`${component.id}`}
                    >
                      {(draggableProvider) => {
                        return (
                          <div
                            className={style.component}
                            ref={draggableProvider.innerRef}
                            {...draggableProvider.draggableProps}
                            {...draggableProvider.dragHandleProps}
                          >
                            {component.title}
                          </div>
                        );
                      }}
                    </Draggable>
                  ))}
                </div>
              )}
            </Droppable>
          }
        </div>
      </DragDropContext>
    </div>
  );
};

export default EmailTemplate;
