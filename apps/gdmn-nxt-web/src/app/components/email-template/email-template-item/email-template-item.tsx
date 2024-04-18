import style from './email-template.module.less';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button, Divider, IconButton, TextField, Theme, useTheme } from '@mui/material';
import { useEffect, useReducer, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { UseFormGetValues, UseFormSetValue, useForm } from 'react-hook-form';
import Draft from '../draft/draft';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import { EmailTemplate, IComponent } from '../email-template';

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
}


const EmailTemplateItem = (props: EmailTemplateItemProps) => {
  const theme = useTheme();
  const { editedIndex, index, editIsFocus, getValues, setValue } = props;
  const component = getValues(`${index}`);

  const classes = useStyles();

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
        return (<div style={{ background: 'blue' }}>Картинка</div>);
      case 'button':
        return <Button>Кнопка</Button>;
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
        border: index === editedIndex ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent'
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
      <div style={{ display: 'flex' }}>
        {findComponent()}
      </div>
    </div>
  );
};

export default EmailTemplateItem;
