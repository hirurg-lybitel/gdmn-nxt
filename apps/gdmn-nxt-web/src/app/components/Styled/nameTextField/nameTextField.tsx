import { ClickAwayListener, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, OutlinedInputProps, Stack, TextField } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material';

export function NameTextFieldTest ({ type }: {type?: 'string' |'object'}) {
  const [name, setName] = useState('');
  const [objectName, setObjectName] = useState({ lastName: '', firstName: '', patronymic: '' });

  const stringComponent = <div style={{ width: '100%' }}>
  String
    <NameTextField
      onChangeName={(value) => setName(value)}
      value={name}
      fullWidth
    />
  </div>;

  const objectComponent = <div style={{ width: '100%' }}>
  Object
    <NameTextField
      onChangeName={(value, obj) => setObjectName(obj)}
      nameObject={objectName}
      fullWidth
    />
  </div>;

  if (type === 'string') return stringComponent;
  if (type === 'object') return objectComponent;
  return <>
    {stringComponent}
    {objectComponent}
  </>;
}

export type IName = { lastName: string, firstName: string, patronymic: string }

export interface INameTextFieldProps extends OutlinedInputProps{
  onChangeName?: (value: string, object: IName) => void
  nameObject?: IName
}

export function NameTextField (props: INameTextFieldProps) {
  const [open, setOpen] = useState(false);

  const { onChangeName, value, nameObject, ...style } = props;

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const defaultWidth = 300;

  const ref = useRef(null);

  const width = style.fullWidth ? 'uato' : props.style?.width || (props.sx as any)?.width || defaultWidth + 'px';
  const [tolltipWidth, setTolltipWidth] = useState((ref.current as any)?.offsetWidth);

  useEffect(() => {
    const resize = () => setTolltipWidth((ref.current as any)?.offsetWidth);
    if (tolltipWidth) resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const theme = useTheme();

  const background = theme.palette.background.paper;

  const [name, setName] = useState<IName>({ lastName: '', firstName: '', patronymic: '' });

  const parseFullname = (value: string) => {
    const newName = value?.replace(/\s{2,}/g, ' ').split(' ');
    if (newName?.length > 3) return '';
    return {
      lastName: (newName[0] || '') + ((value[value?.length - 1] === ' ' && newName?.length === 2) ? ' ' : ''),
      firstName: (newName[1] || '') + ((value[value?.length - 1] === ' ' && newName?.length === 3) ? ' ' : ''),
      patronymic: newName[2] || ''
    };
  };

  const converToFullname = (fullName: IName) => fullName.lastName + (fullName.firstName && ((fullName.lastName ? ' ' : '')
  + fullName.firstName)) + (fullName.patronymic && (fullName.firstName || fullName.lastName ? ' ' : '') + fullName.patronymic);

  const handleChange = (type: 'lastName' | 'firstName' | 'patronymic' | 'all', value: string) => {
    if (type === 'all') {
      const newValue = parseFullname(value);
      if (newValue === '') return;
      setName(newValue);
      onChangeName && onChangeName(converToFullname(newValue), newValue);
      return;
    };
    const newName = { ...name };
    newName[`${type}`] = value?.replaceAll(' ', '');
    setName(newName);
    onChangeName && onChangeName(converToFullname(newName), newName);
  };

  useEffect(() => {
    if (!value) return;
    const newValue = parseFullname(value as string);
    if (newValue === '') return;
    if (value === converToFullname(name)) return;
    setName(newValue);
    return;
  }, [value]);

  useEffect(() => {
    if (!nameObject) return;
    setName(nameObject);
    return;
  }, [nameObject]);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <FormControl
        size="small"
        ref={ref}
        fullWidth={style.fullWidth}
        sx={{ m: 1, width, margin: 0, position: 'relative', }}
        variant="outlined"
      >
        <InputLabel >ФИО</InputLabel>
        <OutlinedInput
          label="ФИО"
          {...style}
          onClick={!open ? handleOpen : undefined}
          style={{ width: '100%', height: '40px', background }}
          value={converToFullname(name)}
          onChange={(e) => handleChange('all', e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton size="small" onClick={open ? handleClose : handleOpen}>
                {open ? <ArrowDropUpIcon/> : <ArrowDropDownIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          }
        />
        {open &&
        <div data-testid="name-text-field-popup" style={{ position: 'absolute', left: '0', right: '0', top: '40px', zIndex: '1400' }}>
          <div style={{ width: tolltipWidth, paddingTop: '0px', background, borderRadius: '15px' }}>
            <Stack spacing={2} style={{ padding: '10px', paddingTop: '15px' }}>
              <TextField
                value={name.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                label={'Фамилия'}
                fullWidth
              />
              <TextField
                value={name.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                label={'Имя'}
                fullWidth
              />
              <TextField
                value={name.patronymic}
                onChange={(e) => handleChange('patronymic', e.target.value)}
                label={'Отчество'}
                fullWidth
              />
            </Stack>
          </div>
        </div>
        }
      </FormControl>
    </ClickAwayListener>
  );
}

