import style from './email-template.module.less';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Button, Divider, IconButton, Tab, TextField, useTheme } from '@mui/material';
import { useEffect, useReducer, useState } from 'react';
import CustomizedScrollBox from '../Styled/customized-scroll-box/customized-scroll-box';
import { RegisterOptions, UseFormRegisterReturn, useForm } from 'react-hook-form';
import EmailTemplateEdit from './email-template-edit/email-template-edit';
import { extend } from 'dayjs';
import Draft from './draft/draft';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import EmailTemplateItem, { findComponent } from './email-template-item/email-template-item';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ComputerIcon from '@mui/icons-material/Computer';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
export interface EmailTemplateProps {
}

export type componentTypes = 'text' | 'image' | 'button' | 'divider'

export type IComponentPosition = 'start' | 'center' | 'end'

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
  },
  padding: {
    top: number,
    right: number,
    bottom: number,
    left: number,
    common: boolean
  },
  position: IComponentPosition
}

export interface ITextComponent extends baseComponent {
  text?: string
}

export interface IImageComponent extends baseComponent {
  image?: any
}

export interface IDeviderComponent extends baseComponent {
}

export interface IButtonComponent extends baseComponent {
  text?: string,
  url?: string,
  color?: {
    text?: string,
    button?: string,
  },
  font?: {
    size?: number,
    value: string
  }
}

export interface IComponent extends ITextComponent, IImageComponent, IDeviderComponent, IButtonComponent {}

export interface EmailTemplate {
  [key: string]: IComponent
}

const EmailTemplate = () => {
  const theme = useTheme();

  const components: IComponent[] = [
    {
      id: 0,
      title: 'Текст',
      type: 'text',
      width: {
        auto: true,
        value: 100
      },
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
        common: true
      },
      position: 'center'
    },
    {
      id: 1,
      title: 'Картинка',
      type: 'image',
      width: {
        auto: false,
        value: 100
      },
      height: {
        auto: true,
        value: 100
      },
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
        common: true
      },
      position: 'center'
    },
    {
      id: 2,
      title: 'Кнопка',
      type: 'button',
      width: {
        auto: true,
        value: 100
      },
      height: {
        auto: true,
        value: 100
      },
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
        common: true
      },
      position: 'center',
      text: 'Текст кнопки',
      color: {
        text: '#ffffff',
        button: theme.palette.primary.main
      },
      font: {
        size: 14,
        value: 'Arial'
      }
    },
    {
      id: 3,
      title: 'Резделитель',
      type: 'divider',
      width: {
        auto: false,
        value: 100
      },
      padding: {
        top: 10,
        right: 0,
        bottom: 10,
        left: 0,
        common: false
      },
      position: 'center'
    },
  ];

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
    mode: 'all'
  });

  const customRegister = (name: any, options?: RegisterOptions<EmailTemplate, any> | undefined): UseFormRegisterReturn<any> => {
    return Object.assign(register(name, options), { onChange: (e: any) => {
      setValue(name, e.target.value);
      forceUpdate();
    } });
  };

  const handleEditUnFocus = () => {
    setEditIsFocus(false);
  };

  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const [editIsFocus, setEditIsFocus] = useState<boolean>(false);

  const removeEl = (index: number) => {
    const copyTamplate = Object.values(getValues());
    closeEditForm();
    if (copyTamplate.length === 1) {
      reset({});
      reset({});
    } else {
      copyTamplate.splice(index, 1);
      const newTemplate: any = {};
      copyTamplate.forEach((el, index) => {
        newTemplate[`${index}`] = el;
      });
      reset(newTemplate);
    }
  };

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
        openEditForm(endIndex);
      }
      reset(newTemplate);
    }
  };


  const [editedIndex, setEditedIndex] = useState<number | null>(null);

  const openEditForm = (index: number) => {
    setEditIsFocus(true);
    setEditedIndex(index);
  };

  const handleOpenEditForm = (index: number) => () => openEditForm(index);

  const closeEditForm = () => {
    setEditIsFocus(false);
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

  const [tabIndex, setTabIndex] = useState('2');

  const handleTabsChange = (event: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const [drag, setDrag] = useState(true);

  const [isPc, setIsPc] = useState(true);

  const settings = useSelector((state: RootState) => state.settings);

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        height: '100%',
        background: settings.customization.colorMode === 'light' ? 'gray' : theme.palette.background.paper
      }}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <TabContext value={tabIndex}>
          <div>
            <TabList onChange={handleTabsChange} centered>
              <Tab
                label="Редактирование"
                value="1"
              />
              <Tab
                label="Просмотр"
                value="2"
              />
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <IconButton
                  style={{ marginRight: '5px' }}
                  color={isPc ? 'primary' : 'default'}
                  onClick={() => {
                    setIsPc(true);
                  }}
                >
                  <ComputerIcon/>
                </IconButton>
                <IconButton
                  color={!isPc ? 'primary' : 'default'}
                  onClick={() => {
                    setIsPc(false);
                  }}
                >
                  <PhoneAndroidIcon/>
                </IconButton>
              </div>
            </TabList>
            <Divider style={{ margin: 0 }} />
          </div>
          <div style={{ display: 'flex', height: 'calc(100% - 41.5px)', width: '100%' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <TabPanel value="1" style={{ height: '100%', width: '100%', padding: '0' }} >
                <CustomizedScrollBox className={style.templateScrollBox} options={{ suppressScrollX: true }}>
                  <div style={{ width: isPc ? '700px' : '340px', background: 'white' }}>
                    <Droppable droppableId="tamplate" >
                      {(droppableProvider) => (
                        <div
                          className={style.templateBody}
                          ref={droppableProvider.innerRef}
                          {...droppableProvider.droppableProps}
                        >

                          {Object.values(getValues()).map((template: IComponent, index: number) => (
                            <Draggable
                              index={index}
                              key={template.id}
                              draggableId={`${template.id}`}
                            >
                              {(draggableProvider) => {
                                const dragProps = drag ? { ...draggableProvider.draggableProps } : {};
                                return (
                                  <div
                                    onMouseDown={handleOpenEditForm(index)}
                                    ref={draggableProvider.innerRef}
                                    {...dragProps}
                                    {...draggableProvider.dragHandleProps}
                                  >
                                    <EmailTemplateItem
                                      editUnFocus={handleEditUnFocus}
                                      editedIndex={editedIndex}
                                      index={index}
                                      editIsFocus={editIsFocus}
                                      getValues={getValues}
                                      setValue={setValue}
                                      setDrag={(arg: boolean) => {
                                        setDrag(arg);
                                      }}
                                      drag={drag}
                                    />
                                  </div>
                                );
                              }}
                            </Draggable>
                          ))}

                          {droppableProvider.placeholder}
                        </div>
                      )}
                    </Droppable>

                  </div>
                </CustomizedScrollBox>
              </TabPanel>
              <TabPanel value="2" style={{ height: '100%', width: '100%', padding: '0' }} >
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: isPc ? '700px' : '340px', height: '100%', background: 'white' }}>
                    <CustomizedScrollBox options={{ suppressScrollX: true }}>
                      {Object.values(getValues()).map((template: IComponent, index: number) => (
                        <EmailTemplateItem
                          key={index}
                          isPreview={true}
                          template={template}
                        />
                      ))}
                    </CustomizedScrollBox>
                  </div>
                </div>
              </TabPanel>
            </div>
            <div
              style={{ width: tabIndex === '2' ? '0px' : '300px', height: '100%', transition: '0.5s', zIndex: 1 }}
            >
              <div
                style={{ width: '300px',
                  height: '100%',
                  borderLeft: `1px solid ${theme.mainContent.borderColor}`, borderRadius: '20px 0 0 20px',
                  background: theme.palette.background.paper,
                }}
              >
                {editedIndex || editedIndex === 0
                  ? <div style={{ height: '100%' }} onMouseDown={handleEditUnFocus}>
                    <EmailTemplateEdit
                      changeIsFocus={setEditIsFocus}
                      removeEl={removeEl}
                      editedIndex={editedIndex as number}
                      close={closeEditForm}
                      getValues={getValues}
                      setValue={setValue}
                      register={customRegister}
                      forceUpdate={forceUpdate}
                    />
                  </div>
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
                                  ref={draggableProvider.innerRef}
                                  {...draggableProvider.draggableProps}
                                  {...draggableProvider.dragHandleProps}
                                >
                                  <Box
                                    sx={{
                                      background: theme.palette.primary.main,
                                      color: theme.textColor,
                                      width: '110px',
                                      height: '110px',
                                      padding: '5px',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      margin: '5px',
                                      '& :hover': {
                                        filter: 'brightness(70%)'
                                      },
                                      borderRadius: '20px'
                                    }}
                                  >
                                    {component.title}
                                  </Box>
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
            </div>
          </div>
        </TabContext>
      </DragDropContext>
    </div>
  );
};

export default EmailTemplate;
