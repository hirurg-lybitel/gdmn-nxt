import InputMask, { Props } from 'react-input-mask';
import styles from './textfield-masked.module.less';
import { TextField } from '@mui/material';
import { ReactNode } from 'react';

/* eslint-disable-next-line */
export interface TextFieldMaskedProps extends Props {
  label?: string;
  helperText?: ReactNode;
  error?: boolean;
  fullWidth?: boolean;
};

export function TextFieldMasked(props: TextFieldMaskedProps) {
  return (
    <InputMask
      {...props}
    >
      <TextField
        label={props.label}
        placeholder={props.placeholder}
        name={props.name}
        type="text"
        helperText={props.helperText}
        error={props.error}
        fullWidth={props.fullWidth}
      />
    </InputMask>
  );
}

export default TextFieldMasked;
