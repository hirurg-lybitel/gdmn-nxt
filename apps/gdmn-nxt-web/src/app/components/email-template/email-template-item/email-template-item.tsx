import style from './email-template.module.less';
import { Divider, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { UseFormGetValues, UseFormSetValue, useForm } from 'react-hook-form';
import Draft from '../draft/draft';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import { EmailTemplate, IComponent } from '../email-template';
import ImageIcon from '@mui/icons-material/Image';
import ReactHtmlParser from 'react-html-parser';

const useStyles = makeStyles((theme: Theme) => ({
  templateItem: {
    position: 'relative',
    '&:hover': {
      border: `1px solid ${theme.palette.primary.main} !important`,
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
    background: theme.palette.primary.main, borderRadius: '100%',
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
  getValues?: UseFormGetValues<EmailTemplate>,
  setValue?: UseFormSetValue<EmailTemplate>,
  editUnFocus?: () => void,
  setDrag?: (arg: boolean) => void,
  drag?: boolean
}

export const findComponent = (props: findComponentProps) => {
  const { component, isPreview, editedIndex, index, editIsFocus, getValues, setValue, setDrag, drag } = props;

  switch (component.type) {
    case 'text':
      return (isPreview || !setValue || !getValues || !setDrag)
        ? <div style={{ width: component.width.auto ? 'auto' : component.width.value + '%' }}>
          {ReactHtmlParser(component.text || '')}
        </div>
        : <Draft
          isOpen={!!(editIsFocus && index === editedIndex)}
          width={component.width.auto ? 'auto' : component.width.value + '%'}
          setValue={setValue}
          getValues={getValues}
          editedIndex={index || 0}
          setDrag={setDrag}
          drag={drag}
        />;
    case 'image':
      return (
        <>
          {component.image
            ? <img
              style={{ width: `${component.width.value}%` }}
              src={component.image}
              />
            : <ImageIcon color="primary" fontSize="large" />
          }
        </>
      );
    case 'button':
      return <div
        onClick={() => {
          isPreview && window.open(component.url, '_blank');
        }}
        style={{
          width: component.width.auto ? 'auto' : component.width.value + '%',
          backgroundColor: component.color?.button,
          color: component.color?.text,
          padding: `${component.padding?.top}px ${component.padding?.right}px ${component.padding?.bottom}px ${component.padding?.left}px`,
          font: `${component.font?.size}px ${component.font?.value}`,
          fontWeight: '600',
          borderRadius: '10px',
          cursor: 'pointer',
          textAlign: 'center'
        }}
             >
        {component.text}
      </div>;
    case 'divider':
      return (
        <div
          style={{ paddingTop: '5px', paddingBottom: '5px',
            width: component.width.auto ? 'auto' : `${component.width.value}%`
          }}
        >
          <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />
        </div>);
    default: return <div />;
  }
};

interface EmailTemplateItemProps{
  editedIndex?: number | null,
  index?: number,
  editIsFocus?: boolean,
  getValues?: UseFormGetValues<EmailTemplate>,
  setValue?: UseFormSetValue<EmailTemplate>,
  editUnFocus?: () => void,
  isPreview?: boolean,
  template?: IComponent,
  setDrag?: (arg: boolean) => void,
  drag?: boolean
}

const EmailTemplateItem = (props: EmailTemplateItemProps) => {
  const theme = useTheme();
  const { editedIndex, index, editIsFocus, getValues, setValue, editUnFocus, isPreview, template, setDrag, drag } = props;


  const classes = useStyles();


  if (isPreview || !setValue || !getValues) {
    if (!template) return <div />;
    return (
      <div
        style={{
          display: 'flex', justifyContent: template.position,
          padding: `${template.margin.top}px ${template.margin.right}px ${template.margin.bottom}px ${template.margin.left}px`
        }}
      >
        {findComponent({ isPreview: true, component: template })}
      </div>
    );
  }

  const component = getValues(`${index}`);

  return (
    <div
      className={classes.templateItem}
      style={{
        padding: `${component.margin.top}px ${component.margin.right}px ${component.margin.bottom}px ${component.margin.left}px`,
        border: index === editedIndex ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
        display: 'flex',
        justifyContent: component.position
      }}
    >
      {
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
      }
      {findComponent({ component, isPreview: false, editedIndex, index, editIsFocus, getValues, setValue, setDrag, drag })}
    </div>
  );
};

export default EmailTemplateItem;
