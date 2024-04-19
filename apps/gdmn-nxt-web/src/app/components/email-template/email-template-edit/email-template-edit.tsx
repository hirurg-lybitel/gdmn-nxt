import style from './email-template-edit.module.less';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Button, CardActions, CardContent, Divider, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Slider, Switch, TextField, Typography, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { EmailTemplate, IComponentPosition, baseComponent, componentTypes } from '../email-template';
import { RegisterOptions, UseFormGetValues, UseFormRegister, UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import DeleteIcon from '@mui/icons-material/Delete';
import { ChangeEvent, ChangeEventHandler, useEffect, useReducer, useRef, useState } from 'react';
import { CheckBox } from '@mui/icons-material';
import AlignHorizontalCenterIcon from '@mui/icons-material/AlignHorizontalCenter';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import AlignHorizontalRightIcon from '@mui/icons-material/AlignHorizontalRight';
import { SketchPicker } from 'react-color';
import ColorEdit from '@gdmn-nxt/components/Styled/colorEdit/colorEdit';
import { fontSize, fonts } from './font';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';

export interface EmailTemplateEditProps {
  editedIndex: number,
  close: () => void,
  getValues: UseFormGetValues<EmailTemplate>,
  setValue: UseFormSetValue<EmailTemplate>,
  register: (name: any, options?: RegisterOptions<EmailTemplate, any> | undefined) => UseFormRegisterReturn<any>,
  forceUpdate: React.DispatchWithoutAction,
  removeEl: (arg: number) => void;
  changeIsFocus: React.Dispatch<React.SetStateAction<boolean>>
}

const EmailTemplateEdit = (props: EmailTemplateEditProps) => {
  const { editedIndex, close, getValues, setValue, register, forceUpdate, removeEl, changeIsFocus } = props;
  const theme = useTheme();
  const component = getValues(`${editedIndex}`);

  const handleRemove = () => {
    removeEl(editedIndex);
  };

  const sizeSettings = (type: 'width' | 'height') => {
    const marks = [
      {
        value: 10,
        label: '10%',
      },
      {
        value: 1000,
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

    if (type === 'height') return <></>;

    return (
      <div>
        <Typography>
          {type === 'width' ? 'Ширина:' : 'Высота:'}
        </Typography>
        <div style={{ padding: '0 15px 0 15px ' }}>
          <Slider
            disabled={component[`${type}`]?.auto}
            onChange={handleWidthChange}
            marks={marks}
            size="small"
            min={10}
            value={component?.[`${type}`]?.value}
            aria-label="Small"
            valueLabelDisplay="auto"
          />
        </div>
        {!(component.type === 'divider' || component.type === 'image') &&
        <FormControlLabel
          sx={{ marginLeft: '0px' }}
          onClick={handleWidthAutoChange}
          control={<Switch checked={component[`${type}`]?.auto} />}
          label="Автоматически"
        />
        }
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

  const positionEdit = () => {
    const handleChange = (position: IComponentPosition) => () => {
      forceUpdate();
      setValue(`${editedIndex}.position`, position);
    };

    return (
      <>
        <Typography style={{ marginTop: '10px' }}>
          Позиционирование:
        </Typography>
        <div >
          <IconButton onClick={handleChange('start')} color={component.position === 'start' ? 'primary' : 'default'}>
            <AlignHorizontalLeftIcon fontSize="medium" />
          </IconButton>
          <IconButton onClick={handleChange('center')} color={component.position === 'center' ? 'primary' : 'default'}>
            <AlignHorizontalCenterIcon fontSize="medium" />
          </IconButton>
          <IconButton onClick={handleChange('end')} color={component.position === 'end' ? 'primary' : 'default'}>
            <AlignHorizontalRightIcon fontSize="medium" />
          </IconButton>
        </div>
      </>
    );
  };

  const baseComponent = () => {
    return (
      <>
        {component.width && sizeSettings('width')}
        {component.height && sizeSettings('height')}
        {component.padding && paddingEdit()}
        {component.position && positionEdit()}
      </>
    );
  };

  const ButtonComponent = () => {
    const handleTextColorChange = (color: string) => {
      forceUpdate();
      setValue(`${editedIndex}.color.text`, color);
    };
    const handleButtonColorChange = (color: string) => {
      forceUpdate();
      setValue(`${editedIndex}.color.button`, color);
    };
    const handleFontChange = (e: any) => {
      forceUpdate();
      setValue(`${editedIndex}.font.value`, e.target.value);
    };
    const handleFontSizeChange = (e: any) => {
      forceUpdate();
      setValue(`${editedIndex}.font.size`, e.target.value);
    };
    return (
      <div>
        <div>
          <TextField
            sx={{ marginTop: '10px' }}
            fullWidth
            {...register(`${editedIndex}.text`)}
            label="Текст кнопки"
          />
          <div style={{ display: 'flex' }}>
            <ColorEdit
              label={'цвет текста'}
              sx={{ marginTop: '10px' }}
              value={component.color?.text}
              onChange={handleTextColorChange}
            />
            <div style={{ width: '20px' }} />
            <ColorEdit
              label={'Цвет кнопки'}
              sx={{ marginTop: '10px' }}
              value={component.color?.button}
              onChange={handleButtonColorChange}
            />
          </div>
          <TextField
            sx={{ marginTop: '10px' }}
            fullWidth
            {...register(`${editedIndex}.url`)}
            label="Ссылка"
          />
          <FormControl sx={{ marginTop: '10px' }} fullWidth>
            <InputLabel sx={{ background: theme.palette.background.paper, padding: '0px 5px' }} >Шрифт</InputLabel>
            <Select
              value={component.font?.value}
              onChange={handleFontChange}
            >
              {fonts.map((font, index) => <MenuItem
                key={index}
                sx={{ fontFamily: font }}
                value={font}
              >{font}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl sx={{ marginTop: '10px' }} fullWidth>
            <InputLabel sx={{ background: theme.palette.background.paper, padding: '0px 5px' }} >Размер шрифта</InputLabel>
            <Select
              value={component.font?.size}
              onChange={handleFontSizeChange}
            >
              {fontSize.map((size, index) => <MenuItem
                key={index}
                value={size}
              >{size}px</MenuItem>)}
            </Select>
          </FormControl>
        </div>
        {baseComponent()}
      </div>
    );
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const ImageComponent = () => {
    const handleUploadImage = (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0] || undefined;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = (e) => {
        setValue(`${editedIndex}.image`, reader.result?.toString() ?? '');
        forceUpdate();
      };
    };
    const handleDeleteImage = () => {
      setValue(`${editedIndex}.image`, '');
      forceUpdate();
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };
    return (
      <div>
        {baseComponent()}
        <Typography>
            Изображение:
        </Typography>
        <div style={{ marginTop: '10px', display: 'flex' }}>
          <div style={{ position: 'relative' }}>
            <input
              id="input-file"
              hidden
              accept="image/*"
              type="file"
              onChange={handleUploadImage}
              ref={inputRef}
            />
            <Button size="medium" variant="contained" >
              <label className={style.upload} htmlFor="input-file" />
              Загрузить
            </Button>
          </div>
          <Button
            size="medium"
            style={{ marginLeft: '20px' }}
            color="error"
            onClick={handleDeleteImage}
          >Удалить</Button>
        </div>

      </div>
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
      case 'button': return ButtonComponent();
      case 'divider': return (
        <div>
          {baseComponent()}
        </div>
      );
      case 'image': return ImageComponent();
      default:return <div />;
    }
  };

  return (
    <CustomizedCard style={{ height: '100%' }}>
      <CardContent sx={{ paddingRight: 0 }}>
        <CustomizedScrollBox options={{ suppressScrollX: true }}>
          <div style={{ paddingRight: '16px' }}>
            {mainContent()}
          </div>
        </CustomizedScrollBox>
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
