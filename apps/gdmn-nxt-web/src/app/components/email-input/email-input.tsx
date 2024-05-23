import { TextField, TextFieldProps } from '@mui/material';
/* eslint-disable-next-line */
export interface EmailInputProps {}

const valuePretter = (value = '') => {
  return value.replace(/\s/g, '');
};

export function EmailInput({
  value,
  label = 'Email',
  ...props
}: TextFieldProps) {
  return (
    <TextField
      {...props}
      type={'text'}
      label={label}
      {...(typeof value === 'string' && {
        value: valuePretter(value)
      })}
    />
  );
}

export default EmailInput;
