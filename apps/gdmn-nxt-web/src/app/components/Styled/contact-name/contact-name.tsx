import styles from './contact-name.module.less';
import { Box, ClickAwayListener, Collapse, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput, OutlinedInputProps, Stack, TextField } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { ChangeEvent, useCallback, useRef, useState } from 'react';
import { IContactName } from '@gsbelarus/util-api-types';
import { parseContactName, parseStringToContactName } from '@gsbelarus/util-useful';

export interface IContactNameProps extends Omit<OutlinedInputProps, 'value' | 'onChange'>{
  value?: IContactName;
  onChange?: (value: IContactName) => void;
  helperText?: string;
}

function ContactName ({
  value = {
    lastName: '',
    nickName: ''
  },
  onChange,
  helperText = '',
  ...props
}: Readonly<IContactNameProps>) {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const ref = useRef(null);

  const handleChange = useCallback(
    (type: 'lastName' | 'firstName' | 'middleName' | 'fullName') =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const fieldValue = e.target.value;

        if (type === 'fullName') {
          const newContactName = parseStringToContactName(fieldValue);

          onChange && onChange(newContactName);
          return;
        }
        const newContactName: IContactName = parseContactName({
          ...value,
          [type]: fieldValue.trim()
        });

        onChange && onChange(newContactName);
      }, [onChange, value]);

  const expandClick = () => setOpen(prev => !prev);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <FormControl
        className={styles.root}
        size="small"
        ref={ref}
        fullWidth={props.fullWidth}
      >
        <InputLabel>{props.label ?? ''}</InputLabel>
        <OutlinedInput
          aria-describedby="contact-name-helper-text"
          label={props.label}
          {...props}
          onChange={handleChange('fullName')}
          value={value?.nickName ?? null}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={expandClick}>
                {open ? <ArrowDropUpIcon/> : <ArrowDropDownIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          }
        />
        <FormHelperText
          id="contact-name-helper-text"
          error={props.error}
        >
          {typeof helperText === 'string' ? helperText : ''}
        </FormHelperText>
        <Box
          data-testid="name-text-field-popup"
          className={styles.popup}
          sx={{ boxShadow: 3 }}
        >
          <Collapse in={open}>
            <Stack
              spacing={2}
              className={styles.list}
            >
              <TextField
                value={value?.lastName ?? ''}
                onChange={handleChange('lastName')}
                label={'Фамилия'}
                fullWidth
              />
              <TextField
                value={value?.firstName ?? ''}
                onChange={handleChange('firstName')}
                label={'Имя'}
                fullWidth
              />
              <TextField
                value={value?.middleName ?? ''}
                onChange={handleChange('middleName')}
                label={'Отчество'}
                fullWidth
              />
            </Stack>
          </Collapse>
        </Box>
      </FormControl>
    </ClickAwayListener>
  );
}

export default ContactName;
