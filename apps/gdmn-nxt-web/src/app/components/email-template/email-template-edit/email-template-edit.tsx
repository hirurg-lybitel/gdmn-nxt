import style from './email-template-edit.module.less';
import { Box, Button, CardActions, CardContent, Divider, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Slider, Switch, TextField, Typography, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IComponent, IComponentPosition } from '../email-template';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { ChangeEvent, useRef, useState } from 'react';
import AlignHorizontalCenterIcon from '@mui/icons-material/AlignHorizontalCenter';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import AlignHorizontalRightIcon from '@mui/icons-material/AlignHorizontalRight';
import ColorEdit from '@gdmn-nxt/components/Styled/colorEdit/colorEdit';
import { fontSize, fonts } from './font';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import Draft from '../draft/draft';

export interface EmailTemplateEditProps {
  editedIndex: number,
  close: () => void,
  setValue: (stringIndex: string, newValue: any) => void,
  removeEl: (index: number) => void;
  copy: (index: number) => void,
  component: IComponent,
  length: number
}

const EmailTemplateEdit = (props: EmailTemplateEditProps) => {
  const { editedIndex, close, setValue, removeEl, component, length } = props;
  const theme = useTheme();

  const sizeSettings = () => {
    const marks = [
      {
        value: 10,
        label: '10%',
      },
      {
        value: 100,
        label: '100%'
      },
    ];

    const handleWidthChange = (event: Event, value: number | number[], activeThumb: number) => {
      setValue(`${editedIndex}.width.value`, value as number);
    };

    const handleWidthAutoChange = () => {
      setValue(`${editedIndex}.width.auto`, !component.width?.auto);
    };

    return (
      <div>
        <Typography>
          {'Ширина:'}
        </Typography>
        <div style={{ padding: '0 15px 0 15px ' }}>
          <Slider
            disabled={component.width?.auto}
            onChange={handleWidthChange}
            marks={marks}
            size="small"
            min={10}
            value={component.width?.value}
            aria-label="Small"
            valueLabelDisplay="auto"
          />
        </div>
        {!(component.type === 'divider' || component.type === 'image') &&
        <FormControlLabel
          sx={{ marginLeft: '0px' }}
          onClick={handleWidthAutoChange}
          control={<Switch checked={component.width?.auto} />}
          label="Автоматически"
        />
        }
      </div>
    );
  };

  const paddingEdit = (type: 'inside' | 'outside') => {
    type Sides = 'top' | 'left' | 'right' | 'bottom' | 'all';

    const paddingType = type === 'inside' ? 'padding' : 'margin';

    const handleChange = (side: Sides) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (side === 'all') {
        handleChange('top')(e);
        handleChange('left')(e);
        handleChange('right')(e);
        handleChange('bottom')(e);
      } else {
        const padding = (e.target?.value).length === 0 ? 0 : Number(e.target?.value);
        if (isNaN(padding)) return;
        if (padding > 99) return;
        setValue(`${editedIndex}.${paddingType}.${side}`, padding);
      }
    };

    const handleChangeMode = () => {
      setValue(`${editedIndex}.${paddingType}.common`, !component[`${paddingType}`]?.common);
    };

    return (
      <>
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center  ' }}>
          <Typography >
            {type === 'inside' ? 'Внутренний отступ: ' : 'Отступ: '}
          </Typography>
          <Box flex={1}/>
          <FormControlLabel
            onClick={handleChangeMode}
            control={<Switch checked={component[`${paddingType}`]?.common} />}
            label="Общий"
          />
        </div>
        {component[`${paddingType}`]?.common
          ? <TextField
            fullWidth
            value={component[`${paddingType}`]?.top}
            onChange={handleChange('all')}
            label="Общий"
            />
          : <><div style={{ display: 'flex', marginBottom: '10px' }}>
            <TextField
              style={{ marginRight: '10px' }}
              value={component[`${paddingType}`]?.top}
              onChange={handleChange('top')}
              label="Верх"
            />
            <TextField
              value={component[`${paddingType}`]?.bottom}
              onChange={handleChange('bottom')}
              label="Низ"
            />
          </div>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <TextField
              style={{ marginRight: '10px' }}
              value={component[`${paddingType}`]?.left}
              onChange={handleChange('left')}
              label="Лево"
            />
            <TextField
              value={component[`${paddingType}`]?.right}
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
      setValue(`${editedIndex}.position`, position);
    };

    return (
      <>
        <Typography style={{ marginTop: '10px' }}>
          Позиционирование:
        </Typography>
        <div >
          <IconButton onClick={handleChange('start')} color={component.position === 'start' ? 'primary' : 'default'}>
            <AlignHorizontalLeftIcon />
          </IconButton>
          <IconButton onClick={handleChange('center')} color={component.position === 'center' ? 'primary' : 'default'}>
            <AlignHorizontalCenterIcon />
          </IconButton>
          <IconButton onClick={handleChange('end')} color={component.position === 'end' ? 'primary' : 'default'}>
            <AlignHorizontalRightIcon />
          </IconButton>
        </div>
      </>
    );
  };

  const baseComponent = () => {
    return (
      <>
        {component.width && sizeSettings()}
        {component.margin && paddingEdit('outside')}
        {component.padding && paddingEdit('inside')}
        {component.position && positionEdit()}
      </>
    );
  };

  const ButtonComponent = () => {
    const handleTextColorChange = (color: string) => {
      setValue(`${editedIndex}.color.text`, color);
    };
    const handleButtonColorChange = (color: string) => {
      setValue(`${editedIndex}.color.button`, color);
    };
    const handleFontChange = (e: SelectChangeEvent<string>) => {
      setValue(`${editedIndex}.font.value`, e.target?.value);
    };
    const handleFontSizeChange = (e: SelectChangeEvent<number>) => {
      setValue(`${editedIndex}.font.size`, Number(e.target?.value));
    };

    const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(`${editedIndex}.text`, e.target?.value);
    };

    const handleUrlChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(`${editedIndex}.url`, e.target?.value);
    };

    return (
      <div>
        <div>
          <TextField
            sx={{ marginTop: '10px' }}
            fullWidth
            value={component.text}
            onChange={handleTextChange}
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
            value={component.url}
            onChange={handleUrlChange}
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
      };
    };
    const handleDeleteImage = () => {
      setValue(`${editedIndex}.image`, '');
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
            <div style={{ paddingTop: '10px' }}>
              <Draft
                length={length}
                setValue={setValue}
                editedIndex={editedIndex}
                component={component}
              />
            </div>
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
    <CustomizedCard style={{ height: '100%', background: 'none' }}>
      <CardActions sx={{ padding: '3px' }}>
        {/* <IconButton
          size="small"
          onClick={handleConfirmOpen}
        >
          <DeleteIcon />
        </IconButton>
        <IconButton onClick={handleCopy}>
          <ContentCopyIcon />
        </IconButton> */}
        <Box flex={1}/>
        <IconButton onClick={close} size="small"><CloseIcon /></IconButton>
      </CardActions>
      <Divider/>
      <CardContent sx={{ paddingRight: 0, paddingTop: '10px' }}>
        <CustomizedScrollBox options={{ suppressScrollX: true }}>
          <div style={{ paddingRight: '16px' }}>
            {mainContent()}
          </div>
        </CustomizedScrollBox>
      </CardContent>
    </CustomizedCard>
  );
};

export default EmailTemplateEdit;
