import style from './email-template.module.less';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Box, Button, Divider, IconButton, Tab, Tooltip, useTheme } from '@mui/material';
import { useEffect, useReducer, useRef, useState } from 'react';
import CustomizedScrollBox from '../Styled/customized-scroll-box/customized-scroll-box';
import { RegisterOptions, UseFormRegisterReturn, useForm } from 'react-hook-form';
import EmailTemplateEdit from './email-template-edit/email-template-edit';
import EmailTemplateItem from './email-template-item/email-template-item';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ComputerIcon from '@mui/icons-material/Computer';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import TabletIcon from '@mui/icons-material/Tablet';
import ColorEdit from '../Styled/colorEdit/colorEdit';
import ConfirmDialog from '../../confirm-dialog/confirm-dialog';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactHtmlParser from 'react-html-parser';

export type componentTypes = 'text' | 'image' | 'button' | 'divider'

export type IComponentPosition = 'start' | 'center' | 'end'

interface baseComponentSettings {
  width: {
    auto: boolean,
    value: number
  },
  margin: {
    top: number,
    right: number,
    bottom: number,
    left: number,
    common: boolean
  },
  position: IComponentPosition
}

export interface baseComponent extends baseComponentSettings {
  id: number,
  title: string,
  type: componentTypes,
}

export interface ITextComponent extends baseComponent {
  text?: string
}

export interface IImageComponent extends baseComponent {
  image?: string
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
  },
  padding?: {
    top?: number,
    right?: number,
    bottom?: number,
    left?: number,
    common?: boolean
  },
}

export interface IComponent extends ITextComponent, IImageComponent, IDeviderComponent, IButtonComponent {}

export interface EmailTemplate {
  [key: string]: IComponent
}

export interface ITemplate {
  content: IComponent[],
  background: string,
  html: string
}

interface EmailTemplateProps {
  value?: ITemplate,
  onChange: (value: ITemplate) => void,
  // defaultValues?: {
  //   text?: baseComponentSettings,
  //   image?: baseComponentSettings,
  //   button: baseComponentSettings & IButtonComponent,
  //   divider: baseComponentSettings
  // }
}

const EmailTemplate = (props: EmailTemplateProps) => {
  const theme = useTheme();
  const {
    value: anyTemplates = {
      content: [],
      html: '',
      background: 'white'
    },
    onChange
  } = props;

  const components: IComponent[] = [
    {
      id: 0,
      title: 'Текст',
      type: 'text',
      text: '<p style="margin:0px"><br></p>',
      width: {
        auto: true,
        value: 100
      },
      margin: {
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
        value: 50
      },
      margin: {
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
      margin: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
        common: true
      },
      padding: {
        top: 5,
        right: 6,
        bottom: 5,
        left: 6,
        common: false
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
      margin: {
        top: 10,
        right: 0,
        bottom: 10,
        left: 0,
        common: false
      },
      position: 'center'
    },
  ];

  const backgroundChange = (newBackground: string) => {
    onChange({ ...anyTemplates, background: newBackground });
  };
  const [length, setLenght] = useState<number>(0);
  useEffect(() => {
    if (anyTemplates.html === previeComponent) {
      return;
    }
    if (length !== anyTemplates.content.length) {
      setLenght(anyTemplates.content.length);
    }
    onChange({ ...anyTemplates, html: previeComponent });
  }, [anyTemplates]);

  const [lastId, setLastId] = useState(10);

  const valueChange = (stringIndex: string, newValue: any) => {
    const masIndex = stringIndex.split('.');
    const newValues: any = { ...anyTemplates };
    let val: any = newValues.content[Number(masIndex[0])];
    if (val === undefined) return;
    for (let i = 1; i < masIndex.length; i++) {
      if (i + 1 === masIndex.length) {
        if (!val) return;
        val[masIndex[i]] = newValue;
      }
      val = val?.[masIndex[i]];
    }
    onChange(newValues);
  };

  const handleEditUnFocus = () => {
    setEditIsFocus(false);
  };

  const [editIsFocus, setEditIsFocus] = useState<boolean>(false);

  const removeEl = (index: number) => {
    const copyTamplate = [...anyTemplates.content];
    closeEditForm();
    if (copyTamplate.length === 1) {
      onChange({ ...anyTemplates, content: [] });
    } else {
      copyTamplate.splice(index, 1);
      onChange({ ...anyTemplates, content: copyTamplate });
    }
  };

  const copyEl = (index: number) => {
    const component = [...anyTemplates.content][index];
    const endIndex = index + 1 || 0;
    const componentCopy = structuredClone(component);
    componentCopy.id = lastId;
    setLastId(lastId + 1);
    const copyTamplate = [...anyTemplates.content];
    copyTamplate.splice(endIndex, 0, componentCopy);
    copyTamplate[endIndex].text = copyTamplate[endIndex].text ? copyTamplate[endIndex].text + ' ' : undefined;
    onChange({ ...anyTemplates, content: copyTamplate, });
  };

  const handleDragEnd = (result: DropResult) => {
    setDraggedId(-1);
    // setAllowChangePrimary(true);
    if (!result.destination) return;
    if (result.source.droppableId === 'compotents') {
      if (result.destination.droppableId === 'tamplate') {
        const startIndex = result.source.index;
        const copyComponents = [...components];
        const component = { ...copyComponents[startIndex] };
        component.id = lastId;
        setLastId(lastId + 1);
        const copyTamplate = [...anyTemplates.content];
        if (copyTamplate.length === 0) {
          onChange({ ...anyTemplates, content: [component] });
        } else {
          const endIndex = result.destination.index;
          copyTamplate.splice(endIndex, 0, component);
          onChange({ ...anyTemplates, content: copyTamplate });
        }
      }
    }
    if (result.source.droppableId === 'tamplate') {
      if (result.destination.droppableId === 'compotents') return;
      const startIndex = result.source.index;
      const endIndex = result.destination.index;
      const copyTamplate = [...anyTemplates.content];
      const [reorderTodo] = copyTamplate.splice(startIndex, 1);
      copyTamplate.splice(endIndex, 0, reorderTodo);
      if (editedIndex === startIndex) {
        openEditForm(endIndex);
      }
      onChange({ ...anyTemplates, content: copyTamplate });
    }
  };

  const [editedIndex, setEditedIndex] = useState<number | null>(null);

  const openEditForm = (index: number) => {
    setEditIsFocus(true);
    setEditedIndex(index);
  };

  const handleOpenEditForm = (index: number) => () => {
    if (editedIndex === index) return;
    openEditForm(index);
  };

  const closeEditForm = () => {
    setEditIsFocus(false);
    setEditedIndex(null);
  };

  // useEffect(() => {
  //   const closeEvent = (e: KeyboardEvent) => {
  //     if (e.key === 'Escape') closeEditForm();
  //   };
  //   document.addEventListener('keydown', closeEvent);
  //   return () => {
  //     document.removeEventListener('keydown', closeEvent);
  //   };
  // }, []);

  useEffect(() => {
    const closeEvent = (e: any) => {
      setAllowChangePrimary(true);
    };
    document.addEventListener('mouseup', closeEvent);
    return () => {
      document.removeEventListener('mouseup', closeEvent);
    };
  }, []);

  const [tabIndex, setTabIndex] = useState('1');

  const handleTabsChange = (event: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const [drag, setDrag] = useState(true);

  const [previewMode, setPreviewmode] = useState('700px');

  const [primaryDrag, setPrimaryDrag] = useState('');
  const [allowChangePrimary, setAllowChangePrimary] = useState(true);
  const handleChangeAllowChangePrimary = (value: boolean) => () => {
    setAllowChangePrimary(value);
  };
  const handleChangePrimaryDrag = (value: string) => () => {
    if (!allowChangePrimary) return;
    setPrimaryDrag(value);
  };

  const handleDelete = (index: number) => {
    removeEl(index);
  };

  const [draggedId, setDraggedId] = useState<number>(-1);

  const getStyle = (style: any, snapshot: any, isDraggeble: boolean) => {
    if (!isDraggeble) return;
    if (!snapshot.isDropAnimating) {
      return style;
    }
    return {
      ...style,
      transitionDuration: '0.1s',
    };
  };


  const previeComponent = renderToStaticMarkup(
    <div style={{ height: '100%', maxWidth: '700px', width: '100%', background: anyTemplates.background, }}>
      {anyTemplates.content.map((component: IComponent, index: number) => (
        <EmailTemplateItem
          key={index}
          isPreview={true}
          component={component}
        />
      ))}
    </div>
  );

  const getHtml = () => previeComponent;

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        height: '100%',
        background: theme.palette.background.paper
      }}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <TabContext value={tabIndex} >
          <div style={{ width: '100%' }}>
            <div onMouseDown={handleEditUnFocus} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <TabList
                onChange={handleTabsChange}
                centered
                sx={{
                  position: 'relative'
                }}
              >
                <Tab
                  label="Редактирование"
                  value="1"
                />
                <Tab
                  label="Просмотр"
                  value="2"
                />

              </TabList>
              <div>
                {tabIndex === '2' && <>
                  <Tooltip title={'Компьютер'}>
                    <IconButton
                      style={{ marginRight: '5px' }}
                      color={previewMode === '700px' ? 'primary' : 'default'}
                      onClick={() => {
                        setPreviewmode('700px');
                      }}
                    >
                      <ComputerIcon/>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={'Планшет'}>
                    <IconButton
                      style={{ marginRight: '5px' }}
                      color={previewMode === '500px' ? 'primary' : 'default'}
                      onClick={() => {
                        setPreviewmode('500px');
                      }}
                    >
                      <TabletIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={'Телефон'}>
                    <IconButton
                      color={previewMode === '300px' ? 'primary' : 'default'}
                      onClick={() => {
                        setPreviewmode('300px');
                      }}
                    >
                      <PhoneAndroidIcon/>
                    </IconButton>
                  </Tooltip>
                </>}
              </div>
            </div>
            <Divider style={{ margin: 0 }} />
          </div>
          <div style={{ display: 'flex', height: 'calc(100% - 41.5px)', width: '100%', position: 'relative' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <TabPanel value="1" style={{ height: '100%', width: '100%', padding: '0' }} >
                <CustomizedScrollBox className={style.templateScrollBox} options={{ suppressScrollX: true }}>
                  <div style={{ width: '100%', maxWidth: '700px', transition: '0.5s' }}>
                    <Droppable droppableId="tamplate" >
                      {(droppableProvider) => (
                        <div
                          style={{ background: anyTemplates.background }}
                          className={style.templateBody}
                          ref={droppableProvider.innerRef}
                          {...droppableProvider.droppableProps}
                        >
                          {anyTemplates.content.map((component: IComponent, index: number) => (
                            <Draggable
                              index={index}
                              key={component.id}
                              draggableId={`${component.id}`}
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
                                      copy={copyEl}
                                      removeEl={handleDelete}
                                      setEditIsFocus={setEditIsFocus}
                                      editedIndex={editedIndex}
                                      index={index}
                                      editIsFocus={editIsFocus}
                                      component={component}
                                      setValue={valueChange}
                                      setDrag={(arg: boolean) => setDrag(arg)}
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
                  <div style={{ maxWidth: previewMode, width: '100%', transition: '0.5s' }}>
                    <CustomizedScrollBox options={{ suppressScrollX: true }}>
                      {ReactHtmlParser(previeComponent)}
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
                  ? <Box
                    sx={{
                      '& .jodit-workplace': {
                        background: anyTemplates.background + '!important'
                      }
                    }}
                    style={{ height: '100%' }}
                    onMouseDown={handleEditUnFocus}
                    >
                    <EmailTemplateEdit
                      copy={copyEl}
                      removeEl={removeEl}
                      editedIndex={editedIndex as number}
                      close={closeEditForm}
                      component={anyTemplates.content[editedIndex]}
                      setValue={valueChange}
                      length={length}
                    />
                  </Box>
                  : <Droppable droppableId="compotents" >
                    {(droppableProvider) => (
                      <div
                        className={style.componentBody}
                        ref={droppableProvider.innerRef}
                      >
                        {components.map((component: IComponent, index: number) => (
                          <Draggable
                            index={index}
                            draggableId={`${component.id}`}
                            key={component.id}
                          >
                            {(draggableProvider, snapshot) => {
                              const dragProps = (draggedId === component.id) || primaryDrag === `${component.id}` ? { ...draggableProvider.draggableProps } : {};
                              return (
                                <div
                                  onMouseDown={() => {
                                    setDraggedId(component.id);
                                    handleChangeAllowChangePrimary(false)();
                                  }}
                                  onMouseUp={handleChangeAllowChangePrimary(true)}
                                  onMouseEnter={handleChangePrimaryDrag(`${component.id}`)}
                                  style={{ width: '110px', height: '110px', margin: '5px', cursor: 'pointer' }}
                                >
                                  <div
                                    ref={draggableProvider.innerRef}
                                    {...dragProps}
                                    {...draggableProvider.dragHandleProps}
                                    style={getStyle(draggableProvider.draggableProps.style, snapshot, (draggedId === component.id) || primaryDrag === `${component.id}`)}
                                  >
                                    <Box
                                      sx={{
                                        userSelect: 'none',
                                        background: theme.palette.primary.main,
                                        color: theme.textColor,
                                        width: '110px',
                                        height: '110px',
                                        padding: '5px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: '20px'
                                      }}
                                    >
                                      {component.title}
                                    </Box>
                                  </div>

                                </div>

                              );
                            }}
                          </Draggable>
                        ))}
                        <ColorEdit
                          label={'цвет фона'}
                          sx={{ marginTop: '10px' }}
                          value={anyTemplates.background}
                          onChange={backgroundChange}
                        />
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
