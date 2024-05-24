import style from './email-template.module.less';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Box, Divider, FormControlLabel, IconButton, Switch, Tab, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import CustomizedScrollBox from '../Styled/customized-scroll-box/customized-scroll-box';
import EmailTemplateEdit from './email-template-edit/email-template-edit';
import EmailTemplateItem from './email-template-item/email-template-item';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ComputerIcon from '@mui/icons-material/Computer';
import TabletIcon from '@mui/icons-material/Tablet';
import ColorEdit from '../Styled/colorEdit/colorEdit';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactHtmlParser from 'react-html-parser';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ImageIcon from '@mui/icons-material/Image';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import CloseIcon from '@mui/icons-material/Close';
import { emailTemplateButtonName, emailTemplateDividerName, emailTemplateImageName, emailTemplateTextName } from './html-to-object';

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
    isCommon: boolean,
    common: number
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
    textAuto?: boolean,
    button?: string,
  },
  font?: {
    size?: number,
    value: string
  },
  padding?: {
    top: number,
    right: number,
    bottom: number,
    left: number,
    isCommon: boolean,
    common: number
  },
}

export interface IComponent extends ITextComponent, IImageComponent, IDeviderComponent, IButtonComponent {}

export interface EmailTemplate {
  [key: string]: IComponent
}

export interface ITemplateEdit {
  content: {
    components: IComponent[],
    background: {
      value: string,
      isView: boolean
    }
  },
  html: string
}

interface EmailTemplateProps {
  value?: ITemplateEdit,
  onChange: (value: ITemplateEdit) => void,
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
      content: {
        components: [],
        background: {
          value: theme.palette.background.paper,
          isView: false
        }
      },
      html: '',
    },
    onChange
  } = props;

  const settings = useSelector((state: RootState) => state.settings);

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
        isCommon: true,
        common: 10
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
        isCommon: true,
        common: 10
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
        isCommon: true,
        common: 10
      },
      padding: {
        top: 5,
        right: 6,
        bottom: 5,
        left: 6,
        common: 10,
        isCommon: false
      },
      position: 'center',
      text: 'Текст кнопки',
      color: {
        text: theme.textColor,
        textAuto: true,
        button: theme.mainContent.buttonPrimaryColor,
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
        common: 10,
        isCommon: false
      },
      position: 'center'
    },
  ];

  const backgroundChange = (newBackground: string) => {
    onChange({ ...anyTemplates, content: { ...anyTemplates.content, background: { ...anyTemplates.content.background, value: newBackground } } });
  };
  const backgroundViewChange = () => {
    onChange({ ...anyTemplates, content: { ...anyTemplates.content, background: { ...anyTemplates.content.background, isView: !anyTemplates.content.background.isView } } });
  };

  const [length, setLenght] = useState<number>(0);

  useEffect(() => {
    if (anyTemplates.html === previeComponent) {
      return;
    }
    if (length !== anyTemplates.content.components.length) {
      setLenght(anyTemplates.content.components.length);
    }
    onChange({ ...anyTemplates, html: previeComponent });
  }, [anyTemplates]);

  const getBiggestId = () => {
    let id = 10;
    const components = anyTemplates.content.components;
    for (let i = 0;i < components.length;i++) {
      if (components[i].id > id) {
        id = components[i].id;
      }
    }

    return id + 1;
  };

  const valueChange = (stringIndex: string, newValue: any) => {
    const masIndex = stringIndex.split('.');
    const newValues: any = { ...anyTemplates };
    let val: any = newValues.content.components[Number(masIndex[0])];
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
    const copyTamplate = [...anyTemplates.content.components];
    closeEditForm();
    if (copyTamplate.length === 1) {
      onChange({ ...anyTemplates, content: { ...anyTemplates.content, components: [] } });
    } else {
      copyTamplate.splice(index, 1);
      onChange({ ...anyTemplates, content: { ...anyTemplates.content, components: copyTamplate } });
    }
  };

  const copyEl = (index: number) => {
    const component = [...anyTemplates.content.components][index];
    const endIndex = index + 1 || 0;
    const componentCopy = structuredClone(component);
    componentCopy.id = getBiggestId();
    const copyTamplate = [...anyTemplates.content.components];
    copyTamplate.splice(endIndex, 0, componentCopy);
    copyTamplate[endIndex].text = copyTamplate[endIndex].text ? copyTamplate[endIndex].text + ' ' : undefined;
    onChange({ ...anyTemplates, content: { ...anyTemplates.content, components: copyTamplate } });
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
        component.id = getBiggestId();
        const copyTamplate = [...anyTemplates.content.components];
        if (copyTamplate.length === 0) {
          onChange({ ...anyTemplates, content: { ...anyTemplates.content, components: [component] } });
        } else {
          const endIndex = result.destination.index;
          copyTamplate.splice(endIndex, 0, component);
          onChange({ ...anyTemplates, content: { ...anyTemplates.content, components: copyTamplate } });
        }
      }
    }
    if (result.source.droppableId === 'tamplate') {
      if (result.destination.droppableId === 'compotents') return;
      const startIndex = result.source.index;
      const endIndex = result.destination.index;
      const copyTamplate = [...anyTemplates.content.components];
      const [reorderTodo] = copyTamplate.splice(startIndex, 1);
      copyTamplate.splice(endIndex, 0, reorderTodo);
      if (editedIndex === startIndex) {
        openEditForm(endIndex);
      }
      onChange({ ...anyTemplates, content: { ...anyTemplates.content, components: copyTamplate } });
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
    <div
      style={{
        height: '100%',
        width: '100%',
        background: anyTemplates.content.background.isView ? anyTemplates.content.background.value : 'transparent'
      }}
    >
      <div>
        {anyTemplates.content.components.map((component: IComponent, index: number) => (
          <EmailTemplateItem
            key={index}
            index={index}
            isPreview={true}
            component={component}
          />
        ))}
      </div>
    </div>
  );

  const getComponentIcon = (type: componentTypes) => {
    switch (type) {
      case 'text':return <TextIncreaseIcon sx={{ color: theme.mainContent.buttonPrimaryColor, fontSize: '50px' }} />;
      case 'button':return <AddBoxIcon sx={{ color: theme.mainContent.buttonPrimaryColor, fontSize: '50px' }} />;
      case 'divider':return <ViewAgendaIcon sx={{ color: theme.mainContent.buttonPrimaryColor, fontSize: '50px' }} />;
      case 'image':return <ImageIcon sx={{ color: theme.mainContent.buttonPrimaryColor, fontSize: '50px' }} />;
    }
  };

  const paperBoxShadow = '0px 0px 10px ' + (
    settings.customization.colorMode !== 'dark'
      ? 'rgba(0,0,0,0.1)'
      : 'rgba(250, 250, 250, 0.1)'
  );

  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));
  const matchDownXl = useMediaQuery(theme.breakpoints.down('xl'));

  const workspaceWidth = matchDownLg ? 350 : 450;

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <TabContext value={tabIndex} >
          <div style={{ width: '100%' }}>
            <div onMouseDown={handleEditUnFocus} style={{ display: 'flex', alignItems: 'center' }} >
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
              <Box flex={1}/>
              {editedIndex !== null && tabIndex !== '2' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: '6px' }}>
                  <IconButton onClick={closeEditForm} size="small"><CloseIcon /></IconButton>
                </div>
              )}
              <div style={{ paddingRight: '5px' }}>
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
              <TabPanel value="1" style={{ height: '100%', width: `calc(100% - ${workspaceWidth}px)`, padding: '0' }} >
                <CustomizedScrollBox className={style.templateScrollBox} options={{ suppressScrollX: true }}>
                  <div style={{ width: '100% ', transition: '0.5s' }}>
                    <Droppable droppableId="tamplate" >
                      {(droppableProvider) => (
                        <div
                          style={{
                            background: anyTemplates.content.background.isView ? anyTemplates.content.background.value : 'transparent',
                            boxShadow: paperBoxShadow
                          }}
                          className={style.templateBody}
                          ref={droppableProvider.innerRef}
                          {...droppableProvider.droppableProps}
                        >
                          {anyTemplates.content.components.map((component: IComponent, index: number) => (
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
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden', padding: '20px' }}>
                  <div
                    style={{
                      maxWidth: previewMode,
                      width: '100%', transition: '0.5s',
                      background: anyTemplates.content.background.isView ? anyTemplates.content.background.value : 'transparent',
                      boxShadow: paperBoxShadow,
                    }}
                  >
                    <CustomizedScrollBox options={{ suppressScrollX: true }}>
                      {ReactHtmlParser(previeComponent)}
                    </CustomizedScrollBox>
                  </div>
                </div>
              </TabPanel>
            </div>
            <div
              style={{
                position: 'absolute',
                right: tabIndex === '2' ? '-100%' : 0,
                top: 0,
                bottom: 0,
                width: workspaceWidth,
                minWidth: '300px',
                transition: '0.5s',
                zIndex: 2
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderLeft: `1px solid ${theme.mainContent.borderColor}`,
                  background: theme.palette.background.paper,
                }}
              >
                {editedIndex || editedIndex === 0
                  ? <Box
                    sx={{
                      '& .jodit-workplace': {
                        background: (anyTemplates.content.background.isView ? anyTemplates.content.background.value : 'transparent') + '!important'
                      }
                    }}
                    style={{ height: '100%', minWidth: '300px' }}
                    onMouseDown={handleEditUnFocus}
                    >
                    <EmailTemplateEdit
                      copy={copyEl}
                      removeEl={removeEl}
                      editedIndex={editedIndex as number}
                      close={closeEditForm}
                      component={anyTemplates.content.components[editedIndex]}
                      setValue={valueChange}
                      length={length}
                    />
                  </Box>
                  : (
                    <CustomizedScrollBox options={{ suppressScrollX: true }}>
                      <Droppable droppableId="compotents" >
                        {(droppableProvider) => (
                          <div
                            className={style.componentBody}
                            ref={droppableProvider.innerRef}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                width: '100%',
                                paddingBottom: '20px'
                              }}
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
                                        style={{
                                          width: '110px',
                                          height: '110px',
                                          marginRight: '10px',
                                          cursor: 'pointer',
                                          marginBottom: '10px'
                                        }}
                                      >
                                        <div
                                          ref={draggableProvider.innerRef}
                                          {...dragProps}
                                          {...draggableProvider.dragHandleProps}
                                          style={getStyle(draggableProvider.draggableProps.style, snapshot, (draggedId === component.id) || primaryDrag === `${component.id}`)}
                                        >
                                          <Box
                                            sx={{ '& .MuiBox-root:hover': {
                                              boxShadow: '0px 0px 8px 0px ' + (
                                                settings.customization.colorMode !== 'dark'
                                                  ? 'rgba(0,0,0,0.2)'
                                                  : 'rgba(250, 250, 250, 0.3)'
                                              )
                                            } }}
                                          >
                                            <Box
                                              sx={{
                                                userSelect: 'none',
                                                background: theme.palette.mode === 'dark' ? 'rgb(67 67 67)' : '#f4f4f4',
                                                width: '105px',
                                                height: '105px',
                                                padding: '5px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderRadius: '20px',
                                                flexDirection: 'column',
                                              }}
                                            >
                                              {getComponentIcon(component.type)}
                                              {component.title}
                                            </Box>
                                          </Box>
                                        </div>
                                      </div>

                                    );
                                  }}
                                </Draggable>
                              ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center', marginTop: '5px', flexWrap: 'wrap' }}>
                              <ColorEdit
                                label={'цвет фона'}
                                value={anyTemplates.content.background.value}
                                onChange={backgroundChange}
                              />
                              <FormControlLabel
                                sx={{ marginLeft: '0px' }}
                                onClick={backgroundViewChange}
                                control={<Switch checked={!anyTemplates.content.background.isView} />}
                                label="Прозрачный"
                              />
                            </div>
                          </div>
                        )}
                      </Droppable>
                    </CustomizedScrollBox>
                  )
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
