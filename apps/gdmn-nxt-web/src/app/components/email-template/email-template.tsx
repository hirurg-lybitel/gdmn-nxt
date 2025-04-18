import style from './email-template.module.less';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Box, Divider, IconButton, Tab, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CustomizedScrollBox from '../Styled/customized-scroll-box/customized-scroll-box';
import EmailTemplateEdit from './email-template-edit/email-template-edit';
import EmailTemplateItem from './email-template-item/email-template-item';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ComputerIcon from '@mui/icons-material/Computer';
import TabletIcon from '@mui/icons-material/Tablet';
import ColorEdit from '../Styled/colorEdit/colorEdit';
import ReactHtmlParser from 'react-html-parser';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ImageIcon from '@mui/icons-material/Image';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import CloseIcon from '@mui/icons-material/Close';
import { hexToRGB, htmlToTemplateObject, objectToHtml } from './html-to-object';

export type componentTypes = 'text' | 'image' | 'button' | 'divider'

export type IComponentPosition = 'start' | 'center' | 'end'

interface BaseComponentSettings {
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

export interface BaseComponent extends BaseComponentSettings {
  id: number,
  title: string,
  type: componentTypes,
}

export interface ITextComponent extends BaseComponent {
  text?: string
}

export interface IImageComponent extends BaseComponent {
  image?: string
}

export interface IDeviderComponent extends BaseComponent {
}

export interface IButtonComponent extends BaseComponent {
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

export interface ITemplateEdit {
  components: IComponent[],
  background: {
    value: string,
    isView: boolean
  }
}

interface EmailTemplateProps {
  value?: string,
  onChange: (value: string) => void,
  // defaultValues?: {
  //   text?: BaseComponentSettings,
  //   image?: BaseComponentSettings,
  //   button: BaseComponentSettings & IButtonComponent,
  //   divider: BaseComponentSettings
  // }
}


const EmailTemplate = (props: EmailTemplateProps) => {
  const theme = useTheme();
  const {
    value = '',
    onChange
  } = props;
  const handleChange = (value: ITemplateEdit) => {
    onChange(objectToHtml(value));
  };


  const template = useMemo(() => htmlToTemplateObject(value), [value]);
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
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
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

  const backgroundChange = useCallback((newBackground: string) => {
    handleChange({ ...template, background: { ...template.background, value: newBackground } });
  }, [template, handleChange]);

  const getBiggestId = useCallback(() => {
    let id = 10;
    const components = template.components;
    for (const component of components) {
      if (component.id > id) {
        id = component.id;
      }
    }
    return id + 1;
  }, [template.components]);

  const valueChange = useCallback((stringIndex: string, newValue: any) => {
    const masIndex = stringIndex.split('.');
    const newValues = { ...template };
    let val: any = newValues.components[Number(masIndex[0])];
    if (val === undefined) return;
    for (let i = 1; i < masIndex.length; i++) {
      if (i + 1 === masIndex.length) {
        if (!val) return;
        val[masIndex[i]] = newValue;
      }
      val = val?.[masIndex[i]];
    }
    handleChange(newValues);
  }, [template, handleChange]);

  const removeEl = useCallback((index: number) => {
    const copyTemplate = [...template.components];
    closeEditForm();
    if (copyTemplate.length === 1) {
      handleChange({ ...template, components: [] });
    } else {
      copyTemplate.splice(index, 1);
      handleChange({ ...template, components: copyTemplate });
    }
  }, [template, handleChange]);

  const copyEl = useCallback((index: number) => {
    const component = [...template.components][index];
    const endIndex = index + 1 || 0;
    const componentCopy = structuredClone(component);
    componentCopy.id = getBiggestId();
    const copyTemplate = [...template.components];
    copyTemplate.splice(endIndex, 0, componentCopy);
    copyTemplate[endIndex].text = copyTemplate[endIndex].text ? copyTemplate[endIndex].text + ' ' : undefined;
    handleChange({ ...template, components: copyTemplate });
  }, [template, getBiggestId, handleChange]);

  const [editedIndex, setEditedIndex] = useState<number | null>(null);

  const handleDragEnd = useCallback((result: DropResult) => {
    handleChangePrimaryDrag('');
    setDraggedId(-1);
    // setAllowChangePrimary(true);
    if (!result.destination) return;
    if (result.source.droppableId === 'compotents') {
      if (result.destination.droppableId === 'template') {
        const startIndex = result.source.index;
        const copyComponents = [...components];
        const component = { ...copyComponents[startIndex] };
        component.id = getBiggestId();
        const copyTemplate = [...template.components];
        if (copyTemplate.length === 0) {
          handleChange({ ...template, components: [component] });
        } else {
          const endIndex = result.destination.index;
          copyTemplate.splice(endIndex, 0, component);
          handleChange({ ...template, components: copyTemplate });
        }
      }
    }
    if (result.source.droppableId === 'template') {
      if (result.destination.droppableId === 'compotents') return;
      const startIndex = result.source.index;
      const endIndex = result.destination.index;
      const copyTemplate = [...template.components];
      const [reorderTodo] = copyTemplate.splice(startIndex, 1);
      copyTemplate.splice(endIndex, 0, reorderTodo);
      if (editedIndex === startIndex) {
        openEditForm(endIndex);
      }
      handleChange({ ...template, components: copyTemplate });
    }
  }, [editedIndex, getBiggestId, handleChange, template]);


  const openEditForm = (index: number) => {
    setEditedIndex(index);
  };

  const handleOpenEditForm = (index: number) => () => {
    if (editedIndex === index) return;
    openEditForm(index);
  };

  const closeEditForm = () => {
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

  const getComponentIcon = (type: componentTypes) => {
    switch (type) {
      case 'text':return <TextIncreaseIcon sx={{ color: theme.mainContent.buttonPrimaryColor, fontSize: '50px' }} />;
      case 'button':return <AddBoxIcon sx={{ color: theme.mainContent.buttonPrimaryColor, fontSize: '50px' }} />;
      case 'divider':return <ViewAgendaIcon sx={{ color: theme.mainContent.buttonPrimaryColor, fontSize: '50px' }} />;
      case 'image':return <ImageIcon sx={{ color: theme.mainContent.buttonPrimaryColor, fontSize: '50px' }} />;
    }
  };

  const workspaceWidth = 375;
  const workspaceHeight = 250;

  const workspaceTextColor = useCallback(() => {
    const rgb = hexToRGB(template.background.value);
    return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) < 165 ? 'white' : 'black';
  }, [template.background.value]);

  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));

  const [scroll, setScroll] = useState(true);

  const mobile = useMediaQuery('(pointer: coarse)');

  const onDragStart = (id: number) => () => {
    setDraggedId(id);
    handleChangeAllowChangePrimary(false)();
  };

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
            <div style={{ display: 'flex', alignItems: 'center', overflow: 'auto' }} >
              <TabList
                onChange={handleTabsChange}
                centered
                sx={{
                  position: 'relative'
                }}
                variant="scrollable"
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
              <div style={{ paddingRight: '5px', display: 'flex', marginLeft: '10px' }}>
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
            <div style={{ width: '100%', height: '100%', paddingTop: matchDownMd ? '20px' : undefined, }}>
              <TabPanel
                value="1"
                style={{
                  height: `calc(100% - ${matchDownMd ? (workspaceHeight + 20) : 0}px)`,
                  width: `calc(100% - ${matchDownMd ? 0 : workspaceWidth}px)`,
                  padding: '20px',
                  paddingTop: matchDownMd ? '0' : undefined,
                  overflow: 'auto',
                  position: 'relative'
                }}
              >
                <div
                  className={style.templateScrollBox}
                  style={{ top: matchDownMd ? '0' : undefined }}
                >
                  <div style={{ width: '100% ', transition: '0.5s' }}>
                    <Droppable droppableId="template" >
                      {(droppableProvider) => (
                        <div
                          style={{
                            backgroundColor: template.background.value,
                          }}
                          className={style.templateBody}
                          ref={droppableProvider.innerRef}
                          {...droppableProvider.droppableProps}
                        >
                          {template.components.map((component: IComponent, index: number) => (
                            <Draggable
                              index={index}
                              key={component.id}
                              draggableId={`${component.id}`}
                            >
                              {(draggableProvider) => {
                                const dragProps = drag ? { ...draggableProvider.draggableProps } : {};
                                return (
                                  <div
                                    onMouseDown={mobile ? undefined : handleOpenEditForm(index)}
                                    onTouchStart={mobile ? handleOpenEditForm(index) : undefined}
                                    ref={draggableProvider.innerRef}
                                    {...dragProps}
                                    {...draggableProvider.dragHandleProps}
                                  >
                                    <EmailTemplateItem
                                      copy={copyEl}
                                      removeEl={handleDelete}
                                      editedIndex={editedIndex}
                                      index={index}
                                      component={component}
                                      setValue={valueChange}
                                      setDrag={(arg: boolean) => setDrag(arg)}
                                      background={template.background.value}
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
                </div>
              </TabPanel>
              <TabPanel value="2" style={{ height: '100%', width: '100%', padding: '0' }} >
                <div
                  style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center',
                    overflow: 'hidden', padding: '20px', paddingTop: matchDownMd ? '0px' : '20px' }}
                >
                  <div
                    style={{
                      maxWidth: previewMode,
                      width: '100%', transition: '0.5s',
                      background: template.background.value,
                    }}
                  >
                    <CustomizedScrollBox externalScrollLock options={{ suppressScrollX: true }}>
                      {ReactHtmlParser(value)}
                    </CustomizedScrollBox>
                  </div>
                </div>
              </TabPanel>
            </div>
            <div
              style={{
                position: 'absolute',
                right: tabIndex === '2' && !matchDownMd ? '-100%' : 0,
                width: matchDownMd ? '100%' : workspaceWidth,
                height: matchDownMd ? workspaceHeight : '100%',
                bottom: tabIndex === '2' && matchDownMd ? '-100%' : 0,
                minWidth: '300px',
                transition: '0.5s',
                zIndex: 2,
                paddingBottom: matchDownMd ? '2px' : 0
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderLeft: matchDownMd ? 'none' : `1px solid ${theme.mainContent.borderColor}`,
                  borderTop: matchDownMd ? `1px solid ${theme.mainContent.borderColor}` : 'none',
                  borderBottom: matchDownMd ? `1px solid ${theme.mainContent.borderColor}` : 'none',
                  background: theme.palette.background.paper,
                }}
              >
                {editedIndex || editedIndex === 0
                  ? <Box
                    sx={{
                      '& .jodit-workplace': {
                        background: (template.background.isView ? template.background.value : 'transparent') + '!important',
                      },
                      '& .jodit-wysiwyg p': {
                        color: workspaceTextColor()
                      },
                      '& .jodit-placeholder': {
                        color: workspaceTextColor(),
                        opacity: '0.5'
                      }
                    }}
                    style={{ height: '100%', minWidth: '300px' }}
                  >
                    <EmailTemplateEdit
                      editedIndex={editedIndex as number}
                      component={template.components[editedIndex]}
                      setValue={valueChange}
                    />
                  </Box>
                  : (
                    <CustomizedScrollBox externalScrollLock options={{ suppressScrollX: true }}>
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
                                paddingBottom: '20px',
                                gap: '10px'
                              }}
                            >
                              {components.map((component: IComponent, index: number) => (
                                <Draggable
                                  index={index}
                                  draggableId={`${component.id}`}
                                  key={component.id}
                                >
                                  {(draggableProvider, snapshot) => {
                                    return (
                                      <div
                                        onMouseDown={mobile ? undefined : onDragStart(component.id)}
                                        onTouchStart={mobile ? () => {
                                          onDragStart(component.id);
                                          handleChangePrimaryDrag(`${component.id}`)();
                                        } : undefined}
                                        onMouseUp={mobile ? undefined : handleChangeAllowChangePrimary(true)}
                                        onTouchEnd={mobile ? handleChangeAllowChangePrimary(true) : undefined}
                                        onMouseEnter={handleChangePrimaryDrag(`${component.id}`)}
                                        style={{
                                          width: '110px',
                                          height: '110px',
                                          // marginRight: '10px',
                                          cursor: 'pointer',
                                          // marginBottom: '10px'
                                        }}
                                      >
                                        <div
                                          ref={draggableProvider.innerRef}
                                          {...draggableProvider.draggableProps}
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
                                                backgroundColor: 'var(--color-card-bg)',
                                                width: '105px',
                                                height: '105px',
                                                padding: '5px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderRadius: 'var(--border-radius)',
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
                                label={'Цвет фона'}
                                value={template.background.value}
                                onChange={backgroundChange}
                              />
                            </div>
                          </div>
                        )}
                      </Droppable>
                    </CustomizedScrollBox>
                  )}
              </div>
            </div>
          </div>
        </TabContext>
      </DragDropContext>
    </div>
  );
};

export default EmailTemplate;
