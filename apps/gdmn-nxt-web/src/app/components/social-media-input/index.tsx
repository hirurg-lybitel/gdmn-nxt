import { InputAdornment, TextField, TextFieldProps } from '@mui/material';
import React, { FocusEvent, useEffect, useRef, useState } from 'react';
import SocialMediaButton from './components/social-media-button/social-media-button';
import SocialMediaMenu from './components/social-media-menu/social-media-menu';
import { socialMediaIcons } from './social-media-icons';


type BaseTextFieldProps = Omit<
  TextFieldProps,
  'onChange' | 'select' | 'type' | 'multiline' | 'defaultValue'
>;

export interface socialMediaInputProps extends BaseTextFieldProps {
  onChange: (value: {text: string, name: string}) => void;
  value: {text: string, name: string};
  disableDropdown?: boolean;
  disableFormatting?: boolean;
   /**
   * Если true, то код страны будет недоступен для ручного изменения
   * @default false
   */
  fixedCode?: boolean;
  /**
   * Если true, то можно будет ввести только то количество цифр, которые допустимы для выбранной страны
   * @default false
   */
  strictMode?: boolean;
}

export function SocialMediaInput(props: socialMediaInputProps) {
  const {
    onChange,
    onFocus,
    onDoubleClick,
    value,
    disableDropdown,
    disableFormatting = false,
    disabled,
    inputProps,
    InputProps,
    className,
    fixedCode = false,
    strictMode,
    ...restTextFieldProps
  } = props;

  const textFieldRef = useRef<HTMLDivElement>(null);
  const inputDigitsRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const handleOpen = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    event.preventDefault();

    if (!disabled || !disableDropdown) {
      setAnchorEl(textFieldRef.current);
    };
  };

  const handleFocus = (
    event: FocusEvent<HTMLInputElement, Element>
  ): void => {
    onFocus?.(event);
  };

  const handleDoubleClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void => {
    const inputElement = inputDigitsRef.current as HTMLInputElement;
    inputElement.setSelectionRange(0, inputElement.value.length);
    onDoubleClick?.(event);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleSocialChange = (socialValue: string) => {
    handleClose();
    onChange({ text: '', name: socialValue });
  };

  useEffect(() => {
    const mask = socialMediaIcons[`${value.name}`]?.mask;
    if (mask) {
      if (value.text.length === 0) {
        onChange({ ...value, text: mask });
        return;
      }
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleClose();
    const mask = socialMediaIcons[`${value.name}`]?.mask;
    if (mask) {
      if (e.target.value.length === 0) {
        onChange({ ...value, text: mask });
        return;
      }
      if (e.target.value[0] !== mask[0]) return;
      if (mask.length > 1) {
        if (e.target.value[1] !== mask[1]) return;
      }
      if (e.target.value[1]?.trim().length === 0) {
        let str = e.target.value;
        str = str.slice(0, 1) + str.slice(2);
        onChange({ ...value, text: str });
        return;
      }
    }
    onChange({ ...value, text: e.target.value.replace(/\s+/g, ' ') });
  };

  return (
    <>
      <TextField
        className={`TelInput-TextField ${className || ''}`}
        type="tel"
        disabled={disabled}
        value={value.text}
        ref={textFieldRef}
        inputRef={inputDigitsRef}
        onDoubleClick={handleDoubleClick}
        onChange={handleTextChange}
        onFocus={handleFocus}
        inputProps={{
          ...inputProps
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ flexShrink: 0 }}>
              <SocialMediaButton
                isFlagsMenuOpened={Boolean(anchorEl)}
                socialName={value.name}
                onClick={handleOpen}
                disabled={disabled}
                disableDropdown={Boolean(disableDropdown)}
                fixedCode={fixedCode}
              />
            </InputAdornment>
          ),
          ...InputProps
        }}
        {...restTextFieldProps}
      />
      {!disableDropdown ? (
        <SocialMediaMenu
          anchorEl={anchorEl}
          socialName={value.name}
          onClose={handleClose}
          onChangeSocial={handleSocialChange}
        />
      ) : null}
    </>
  );
}

export default SocialMediaInput;
