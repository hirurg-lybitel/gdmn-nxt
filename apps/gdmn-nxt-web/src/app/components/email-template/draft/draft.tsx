import React, { useState } from 'react';
import 'jodit';
import JoditEditor, { IJoditEditorProps, Jodit } from 'jodit-react';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  draft: {
    color: 'black',
    '& .jodit-status-bar': {
      visibility: 'hidden',
      height: '0px'
    },
    '& .jodit-react-container': {
      width: '100%'
    }
  }
}));

interface draftProps {
  isOpen: boolean,
  width: string
}

export default function Draft({ isOpen, width }: draftProps) {
  const [data, setData] = useState<any>();

  const classes = useStyles();

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
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    defaultActionOnPaste: 'insert_clear_html',
    uploader: {
      insertImageAsBase64URI: true
    },
    buttons: ['fullsize', 'undo', 'redo', '|', 'bold', 'underline', 'italic', 'strikethrough', 'superscript', 'subscript',
      '|', 'font', 'fontsize', 'brush', 'paragraph', '|', 'ul', 'ol', 'lineHeight', 'hr', '|', 'spellcheck', 'eraser', '|', 'copy', 'paste',
      'cut', 'selectall', '|'],
    width: '100%',
    height: 'auto'
  };

  return (
    <div>


      <div
        className={classes.draft}
        style={{ maxWidth: editorConfig.width, margin: '0 auto', width: width, display: 'flex', justifyContent: 'center' }}
      >
        <JoditEditor
          value={data}
          config={editorConfig as any}
          onBlur={value => {
            setData(value);
          }}
        />
      </div>
    </div>
  );
}
