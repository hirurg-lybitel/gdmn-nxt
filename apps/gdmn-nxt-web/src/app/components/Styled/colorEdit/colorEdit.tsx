import { ClickAwayListener, Fade, Popper, SxProps, TextField, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useRef, useState } from 'react';
import { ColorResult, SketchPicker } from 'react-color';

interface colorEditProps {
  value?: string,
  onChange: (color: string) => void,
  errorMessage?: string,
  sx?: SxProps<Theme>,
  label?: string
}

const useStyles = makeStyles((theme: Theme) => ({
  piker: {
    '& .sketch-picker ': {
      backgroundColor: `${theme.mainContent.backgroundColor} !important`,
      color: `${theme.textColor} !important`
    },
    '& .sketch-picker label': {
      color: `${theme.textColor} !important`
    },
    '& .saturation-white div': {
      pointerEvent: 'none !important',
      cursor: 'pointer !important'
    }
  }
}));

export default function ColorEdit({ value, onChange, errorMessage, sx, label }: colorEditProps) {
  const [isSelect, setIsSelect] = useState<boolean>(false);

  const handleOpen = () => {
    setIsSelect(true);
  };

  const handleClose = () => {
    setIsSelect(false);
  };

  const handleChange = (color: ColorResult) => {
    onChange(color.hex);
  };

  const classes = useStyles();

  const ref = useRef(null);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div ref={ref} style={{ position: 'relative' }}>
        <TextField

          sx={sx}
          fullWidth
          label={label}
          type="text"
          inputProps={{
            readOnly: true
          }}
          onSelect={handleOpen}
          value={value}
          helperText={errorMessage}
        />
        <Popper
          open={isSelect}
          anchorEl={ref.current}
          placement="bottom-start"
          transition
          style={{ zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Fade
              {...TransitionProps}
              timeout={350}
            >
              <div className={classes.piker}>
                <SketchPicker
                  color={value}
                  onChange= {handleChange}
                />
              </div>
            </Fade>
          )}
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
