import style from './email-template.module.less';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button, Divider, IconButton, TextField, Theme, useTheme } from '@mui/material';
import { useEffect, useReducer, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { UseFormGetValues, UseFormSetValue, useForm } from 'react-hook-form';
import Draft from '../draft/draft';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import { EmailTemplate, IComponent } from '../email-template';
import ImageIcon from '@mui/icons-material/Image';

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

interface EmailTemplateItemProps{
  editedIndex: number | null,
  index: number,
  editIsFocus: boolean,
  getValues: UseFormGetValues<EmailTemplate>,
  setValue: UseFormSetValue<EmailTemplate>,
  editUnFocus: () => void
}


const EmailTemplateItem = (props: EmailTemplateItemProps) => {
  const theme = useTheme();
  const { editedIndex, index, editIsFocus, getValues, setValue, editUnFocus } = props;
  const component = getValues(`${index}`);

  const classes = useStyles();

  console.log(component);

  const findComponent = () => {
    switch (component.type) {
      case 'text':
        return (
          <Draft
            isOpen={editIsFocus && index === editedIndex}
            width={component.width.auto ? 'auto' : component.width.value + '%'}
            setValue={setValue}
            getValues={getValues}
            editedIndex={index || 0}
          />
        );
      case 'image':
        return (
          <>
            {component.image
              ? <img
                style={{ width: `${component.width.value}%` }}
                src={component.image}
              />
              : <ImageIcon fontSize="large" />
            }
          </>
        );
      case 'button':
        return <div
          onClick={() => {
            // window.open(component.url, '_blank');
          }}
          style={{
            width: component.width.auto ? 'auto' : component.width.value + '%',
            backgroundColor: component.color?.button,
            color: component.color?.text,
            padding: '6px 8px',
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
            <Divider />
          </div>);
      default: return <div />;
    }
  };

  return (
    <div
      className={classes.templateItem}
      style={{
        padding: `${component.padding.top}px ${component.padding.right}px ${component.padding.bottom}px ${component.padding.left}px`,
        border: index === editedIndex ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
        display: 'flex',
        justifyContent: component.position
      }}
    >
      {
        <div
          className={classes.templateIcon}
          style={{
            visibility: index === editedIndex ? 'visible' : 'hidden'
          }}
        >
          <ZoomOutMapIcon sx={{ fontSize: '15px' }} style={{ transform: 'rotate(0.125turn)' }}/>
        </div>
      }
      {findComponent()}
    </div>
  );
};

export default EmailTemplateItem;
