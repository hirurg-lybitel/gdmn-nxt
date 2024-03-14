import { ChangeEvent, ClipboardEvent, FocusEvent, KeyboardEvent, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import styles from './verify-code.module.less';

const allowedCharactersValues = ['alpha', 'numeric', 'alphanumeric'] as const;

interface VerifyCodeProps {
  allowedCharacters?: typeof allowedCharactersValues[number];
  length?: number;
  disabled?: boolean;
  isPassword?: boolean;
  autoFocus?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  onChange?: (res: string) => void;
  onSubmit?: (res: string) => void;
}

export type VerifyCodeRef = {
  getValue: () => string;
  focus: () => void;
  clear: () => void;
};

type InputMode = 'text' | 'numeric';

type InputType = 'text' | 'tel' | 'password';

type InputProps = {
  type: InputType;
  inputMode: InputMode;
  pattern: string;
  min?: string;
  max?: string;
};

const propsMap: { [key: string]: InputProps } = {
  alpha: {
    type: 'text',
    inputMode: 'text',
    pattern: '[a-zA-Z]{1}'
  },

  alphanumeric: {
    type: 'text',
    inputMode: 'text',
    pattern: '[a-zA-Z0-9]{1}'
  },

  numeric: {
    type: 'tel',
    inputMode: 'numeric',
    pattern: '[0-9]{1}',
    min: '0',
    max: '9'
  }
};

const VerifyCode = forwardRef<VerifyCodeRef, VerifyCodeProps>((props, ref) => {
  const {
    allowedCharacters = 'numeric',
    isPassword = false,
    autoFocus = false,
    length = 6,
    disabled,
    containerClassName = styles.container,
    inputClassName = styles.input,
    onChange,
    onSubmit
  } = props;

  if (length < 1) {
    throw new Error('Длина должна быть больше 0.');
  }

  const containerRef = useRef<HTMLInputElement>(null);
  const inputsRef = useRef<Array<HTMLInputElement>>([]);
  const inputProps = propsMap[allowedCharacters];

  const handleSubmit = () => {
    if (inputsRef.current[length - 1].value === '') return;
    const res = inputsRef.current.map((input) => input.value).join('');
    onSubmit && onSubmit(res);
  };

  const sendResult = () => {
    const res = inputsRef.current.map((input) => input.value).join('');
    onChange && onChange(res);
    handleSubmit();
  };

  useImperativeHandle(ref, () => ({
    getValue: (() => {
      if (!inputsRef.current) return '';
      return inputsRef.current.map((input) => input.value).join('');
    }),
    focus: () => {
      if (!inputsRef.current) return;
      inputsRef.current[0].focus();
    },
    clear: () => {
      if (!inputsRef.current) return;

      for (let i = 0; i < inputsRef.current.length; i++) {
        inputsRef.current[i].value = '';
      }
      inputsRef.current[0].focus();

      sendResult();
    },
  }));

  useEffect(() => {
    if (!autoFocus) return;
    inputsRef.current[0].focus();
  }, []);

  const handleOnFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value, nextElementSibling }
    } = e;

    try {
      if (value.length > 1) {
        e.target.value = value.charAt(0);
        if (nextElementSibling) {
          (nextElementSibling as HTMLInputElement).focus();
        }
        return;
      }
      if (value.match(inputProps.pattern)) {
        if (nextElementSibling) {
          (nextElementSibling as HTMLInputElement).focus();
        }
        return;
      }

      e.target.value = '';
    } finally {
      sendResult();
    }
  };

  const handleOnKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const { key } = e;
    if (key !== 'Backspace') return;

    const target = e.target as HTMLInputElement;

    try {
      if (target.value !== '') return;
      if (!target.previousElementSibling) return;

      const prevInput = target.previousElementSibling as HTMLInputElement;
      prevInput.value = '';
      prevInput.focus();
      e.preventDefault();
    } finally {
      target.value = '';
      sendResult();
    }
  };

  const handleOnPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedValue = e.clipboardData.getData('Text');
    
    let currentInput = 0;

    try {
      for (let i = 0; i < pastedValue.length; i++) {
        const pastedCharacter = pastedValue.charAt(i);
        const currentValue = inputsRef.current[currentInput].value;

        if (!pastedCharacter.match(inputProps.pattern)) {
          return;
        }

        if (currentValue) {
          return;
        }

        inputsRef.current[currentInput].value = pastedCharacter;

        if (!inputsRef.current[currentInput].nextElementSibling) {
          return;
        }
        (inputsRef.current[currentInput].nextElementSibling as HTMLInputElement).focus();
        currentInput++;

        // if (pastedCharacter.match(inputProps.pattern)) {
        //   if (!currentValue) {
        //     inputsRef.current[currentInput].value = pastedCharacter;
        //     if (inputsRef.current[currentInput].nextElementSibling) {
        //       (inputsRef.current[currentInput]
        //         .nextElementSibling as HTMLInputElement).focus();
        //       currentInput++;
        //     }
        //   }
        // }
      }
    } finally {
      sendResult();
      e.preventDefault();
    }
  };

  const inputs = [];
  for (let i = 0; i < length; i++) {
    inputs.push(
      <input
        key={i}
        aria-label={`Character ${i + 1}.`}
        className={inputClassName}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
        onFocus={handleOnFocus}
        onPaste={handleOnPaste}
        {...inputProps}
        type={isPassword ? 'password' : inputProps.type}
        ref={(el: HTMLInputElement) => {
          inputsRef.current[i] = el;
        }}
        maxLength={1}
        autoComplete="off"
        disabled={disabled}
      />
    );
  }

  const containerOnKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter') return;
    handleSubmit();
  };

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      onKeyDown={containerOnKeyDown}
    >
      {inputs}
    </div>);
});

VerifyCode.displayName = 'VerificationCode';

export default VerifyCode;
