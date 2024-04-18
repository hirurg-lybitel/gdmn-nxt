import style from './email-template.module.less';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Button, CardActions, CardContent, Divider, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Slider, Switch, TextField, Typography, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { EmailTemplate, baseComponent, componentTypes } from '../email-template';
import { UseFormGetValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import DeleteIcon from '@mui/icons-material/Delete';
import { ChangeEventHandler, useEffect, useReducer, useState } from 'react';
import { CheckBox } from '@mui/icons-material';

export interface EmailTemplateEditProps {
  editedIndex: number,
  close: () => void,
  getValues: UseFormGetValues<EmailTemplate>,
  setValue: UseFormSetValue<EmailTemplate>,
  register: UseFormRegister<EmailTemplate>,
  forceUpdate: React.DispatchWithoutAction,
  removeEl: (arg: number) => void;
  changeIsFocus: React.Dispatch<React.SetStateAction<boolean>>
}

const EmailTemplateEdit = (props: EmailTemplateEditProps) => {
  const { editedIndex, close, getValues, setValue, register, forceUpdate, removeEl, changeIsFocus } = props;

  const component = getValues(`${editedIndex}`);

  const handleRemove = () => {
    removeEl(editedIndex);
  };

  const sizeSettings = (type: 'width' | 'height') => {
    const marks = [
      {
        value: 20,
        label: '20%',
      },
      {
        value: 100,
        label: '100%'
      },
    ];

    const handleWidthChange = (event: Event, value: number | number[], activeThumb: number) => {
      forceUpdate();
      setValue(`${editedIndex}.${type}.value`, value as number);
    };

    const handleWidthAutoChange = () => {
      forceUpdate();
      setValue(`${editedIndex}.${type}.auto`, !component[`${type}`]?.auto);
    };
    return (
      <div>
        <Typography>
          {type === 'width' ? 'Ширина:' : 'Высота:'}
        </Typography>
        <div style={{ padding: '0 15px 0 15px ' }}>
          <Slider
            onChange={handleWidthChange}
            marks={marks}
            size="small"
            min={20}
            value={component?.[`${type}`]?.value}
            aria-label="Small"
            valueLabelDisplay="auto"
          />
        </div>
        {/* <FormControlLabel
          onClick={handleWidthAutoChange}
          control={<Switch checked={component[`${type}`]?.auto} />}
          label="Автоматически"
        /> */}
      </div>
    );
  };

  const paddingEdit = () => {
    type Sides = 'top' | 'left' | 'right' | 'bottom' | 'all';

    const handleChange = (side: Sides) => (e: any) => {
      if (side === 'all') {
        handleChange('top')(e);
        handleChange('left')(e);
        handleChange('right')(e);
        handleChange('bottom')(e);
      } else {
        const padding = (e.target.value).length === 0 ? 0 : Number(e.target.value);
        if (isNaN(padding)) return;
        if (padding > 99) return;
        setValue(`${editedIndex}.padding.${side}`, padding);
      }
      forceUpdate();
    };

    const handleChangeMode = () => {
      forceUpdate();
      setValue(`${editedIndex}.padding.common`, !component.padding.common);
    };

    return (
      <>
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center  ' }}>
          <Typography >
          Отступ:
          </Typography>
          <Box flex={1}/>
          <FormControlLabel
            onClick={handleChangeMode}
            control={<Switch checked={component.padding.common} />}
            label="Общий"
          />
        </div>
        {component.padding.common
          ? <TextField
            fullWidth
            value={component.padding.top}
            onChange={handleChange('all')}
            label="Общий"
            />
          : <><div style={{ display: 'flex', marginBottom: '10px' }}>
            <TextField
              style={{ marginRight: '10px' }}
              value={component.padding.top}
              onChange={handleChange('top')}
              label="Верх"
            />
            <TextField
              value={component.padding.bottom}
              onChange={handleChange('bottom')}
              label="Низ"
            />
          </div>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <TextField
              style={{ marginRight: '10px' }}
              value={component.padding.left}
              onChange={handleChange('left')}
              label="Лево"
            />
            <TextField
              value={component.padding.right}
              onChange={handleChange('right')}
              label="Право"
            />
          </div>
          </>
        }
      </>

    );
  };

  const baseComponent = () => {
    return (
      <>
        {component.width && sizeSettings('width')}
        {component.height && sizeSettings('height')}
        {component.padding && paddingEdit()}
      </>
    );
  };

  const mainContent = () => {
    switch (component?.type) {
      case 'text': {
        return (
          <>
            {baseComponent()}
          </>
        );
      }
      case 'button': return (
        <div>
          {baseComponent()}
        </div>
      );
      case 'divider': return (
        <div>
          {baseComponent()}
        </div>
      );
      case 'image': return (
        <div>
          {baseComponent()}
        </div>
      );
      default:return <div />;
    }
  };

  return (
    <CustomizedCard style={{ height: '100%' }}>
      <CardContent>
        {mainContent()}
      </CardContent>
      <Divider />
      <CardActions>
        <IconButton
          size="small"
          onClick={handleRemove}
        >
          <DeleteIcon />
        </IconButton>
        <Box flex={1}/>
        <IconButton onClick={close} size="small"><CloseIcon /></IconButton>
      </CardActions>
    </CustomizedCard>
  );
};

export default EmailTemplateEdit;
