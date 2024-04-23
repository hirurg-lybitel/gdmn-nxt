import 'jodit';
import JoditEditor from 'jodit-react';
import { makeStyles } from '@mui/styles';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { EmailTemplate } from '../email-template';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Theme } from '@mui/material';

const useStyles = makeStyles((theme: Theme) => ({
  draft: (({
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
    }
  }))
}));

interface draftProps {
  isOpen: boolean,
  width: string,
  editedIndex: number,
  getValues: UseFormGetValues<EmailTemplate>,
  setValue: UseFormSetValue<EmailTemplate>,
  setDrag: (arg: boolean) => void,
  drag?: boolean
}

export default function Draft({ isOpen, width, editedIndex, getValues, setValue, setDrag, drag }: draftProps) {
  const classes = useStyles();

  const component = getValues(`${editedIndex}`);

  const settings = useSelector((state: RootState) => state.settings);

  const editorConfig = {
    readonly: false,
    autofocus: isOpen,
    toolbar: isOpen,
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
    buttons: ['fullsize', 'undo', 'redo', '|', 'bold', 'underline', 'italic', 'strikethrough', 'superscript', 'subscript',
      '|', 'font', 'fontsize', 'brush', 'paragraph', '|', 'ul', 'ol', 'lineHeight', 'hr', '|', 'spellcheck', 'eraser', '|', 'copy', 'paste',
      'cut', 'selectall', '|'],
    width: '100%',
    maxWidth: '100%',
    height: 'auto'
  };


  return (
    <div
      onMouseEnter={() => {
        if (component.text?.indexOf('<img') === -1) return;
        setDrag(false);
      }}
      className={classes.draft}
      style={{
        maxWidth: editorConfig.width, width: isOpen ? 'auto'
          : ((!component.text || component.text === '<p><br></p>') ? '150px' : width),
        display: 'flex',
        justifyContent: 'center' }}
    >
      <JoditEditor
        value={component?.text || ''}
        config={editorConfig}
        onChange={value => {
          setValue(`${editedIndex}.text`, value);
        }}
      />
    </div>
  );
}
