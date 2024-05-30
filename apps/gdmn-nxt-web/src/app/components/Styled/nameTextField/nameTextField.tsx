import { ClickAwayListener, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, OutlinedInputProps, Stack, TextField, Tooltip, TooltipProps, tooltipClasses } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CustomizedCard from '../customized-card/customized-card';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material';

export function NameTextFieldContainer () {
  return <div style={{ width: '100%' }}>
    <NameTextField fullWidth/>
  </div>;
}

export interface INameTextFieldProps extends OutlinedInputProps{
  onChangeName?: (value: string) => void
}

export function NameTextField (props: INameTextFieldProps) {
  const [open, setOpen] = useState(false);

  const { ...style } = props;

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

  const [name, setName] = useState({ lastName: '', firstName: '', patronymic: '' });

  const handleChange = (type: 'lastName' | 'firstName' | 'patronymic' | 'all', value: string) => {
    if (type === 'all') {
      const newName = value.replace(/\s{2,}/g, ' ').split(' ');
      if (newName.length > 3) return;
      setName({
        lastName: (newName[0] || '') + ((value[value.length - 1] === ' ' && newName.length === 2) ? ' ' : ''),
        firstName: (newName[1] || '') + ((value[value.length - 1] === ' ' && newName.length === 3) ? ' ' : ''),
        patronymic: newName[2] || '' }
      );
      return;
    };
    const newName = { ...name };
    newName[`${type}`] = value.replaceAll(' ', '');
    setName(newName);
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <FormControl
        size="small"
        ref={ref}
        fullWidth={style.fullWidth}
        sx={{ m: 1, width, margin: 0, position: 'relative', }}
        variant="outlined"
        onClick={handleOpen}
      >
        <InputLabel style={{ zIndex: 2 }} >ФИО</InputLabel>
        <OutlinedInput
          label="ФИО"
          {...style}
          style={{ width: '100%', height: '40px', zIndex: 1, background }}
          value={name.lastName + (name.firstName && ' ' + name.firstName) + (name.patronymic && ' ' + name.patronymic)}
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
            <Stack spacing={2} style={{ padding: '10px' }}>
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

