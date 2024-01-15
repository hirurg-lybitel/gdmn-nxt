import { InputAdornment, TextField, TextFieldProps } from '@mui/material';
import React, { FocusEvent, useEffect, useRef, useState } from 'react';
import SocialMediaButton from './components/social-media-button/social-media-button';
import SocialMediaMenu from './components/social-media-menu/social-media-menu';
import { IIconsNames, socialMediaIcons } from './social-media-icons';
import { makeStyles } from '@mui/styles';

type BaseTextFieldProps = Omit<
  TextFieldProps,
  'onChange' | 'select' | 'type' | 'multiline' | 'defaultValue'
>;

export interface socialMediaInputProps extends BaseTextFieldProps {
  onChange: (value: {text: string, name: IIconsNames | undefined}) => void;
  value: {text: string, name: IIconsNames | undefined};
  disableDropdown?: boolean;
  strictMode?: boolean;
}

const useStyles = makeStyles(() => ({
  input: {
    '& .MuiInputBase-root': {
      paddingLeft: '0px'
    }
  }
}));

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
    strictMode,
    ...restTextFieldProps
  } = props;

  const textFieldRef = useRef<HTMLDivElement>(null);
  const inputDigitsRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const classes = useStyles();
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
    onChange({ text: '', name: socialValue as IIconsNames });
  };

  useEffect(() => {
    const mask = socialMediaIcons[`${value.name}`]?.mask;
    if (mask) {
      if (value.text.length === 0) {
        onChange({ ...value, text: mask + '｜' });
        return;
      }
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleClose();
    const mask = socialMediaIcons[`${value.name}`]?.mask + '｜';
    if (socialMediaIcons[`${value.name}`]?.mask) {
      if (e.target.value.length === 0) {
        onChange({ ...value, text: mask });
        return;
      }
      let withoutSym = false;
      for (let i = 0;i < mask.length;i++) {
        if (e.target.value[i] !== mask[i]) withoutSym = true;
      }
      if (withoutSym) return;
      if (e.target.value[mask.length]?.trim().length === 0) {
        return;
      }
    }
    onChange({ ...value, text: (e.target.value).replace(/\s+/g, ' ') });
  };

  return (
    <>
      <TextField
        className={classes.input}
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
                isMenuOpened={Boolean(anchorEl)}
                socialName={value.name}
                onClick={handleOpen}
                disabled={disabled}
                disableDropdown={Boolean(disableDropdown)}
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
