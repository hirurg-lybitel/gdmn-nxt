import style from './email-template-edit.module.less';
import { Box, Button, CardContent, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Slider, Switch, TextField, Typography, useTheme } from '@mui/material';
import { IComponent, IComponentPosition } from '../email-template';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import AlignHorizontalCenterIcon from '@mui/icons-material/AlignHorizontalCenter';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import AlignHorizontalRightIcon from '@mui/icons-material/AlignHorizontalRight';
import ColorEdit from '@gdmn-nxt/components/Styled/colorEdit/colorEdit';
import { fontSize, fonts } from './font';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import Draft from '../draft/draft';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { ErrorTooltip } from '@gdmn-nxt/components/Styled/error-tooltip/error-tooltip';

export interface EmailTemplateEditProps {
  editedIndex: number,
  setValue: (stringIndex: string, newValue: any) => void,
  component: IComponent
}

const EmailTemplateEdit = (props: EmailTemplateEditProps) => {
  const { editedIndex, setValue, component } = props;
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

    const handleWidthChange = (event: Event, value: number | number[]) => {
      setValue(`${editedIndex}.width.value`, value as number);
    };

    const handleWidthAutoChange = () => {
      setValue(`${editedIndex}.width.auto`, !component.width?.auto);
    };

    return (
      <div>
        <div className={style.widthHeader}>
          <Typography>
            Ширина:
          </Typography>
          {!(component.type === 'divider' || component.type === 'image') &&
            <FormControlLabel
              sx={{ marginLeft: '0px', marginRight: 0 }}
              onClick={handleWidthAutoChange}
              control={<Switch checked={component.width?.auto} />}
              label="Автоматически"
            />
          }
        </div>
        <div style={{ padding: '0 20px 0 15px' }}>
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
      </div>
    );
  };

  const paddingEdit = (type: 'inside' | 'outside') => {
    type Sides = 'top' | 'left' | 'right' | 'bottom' | 'common';

    const paddingType = type === 'inside' ? 'padding' : 'margin';

    const handleChange = (side: Sides) => (e: any) => {
      const padding = (e.target?.value).length === 0 ? 0 : Number(e.target?.value);
      if (padding < 0) return;
      if (isNaN(padding)) return;
      if (padding > 99) return;
      setValue(`${editedIndex}.${paddingType}.${side}`, padding);
    };

    const handleChangeMode = () => {
      setValue(`${editedIndex}.${paddingType}.isCommon`, !component[`${paddingType}`]?.isCommon);
    };

    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Typography >
            {type === 'inside' ? 'Внутренний отступ: ' : 'Отступ: '}
          </Typography>
          <Box flex={1}/>
          <FormControlLabel
            sx={{ marginLeft: '0px', marginRight: 0 }}
            onClick={handleChangeMode}
            control={<Switch checked={component[`${paddingType}`]?.isCommon} />}
            label="Общий"
          />
        </div>
        {component[`${paddingType}`]?.isCommon
          ? <TextField
            style={{ width: '75px', marginTop: '10px' }}
            value={component[`${paddingType}`]?.common + ''}
            onChange={handleChange('common')}
            label="Общий"
            type="number"
          />
          : (
            <div style={{ display: 'flex', columnGap: 10, marginTop: 10 }}>
              <TextField
                value={component[`${paddingType}`]?.top + ''}
                onChange={handleChange('top')}
                label="Сверху"
                type="number"
              />
              <TextField
                value={component[`${paddingType}`]?.bottom + ''}
                onChange={handleChange('bottom')}
                label="Снизу"
                type="number"
              />
              <TextField
                value={component[`${paddingType}`]?.left + ''}
                onChange={handleChange('left')}
                label="Слева"
                type="number"
              />
              <TextField
                value={component[`${paddingType}`]?.right + ''}
                onChange={handleChange('right')}
                label="Справа"
                type="number"
              />
            </div>
          )
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
            <AlignHorizontalLeftIcon sx={{ fontSize: '22px' }} />
          </IconButton>
          <IconButton onClick={handleChange('center')} color={component.position === 'center' ? 'primary' : 'default'}>
            <AlignHorizontalCenterIcon sx={{ fontSize: '22px' }} />
          </IconButton>
          <IconButton onClick={handleChange('end')} color={component.position === 'end' ? 'primary' : 'default'}>
            <AlignHorizontalRightIcon sx={{ fontSize: '22px' }} />
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

  const [urlValue, setUrlValue] = useState<{value: string, error: string|null}>({ value: component?.url || '', error: null });

  useEffect(() => setUrlValue({ ...urlValue, value: component?.url || '' }), [component?.url]);

  const ButtonComponent = () => {
    const handleTextColorChange = (color: string) => {
      setValue(`${editedIndex}.color.text`, color);
    };
    const handleTextColorAutoChange = () => {
      setValue(`${editedIndex}.color.textAuto`, !component.color?.textAuto);
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
      const value = e.target?.value;

      if (value.indexOf('https://') === -1 && value.indexOf('http://') === -1 && value !== '') {
        setUrlValue({ ...urlValue, value, error: 'Некорректный URL' });
        return;
      }
      setUrlValue({ ...urlValue, value, error: null });
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
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px', justifyContent: 'space-between' }}>
            <ColorEdit
              label={'Цвет текста'}
              sx={{ marginTop: '10px' }}
              value={component.color?.text}
              onChange={handleTextColorChange}
            />
            <FormControlLabel
              sx={{ marginLeft: '0px', marginRight: 0, paddingLeft: '10px', paddingTop: '5px' }}
              onClick={handleTextColorAutoChange}
              control={<Switch checked={component.color?.textAuto} />}
              label="Автоматически"
            />
          </div>
          <div style={{ display: 'flex', marginTop: '10px' }}>
            <ColorEdit
              label={'Цвет кнопки'}
              sx={{ marginTop: '10px' }}
              value={component.color?.button}
              onChange={handleButtonColorChange}
            />
          </div>
          <ErrorTooltip
            open={!!urlValue.error}
            title={urlValue.error}
          >

            <TextField
              sx={{ marginTop: '15px' }}
              fullWidth
              value={urlValue.value}
              onChange={handleUrlChange}
              label="Ссылка"
            />
          </ErrorTooltip>
          <div style={{ display: 'flex' }}>
            <FormControl sx={{ marginTop: '15px', marginRight: '10px' }} fullWidth>
              <InputLabel sx={{ background: theme.palette.background.paper, padding: '0px 5px' }} >Шрифт</InputLabel>
              <Select
                sx={{ '& .MuiSelect-select': { padding: '8.5px 14px' } }}
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
            <FormControl sx={{ marginTop: '15px' }} fullWidth>
              <InputLabel sx={{ background: theme.palette.background.paper, padding: '0px 5px' }} >Размер шрифта</InputLabel>
              <Select
                sx={{ '& .MuiSelect-select': { padding: '8.5px 14px' } }}
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
        </div>
        <div style={{ height: '5px' }} />
        {baseComponent()}
      </div>
    );
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);

  const ImageComponent = () => {
    const handleUploadImage = (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0] || undefined;
      if (file.size > 1000000) {
        setError('Максимальный размер файла 1Mb');
        setTimeout(() => {
          setError(null);
        }, 1000 * 10);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = (e) => {
        console.log(reader);
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
        <div style={{ marginTop: '10px', display: 'flex', columnGap: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              id="input-file"
              hidden
              accept="image/*"
              type="file"
              onChange={handleUploadImage}
              ref={inputRef}
            />
            <ErrorTooltip
              open={!!error}
              title={error}
            >
              <Button
                size="medium"
                fullWidth
                variant="contained"
                startIcon={<UploadFileIcon />}
              >
                <label className={style.upload} htmlFor="input-file"/>
              Загрузить
              </Button>
            </ErrorTooltip>
          </div>
          <div style={{ flex: 1 }}>
            <Button
              size="medium"
              fullWidth
              startIcon={<DeleteForeverIcon />}
              variant={'outlined'}
              onClick={handleDeleteImage}
            >
              <label>Очистить</label>
            </Button>
          </div>
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
    <>
      <CustomizedCard style={{ height: '100%', background: 'none' }}>
        <CardContent sx={{ paddingRight: 0, paddingLeft: '0', paddingTop: '20px' }}>
          <CustomizedScrollBox options={{ suppressScrollX: true }} style={{ paddingLeft: '25px', paddingRight: '25px' }}>
            <div>
              {mainContent()}
            </div>
          </CustomizedScrollBox>
        </CardContent>
      </CustomizedCard>
    </>
  );
};

export default EmailTemplateEdit;
