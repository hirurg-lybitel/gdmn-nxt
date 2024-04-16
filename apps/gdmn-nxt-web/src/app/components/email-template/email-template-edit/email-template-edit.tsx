import style from './email-template.module.less';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Button, CardActions, CardContent, Divider, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Slider, Switch, TextField, Typography, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { EmailTemplate, baseComponent, componentTypes } from '../email-template';
import { UseFormGetValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useReducer, useState } from 'react';
import { CheckBox } from '@mui/icons-material';
import { fontSizes, fonts } from '../fonts';

export interface EmailTemplateEditProps {
  editedIndex: number,
  close: () => void,
  getValues: UseFormGetValues<EmailTemplate>,
  setValue: UseFormSetValue<EmailTemplate>,
  register: UseFormRegister<EmailTemplate>,
  forceUpdate: React.DispatchWithoutAction
}

const EmailTemplateEdit = (props: EmailTemplateEditProps) => {
  const { editedIndex, close, getValues, setValue, register, forceUpdate } = props;

  const component = getValues(`${editedIndex}`);

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
    console.log(component);
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
        <FormControlLabel
          onClick={handleWidthAutoChange}
          control={<Switch checked={component[`${type}`]?.auto} />}
          label="Автоматически"
        />
      </div>
    );
  };

  const baseComponent = () => {
    return (
      <>
        {sizeSettings('width')}
        {sizeSettings('height')}
      </>
    );
  };

  const mainContent = () => {
    switch (component.type) {
      case 'text': {
        const handleFontChange = (e: SelectChangeEvent) => {
          forceUpdate();
          setValue(`${editedIndex}.font`, e.target?.value);
        };
        const handleFontSizeChange = (e: SelectChangeEvent) => {
          forceUpdate();
          setValue(`${editedIndex}.fontSize`, Number(e.target?.value));
        };
        const handleSpacingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = Number(e.target.value);
          if (isNaN(value)) return;
          if (value > 999) return;
          setValue(`${editedIndex}.letterSpacing`, value);
          forceUpdate();
        };
        return (
          <>
            {sizeSettings('width')}
          </>
        );
      }
      case 'button': return (
        <div>
            Кнопка
        </div>
      );
      case 'divider': return (
        <div>
            Разделитель
        </div>
      );
      case 'image': return (
        <div>
            Картинка
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
        <IconButton size="small"><DeleteIcon /></IconButton>
        <Box flex={1}/>
        <IconButton onClick={close} size="small"><CloseIcon /></IconButton>
      </CardActions>
    </CustomizedCard>
  );
};

export default EmailTemplateEdit;
