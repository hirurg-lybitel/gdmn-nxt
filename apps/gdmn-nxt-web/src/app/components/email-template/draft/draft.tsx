import 'jodit';
import JoditEditor from 'jodit-react';
import { makeStyles } from '@mui/styles';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { EmailTemplate, IComponent } from '../email-template';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Theme } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Visibility } from '@mui/icons-material';

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
      backgroundColor: 'transparent !important',
      minHeight: '0px !important',
      cursor: 'text'
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
  isOpen: boolean,
  width: string,
  editedIndex: number,
  setValue: (stringIndex: string, newValue: any) => void,
  setDrag: (arg: boolean) => void,
  drag?: boolean,
  component: IComponent
}

export default function Draft({ isOpen, width, editedIndex, component, setValue, setDrag, drag }: draftProps) {
  const classes = useStyles();

  const save = () => {
    if (!ref?.current?.value || component?.text === ref?.current?.value) return;
    setValue(`${editedIndex}.text`, ref?.current?.value);
  };

  useEffect(() => {
    save();
  }, [isOpen]);

  const ref = useRef<any>(null);

  const joditEditorMemo = useMemo(() => {
    const editorConfig = {
      readonly: false,
      autofocus: isOpen,
      toolbar: isOpen,
      events: {
        paste: (e: any) => setDrag(false)
      },
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
      buttons: ['fullsize', 'undo', 'redo', '|', 'bold', 'underline', 'italic', 'strikethrough',
        '|', 'font', 'fontsize', 'brush', 'paragraph', '|', 'ul', 'ol', 'link', '|', 'spellcheck', 'eraser', '|'],
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
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
        config={editorConfig}
      />
    );
  }, [ref, component, isOpen]);

  return (
    <div
      onMouseEnter={() => {
        if (component.text?.indexOf('<img') === -1) return;
        setDrag(false);
      }}
      className={classes.draft}
      style={{
        width: isOpen ? 'auto'
          : ((!component.text || component.text === '<p><br></p>') ? '150px' : width),
        display: 'flex',
        justifyContent: 'center' }}
    >
      {joditEditorMemo}
    </div>
  );
}
