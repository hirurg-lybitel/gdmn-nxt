import { ClickAwayListener, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, OutlinedInputProps, Stack, TextField, Tooltip, TooltipProps, tooltipClasses } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CustomizedCard from '../customized-card/customized-card';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material';

export function NameTextFieldContainer () {
  const [name, setName] = useState('1 2 3');
  useEffect(() => console.log(name), [name]);
  return <div style={{ width: '100%' }}>
    <NameTextField
      onChangeName={(value) => setName(value)}
      value={name}
      nameObject={{ lastName: '123', firstName: '456', patronymic: '7d89' }}
    />
  </div>;
}

export type IName = { lastName: string, firstName: string, patronymic: string }

export interface INameTextFieldProps extends OutlinedInputProps{
  onChangeName?: (value: string, object: IName) => void
  nameObject: IName
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
    const newName = value.replace(/\s{2,}/g, ' ').split(' ');
    if (newName.length > 3) return '';
    return {
      lastName: (newName[0] || '') + ((value[value.length - 1] === ' ' && newName.length === 2) ? ' ' : ''),
      firstName: (newName[1] || '') + ((value[value.length - 1] === ' ' && newName.length === 3) ? ' ' : ''),
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
    newName[`${type}`] = value.replaceAll(' ', '');
    setName(newName);
    onChangeName && onChangeName(converToFullname(newName), newName);
  };

  useEffect(() => {
    const newValue = parseFullname(value as string);
    if (newValue === '') return;
    if (value === converToFullname(name)) return;
    setName(newValue);
    return;
  }, [value]);

  useEffect(() => {
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
        <InputLabel style={{ zIndex: 2 }} >ФИО</InputLabel>
        <OutlinedInput
          label="ФИО"
          {...style}
          onClick={!open ? handleOpen : undefined}
          style={{ width: '100%', height: '40px', zIndex: 1, background }}
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
        <div style={{ position: 'absolute', left: '0', right: '0', top: '0px' }}>
          <div style={{ width: tolltipWidth, paddingTop: '40px', background, borderRadius: '15px' }}>
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

