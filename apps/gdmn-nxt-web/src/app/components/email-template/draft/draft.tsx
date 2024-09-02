import JoditEditor from 'jodit-react';
import { makeStyles } from '@mui/styles';
import { IComponent } from '../email-template';
import { Box, GlobalStyles, Theme } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material';

const useStyles = makeStyles((theme: Theme) => ({
  draft: (({
    maxWidth: '100%',
    color: 'black',
    '& .jodit-status-bar': {
      visibility: 'hidden',
      height: '0px',
      border: 'none',
      width: '0px'
    },
    '& .jodit-react-container': {
      width: '100%'
    },
    '& .jodit-wysiwyg': {
      minHeight: '56px !important',
      background: 'none !important',
      padding: '0px !important',
      color: 'black'
    },
    '& .jodit-workplace': {
      minHeight: '0px !important',
      cursor: 'text',
      padding: '5px'
    },
    '& .jodit-toolbar__box': {
      background: 'none'
    },
    '& .jodit-container': {
      background: 'none',
      minHeight: '0px !important',
      border: 'none !important',
      minWidth: '0px !important'
    },
    '& .jodit-jodit_fullsize_true': {
      background: theme.palette.background.paper
    },
    '& .jodit-ui-form': {
      color: 'red'
    },
    '& .jodit-popup__content': {
      color: 'red'
    },
    '& .jodit-toolbar-button:hover': {
      background: 'transparent !important'
    },
    '& .jodit-toolbar-button__trigger:hover': {
      background: 'hsla(0,0%,86%,.4) !important',
    },
    '& .jodit-toolbar-button__button:hover': {
      background: 'hsla(0,0%,86%,.4) !important',
    }
  })),
  formPopup: {
    '& div:nth-last-child(2)': {
      position: 'absolute',
      border: 'none',
      width: '0px',
      height: '0px',
      Visibility: 'hidden',
      opacity: 0,
      overflow: 'hidden'
    }
  },
  file: {
    backGround: 'red'
  }
}));

interface draftProps {
  editedIndex: number,
  setValue: (stringIndex: string, newValue: any) => void,
  component: IComponent
}


export default function Draft({ editedIndex, component, setValue }: draftProps) {
  const classes = useStyles();

  const save = (value: string) => {
    if (needDubleUpdate) return;
    const newValue = ref?.current?.value;
    let formattedValue = '';
    for (let i = 0;i < newValue.length;i++) {
      if (newValue.charAt(i) === 'p' && newValue.charAt(i - 1) === '<' && newValue.charAt(i + 1) === '>') {
        formattedValue += 'p style="margin:0px"';
      } else {
        formattedValue += newValue.charAt(i);
      }
    }
    setValue(`${editedIndex}.text`, formattedValue);
  };

  const theme = useTheme();

  const [currentValue, setCurrentValue] = useState(component.text || '<p style="margin:0px"><br></p>');

  // Чтобы значение при очистке не было <p><br></p>, Иначе при вводе первого символа после очистки курсор перемещается в начало строки
  const [isNeedRemoveVoid, setIsNeedRemoveVoid] = useState(false);

  const ref = useRef<any>(null);
  useEffect(() => {
    if (ref?.current?.value === '<p><br></p>' || ref?.current?.value === '') {
      if (isNeedRemoveVoid) {
        ref?.current?.value !== '<p style="margin:0px"><br></p>' && setCurrentValue('');
        setIsNeedRemoveVoid(false);
        return;
      }
      setIsNeedRemoveVoid(true);
      setCurrentValue('<p style="margin:0px"><br></p>');
    }
  }, [ref?.current?.value, currentValue, isNeedRemoveVoid]);

  const editorConfig = useMemo(() => {
    return {
      readonly: false,
      autofocus: true,
      popupClassName: classes.draft,
      toolbar: true,
      addNewLine: false,
      spellcheck: true,
      language: 'ru',
      toolbarAdaptive: false,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      uploader: {
        insertImageAsBase64URI: true
      },
      buttons: ['fullsize', 'undo', 'redo', 'bold', 'underline', 'italic', 'strikethrough',
        'font', 'fontsize', 'brush', 'paragraph', 'ul', 'ol', 'eraser'],
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
      theme: theme.palette.mode,
      link: {
        openInNewTabCheckbox: false,
        noFollowCheckbox: false,
        formClassName: classes.formPopup
      },
      controls: {
        file: {
          name: '',
          popup: () => {}
        }
      }
    };
  }, [theme]);

  // Чтобы при переключении между текстовыми полями если начальные значения совпадают, значение поля изменилось
  const [needDubleUpdate, setNeedDubleUpdate] = useState(false);
  const [last, setLast] = useState(component.text || '<p style="margin:0px"><br></p>');

  useEffect(() => {
    if (ref?.current?.value === component.text) return;
    if (last === (component.text || '<p style="margin:0px"><br></p>') && !needDubleUpdate) {
      setNeedDubleUpdate(true);
      setCurrentValue('<p><br></p>');
      return;
    }
    setNeedDubleUpdate(false);
    setCurrentValue(component.text || '<p style="margin:0px"><br></p>');
    setLast(component.text || '<p style="margin:0px"><br></p>');
  }, [component.text, needDubleUpdate]);

  return (
    <Box
      className={classes.draft}
      style={{
        width: 'auto',
        display: 'flex',
        justifyContent: 'center' }}
    >
      <GlobalStyles
        styles={{
          '& .jodit-toolbar-button__icon svg': {
            fill: theme.textColor + '!important',
            stroke: theme.textColor + '!important'
          },
          '& .jodit-toolbar-button__trigger svg': {
            fill: theme.textColor + '!important',
            stroke: theme.textColor + '!important'
          },
          '& .jodit-placeholder': {
            paddingLeft: '5px !important',
            paddingTop: '5px !important'
          },
          '& .jodit-toolbar__box': {
            background: theme.palette.background.paper + '!important',
            border: '1px solid ' + theme.mainContent.borderColor,
            borderBottom: 'none !important'
          },
          '& .jodit-toolbar-button__button:hover span': {
            color: theme.textColor + ' !important'
          },
          '& .jodit-toolbar-button:hover': {
            background: 'hsla(0,0%,86%,.4) !important'
          },
          '& .jodit-toolbar-button__button:hover': {
            background: 'none !important',
          },
          '& .jodit-toolbar-button:hover span': {
            color: theme.textColor + ' !important'
          },
          '& .jodit-toolbar-button__text:hover': {
            background: 'none !important'
          },
          '& .jodit-toolbar-button': {
            cursor: 'pointer'
          },
          '& .jodit-ui-button:hover': {
            background: 'hsla(0,0%,86%,.4) !important'
          },
          '& .jodit-ui-button:hover span': {
            color: theme.textColor + ' !important'
          },
          '& .jodit-ui-button__text:hover': {
            background: 'none !important'
          },
          '& .jodit-ui-button_variant_outline': {
            background: 'hsla(0,0%,86%,.2) !important',
          },
          '& .jodit-workplace': {
            border: `1px solid ${ theme.mainContent.borderColor} !important`,
            borderTop: 'none !important'
          },
          '& .jodit-wysiwyg p': {
            margin: '0px !important'
          }
        }}
      />
      <JoditEditor
        ref={ref}
        value={currentValue}
        config={editorConfig as any}
        onChange={save}
      />
    </Box>
  );
}
