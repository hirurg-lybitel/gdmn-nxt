import style from './email-template-item.module.less';
import { IconButton, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import { IComponent } from '../email-template';
import ImageIcon from '@mui/icons-material/Image';
import ReactHtmlParser from 'react-html-parser';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const useStyles = makeStyles((theme: Theme) => ({
  templateItem: {
    position: 'relative',
    '&:hover': {
      border: `1px solid ${theme.palette?.primary.main} !important`,
      '& $templateIcon': {
        visibility: 'visible !important'
      }
    },
  },
  templateIcon: {
    visibility: 'hidden',
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: theme.palette?.primary.main, borderRadius: '100%',
    padding: '5px',
    right: '-12.5px',
    top: 'calc(50% - 12.5px)',
    zIndex: 1
  }
}));

interface findComponentProps {
  component: IComponent,
  isPreview?: boolean,
  editedIndex?: number | null,
  index?: number,
  editIsFocus?: boolean,
  setValue?: (stringIndex: string, newValue: any) => void,
  setDrag?: (arg: boolean) => void,
  drag?: boolean,
}

export const findComponent = (props: findComponentProps) => {
  const { component, isPreview, editedIndex, index, editIsFocus, setValue, setDrag, drag } = props;

  switch (component.type) {
    case 'text':
      return (
        <div
          style={{
            width: component.width.auto ? 'auto' : component.width?.value + '%',
            color: 'black',
            maxWidth: '100%',
            wordWrap: 'break-word'
          }}
        >
          {ReactHtmlParser(
            !(component.text === '<p style="margin:0px"><br></p>' || !component.text || component.text === '')
              ? component.text
              : (isPreview ? '' : '<p>Напишите что-либо</p>')
          )}
        </div>
      );
    case 'image':
      return (
        <>
          {component.image
            ? (
              <img
                style={{ width: `${component.width?.value}%` }}
                src={component.image}
              />
            )
            : isPreview ? <div /> : <ImageIcon color="primary" fontSize="large" />
          }
        </>
      );
    case 'button':
      return (
        <a
          href={(!component.url || component.url?.length < 0) ? undefined : component.url}
          target="_blank"
          style={{
            textDecoration: 'none',
            width: component.width.auto ? 'auto' : component.width?.value + '%',
            backgroundColor: component.color?.button,
            color: component.color?.text,
            padding: `${component.padding?.top}px ${component.padding?.right}px ${component.padding?.bottom}px ${component.padding?.left}px`,
            font: `${component.font?.size}px ${component.font?.value}`,
            fontWeight: '600',
            borderRadius: '10px',
            cursor: (!component.url || (component.url?.length || 0) < 1) ? 'auto' : 'pointer',
            textAlign: 'center',
            userSelect: 'none'
          }}
          rel="noreferrer"
        >
          {component.text}
        </a>
      );
    case 'divider':
      return (
        <div
          style={{ paddingTop: '5px', paddingBottom: '5px',
            width: component.width.auto ? 'auto' : `${component.width?.value}%`
          }}
        >
          <div style={{ background: 'rgba(0, 0, 0, 0.18', height: '1px', width: '100%' }} />
        </div>);
    default: return <div />;
  }
};

interface EmailTemplateItemProps{
  editedIndex?: number | null,
  index?: number,
  editIsFocus?: boolean,
  setValue?: (stringIndex: string, newValue: any) => void,
  setEditIsFocus?: (value: React.SetStateAction<boolean>) => void,
  isPreview?: boolean,
  component: IComponent,
  setDrag?: (arg: boolean) => void,
  drag?: boolean,
  removeEl?: (index: number) => void;
  copy?: (index: number) => void
}

const EmailTemplateItem = (props: EmailTemplateItemProps) => {
  const theme = useTheme();
  const { editedIndex, index, editIsFocus, setValue, setEditIsFocus, isPreview, component, setDrag, drag, copy, removeEl } = props;

  const classes = useStyles();

  if (isPreview || !setValue) {
    if (!component) return <div />;
    return (
      <div
        style={{
          display: 'flex', justifyContent: component.position,
          padding: `${component.margin.top}px ${component.margin.right}px ${component.margin.bottom}px ${component.margin.left}px`,
          border: '1px solid transparent'
        }}
      >
        {findComponent({ isPreview: true, component: component })}
      </div>
    );
  }

  const handleRemove = () => {
    if (!removeEl || index === undefined) return;
    removeEl(index);
  };

  const handleCopy = () => {
    if (!copy || index === undefined) return;
    copy(index);
  };


  return (
    <div
      className={classes.templateItem}
      style={{
        padding: `${component.margin.top}px ${component.margin.right}px ${component.margin.bottom}px ${component.margin.left}px`,
        border: index === editedIndex ? `1px solid ${theme.palette?.primary.main}` : '1px solid transparent',
      }}
    >
      <div >
        <div
          onMouseEnter={() => {
            setDrag && setDrag(true);
          }}
          className={classes.templateIcon}
          style={{
            visibility: index === editedIndex ? 'visible' : 'hidden'
          }}
        >
          <ZoomOutMapIcon sx={{ fontSize: '15px' }} style={{ transform: 'rotate(0.125turn)' }}/>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '-36px',
            right: '0',
            display: 'flex',
            background: theme.palette?.primary.main,
            visibility: index === editedIndex ? 'visible' : 'hidden',
            borderRadius: '0px 0px 10px 10px',
            zIndex: '1'
          }}
        >
          <IconButton
            onClick={handleRemove}
            sx={{
              borderRadius: '0px !important',
              '& .MuiTouchRipple-root span': { borderRadius: '0px !important' },
              '& .MuiTouchRipple-root': { borderRadius: '0px !important' }
            }}
          >
            <DeleteIcon/>
          </IconButton>
          <IconButton
            onClick={handleCopy}
            sx={{
              borderRadius: '0px !important',
              '& .MuiTouchRipple-root span': { borderRadius: '0px !important' },
              '& .MuiTouchRipple-root': { borderRadius: '0px !important' }
            }}
          >
            <ContentCopyIcon/>
          </IconButton>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: component.position,
          width: '100%',
          height: '100%'
        }}
        onMouseDown={() => {
          setEditIsFocus && setEditIsFocus(true);
        }}
      >
        {findComponent({ component, isPreview: false, editedIndex, index, editIsFocus, setValue, setDrag, drag })}
      </div>
    </div>
  );
};

export default EmailTemplateItem;
