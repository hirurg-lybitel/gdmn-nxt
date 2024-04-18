import React, { useEffect, useRef, useState } from 'react';
import 'jodit';
import JoditEditor, { IJoditEditorProps, Jodit } from 'jodit-react';
import { makeStyles } from '@mui/styles';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { EmailTemplate } from '../email-template';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Theme } from '@mui/material';

const useStyles = makeStyles((theme: Theme) => ({
  draft: ((props: any) => ({
    color: 'black',
    '& .jodit-status-bar': {
      visibility: 'hidden',
      height: '0px'
    },
    '& .jodit-react-container': {
      width: '100%'
    },
    '& .jodit-wysiwyg': {
      background: 'none',
      minHeight: '0px !important'
    },
    '& .jodit-workplace': {
      backgroundColor: 'transparent !important',
      minHeight: '0px !important',
      cursor: 'text',
      width: props.width
    },
    '& .jodit-toolbar__box': {
      background: 'none'
    },
    '& .jodit-container': {
      background: 'none',
      minHeight: '0px !important',
      border: 'none !important'
    },
    '& .jodit-jodit_fullsize_true': {
      background: theme.palette.background.paper
    }
  }))
}));

interface draftProps {
  isOpen: boolean,
  width: string,
  editedIndex: number,
  getValues: UseFormGetValues<EmailTemplate>,
  setValue: UseFormSetValue<EmailTemplate>,
}

export default function Draft({ isOpen, width, editedIndex, getValues, setValue }: draftProps) {
  const classes = useStyles({ width: '100px' });

  const component = getValues(`${editedIndex}`);

  const settings = useSelector((state: RootState) => state.settings);

  const editorConfig = {
    readonly: false,
    autofocus: isOpen,
    toolbar: isOpen,
    addNewLine: false,
    spellcheck: true,
    language: 'ru',
    toolbarButtonSize: 'medium',
    toolbarAdaptive: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    uploader: {
      insertImageAsBase64URI: true
    },
    buttons: ['fullsize', 'undo', 'redo', '|', 'bold', 'underline', 'italic', 'strikethrough', 'superscript', 'subscript',
      '|', 'font', 'fontsize', 'brush', 'paragraph', '|', 'ul', 'ol', 'lineHeight', 'hr', '|', 'spellcheck', 'eraser', '|', 'copy', 'paste',
      'cut', 'selectall', '|'],
    width: '100%',
    height: 'auto',
    theme: settings.customization.colorMode
  };

  return (
    <div
      className={classes.draft}
      style={{ maxWidth: editorConfig.width, minWidth: '200px', display: 'flex', justifyContent: 'center', color: 'white' }}
    >
      {width}
      <JoditEditor
        value={component?.text || ''}
        config={editorConfig as any}
        onBlur={value => {
          setValue(`${editedIndex}.text`, value);
        }}
      />
    </div>
  );
}
