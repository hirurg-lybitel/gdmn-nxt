import { Divider, InputAdornment, Stack, TextField, TextFieldProps } from '@mui/material';
import React, { FocusEvent, useEffect, useRef, useState } from 'react';
import SocialMediaButton from './components/social-media-button/social-media-button';
import SocialMediaMenu from './components/social-media-menu/social-media-menu';
import { socialMediaIcons } from './social-media-icons';
import { MessengerCode } from '@gsbelarus/util-api-types';
export * from './social-media-icons';
export * from './social-media-links';

type BaseTextFieldProps = Omit<
  TextFieldProps,
  'onChange' | 'select' | 'type' | 'multiline' | 'defaultValue'
>;

export interface ISocialMedia {
    text: string;
    name: MessengerCode
}

export interface socialMediaInputProps extends BaseTextFieldProps {
  onChange: (value: ISocialMedia) => void;
  value: ISocialMedia;
  disableDropdown?: boolean;
}

export function SocialMediaInput(props: socialMediaInputProps) {
  const {
    onChange,
    onFocus,
    onDoubleClick,
    value,
    disableDropdown,
    disabled,
    inputProps,
    InputProps,
    className,
    ...restTextFieldProps
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
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
    onChange({ ...value, name: socialValue as MessengerCode });
  };

  const [paste, setPaste] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    handleClose();
    if (paste) {
      setPaste(false);
      const cuttedValue = newValue.endsWith('/') ? newValue.slice(0, newValue.length - 1) : newValue;
      const parsedvalue = cuttedValue.split('/');
      const domain = cuttedValue.includes('https://') ? parsedvalue[2] : null;
      const iconIndex = Object.values(socialMediaIcons).findIndex(item => item.domain === domain);
      onChange({ ...value, name: Object.keys(socialMediaIcons)[iconIndex] as MessengerCode || value.name, text: (parsedvalue[parsedvalue.length - 1]).replace(/\s+/g, ' ') });
      return;
    }
    onChange({ ...value, text: newValue.replace(/\s+/g, ' ') });
  };

  const { onBlur } = restTextFieldProps;

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (!anchorEl &&
        containerRef.current &&
        !containerRef.current.contains(event.target)) {
        onBlur && onBlur(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [anchorEl, onBlur]);

  return (
    <div
      style={{ width: '100%' }}
      ref={containerRef}
    >
      <TextField
        fullWidth
        {...restTextFieldProps}
        disabled={disabled}
        value={value.text}
        ref={textFieldRef}
        inputRef={inputDigitsRef}
        onDoubleClick={handleDoubleClick}
        onChange={handleTextChange}
        onPaste={() => setPaste(true)}
        onFocus={handleFocus}
        onBlur={(e) => {
          e.preventDefault();
        }}
        inputProps={{
          ...inputProps
        }}
        InputProps={{
          ...InputProps,
          startAdornment: (
            <InputAdornment position="start">
              <Stack direction="row">
                <SocialMediaButton
                  socialName={value.name}
                  onClick={handleOpen}
                  disabled={disabled}
                  disableDropdown={Boolean(disableDropdown)}
                />
                <Divider orientation="vertical" flexItem />
              </Stack>
            </InputAdornment>
          ),
        }}
      />
      {!disableDropdown ? (
        <SocialMediaMenu
          anchorEl={anchorEl}
          socialName={value.name}
          onClose={handleClose}
          onChangeSocial={handleSocialChange}
        />
      ) : null}
    </div>
  );
}

export default SocialMediaInput;
