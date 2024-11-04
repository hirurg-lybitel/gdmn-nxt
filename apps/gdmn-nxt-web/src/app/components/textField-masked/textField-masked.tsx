import InputMask from '@mona-health/react-input-mask';
import styles from './textfield-masked.module.less';
import { TextField } from '@mui/material';
import { ReactElement, ReactNode } from 'react';

export interface Selection {
  start: number;
  end: number;
}

export interface InputState {
  value: string;
  selection: Selection | null;
}

export interface BeforeMaskedStateChangeStates {
  previousState: InputState;
  currentState: InputState;
  nextState: InputState;
}

export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Mask string. Format characters are:
   * * `9`: `0-9`
   * * `a`: `A-Z, a-z`
   * * `\*`: `A-Z, a-z, 0-9`
   *
   * Any character can be escaped with backslash, which usually will appear as double backslash in JS strings.
   * For example, German phone mask with unremoveable prefix +49 will look like `mask="+4\\9 99 999 99"` or `mask={"+4\\\\9 99 999 99"}`
   */
  mask: string | Array<(string | RegExp)>;
  /**
   * Placeholder to cover unfilled parts of the mask
   */
  maskPlaceholder?: string | null | undefined;
  /**
   * Whether mask prefix and placeholder should be displayed when input is empty and has no focus
   */
  alwaysShowMask?: boolean | undefined;
  /**
   * Use inputRef instead of ref if you need input node to manage focus, selection, etc.
   */
  inputRef?: React.Ref<HTMLInputElement> | undefined;
  /**
   * Function to modify value and selection before applying mask
   */
  beforeMaskedStateChange?(states: BeforeMaskedStateChangeStates): InputState;
  /**
   * Custom render function for integration with other input components
   */
  children?: ReactElement
}

/* eslint-disable-next-line */
export interface TextFieldMaskedProps extends Props {
  label?: string;
  helperText?: ReactNode;
  error?: boolean;
  fullWidth?: boolean;
};

export function TextFieldMasked(props: Readonly<TextFieldMaskedProps>) {
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
