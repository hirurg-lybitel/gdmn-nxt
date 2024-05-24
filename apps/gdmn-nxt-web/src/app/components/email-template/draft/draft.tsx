import 'jodit';
import JoditEditor from 'jodit-react';
import { makeStyles } from '@mui/styles';
import { IComponent } from '../email-template';
import { Box, GlobalStyles, Theme } from '@mui/material';
import { useMemo, useRef } from 'react';
import { useTheme } from '@mui/material';
import { popup } from 'leaflet';
import { ClassNames } from '@emotion/react';
import { BorderBottom } from '@mui/icons-material';

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
      background: 'none',
      minHeight: '0px !important',
      padding: '0px !important',
      color: 'black'
    },
    '& .jodit-workplace': {
      minHeight: '56px !important',
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
  component: IComponent,
  length: number
}


export default function Draft({ editedIndex, component, setValue, length }: draftProps) {
  const classes = useStyles();
  const save = () => {
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

  const ref = useRef<any>(null);

  const joditEditorMemo = useMemo(() => {
    console.log(component.text);
    const editorConfig = {
      readonly: false,
      autofocus: false,
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
        'font', 'fontsize', 'brush', 'paragraph', 'ul', 'ol', 'link', 'spellcheck', 'eraser'],
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
    return (
      <JoditEditor
        ref={ref}
        value={component?.text || ''}
        config={editorConfig as any}
        onChange={save}
      />
    );
  }, [ref, component, theme, editedIndex, length]);

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
          '& .jodit-wysiwyg p': {
            margin: 0,
            color: 'hsla(0, 5%, 70%, 8)'
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
        }}
      />
      {joditEditorMemo}
    </Box>
  );
}
