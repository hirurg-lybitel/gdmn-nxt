import InputMask from '@mona-health/react-input-mask';
import styles from './textfield-masked.module.less';
import { TextField } from '@mui/material';
import { ReactNode } from 'react';

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
   * Character to cover unfilled editable parts of mask. Default character is "_". If set to null, unfilled parts will be empty, like in ordinary input.
   */
  maskChar?: string | null | undefined;
  maskPlaceholder?: string | null | undefined;
  /**
   * Show mask even in empty input without focus.
   */
  alwaysShowMask?: boolean | undefined;
  /**
   * Use inputRef instead of ref if you need input node to manage focus, selection, etc.
   */
  inputRef?: React.Ref<HTMLInputElement> | undefined;
  /**
   * In case you need to implement more complex masking behavior, you can provide
   * beforeMaskedStateChange function to change masked value and cursor position
   * before it will be applied to the input.
   *
   * * previousState: Input state before change. Only defined on change event.
   * * currentState: Current raw input state. Not defined during component render.
   * * nextState: Input state with applied mask. Contains value and selection fields.
   */
  beforeMaskedStateChange?(states: BeforeMaskedStateChangeStates): InputState;
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
