import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import { forwardRef, Ref, useState } from 'react';
import VisibilityOnIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

type IPasswordTextFieldProps = TextFieldProps & {
  defaulVisibility?: boolean;
};

export const PasswordTextField = forwardRef(
  ({ defaulVisibility = false, ...props }: IPasswordTextFieldProps, ref: Ref<HTMLElement>) => {
    const [visible, setVisible] = useState(defaulVisibility);
    return <TextField
      type={visible ? 'text' : 'password'}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setVisible(!visible)}
              edge="end"
              sx={{
                opacity: 0.7,
                '&:hover': { opacity: 1 }
              }}
            >
              {visible ? <VisibilityOnIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />;
  }
);

PasswordTextField.displayName = 'PasswordTextField';
