import './search-bar.module.less';
import { ChangeEvent, cloneElement, CSSProperties, ReactElement, useEffect, useRef, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { IconButton, Input, Theme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CustomizedCard from '../Styled/customized-card/customized-card';

export interface StyleProps {
  isFocus: boolean;
}

const styles = makeStyles<Theme, StyleProps>((theme: Theme) => ({
  root: {
    transition: theme.transitions.create('all', {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }),
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    '& .MuiInputBase-input': {
      width: '150px !important'
    }
  },
  iconButton: {
    color: theme.palette.action.active,
    transform: 'scale(1, 1)',
    transition: theme.transitions.create(['transform', 'color'], {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
  iconButtonHidden: {
    transform: 'scale(0, 0)',
    '& > $icon': {
      opacity: 0.5,
    },
  },
  searchIconButton: {
    marginRight: theme.spacing(-5),
  },
  icon: {
    transition: theme.transitions.create(['opacity'], {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
  input: {
    width: '100%',
  },
  searchContainer: {
    margin: 'auto 16px',
    width: '100%',
  },
  mouseOnFocus: {
    border: `1px solid ${theme.textColor}`
  },
  onFocus: {
    border: `1px solid ${theme.palette.primary.main}`,
    marginLeft: 0
  },
  widthTransition: {
    marginRight: '150px',
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
  },
  fullWidth: {
    width: '100%',
  },
}));

export interface SearchBarProps {
  cancelOnEscape?: boolean,
  className?: string,
  closeIcon?: ReactElement,
  searchIcon?: ReactElement,
  iconPosition?: 'start' | 'end',
  disabled?: boolean,
  onCancelSearch?: () => void,
  onChange?: (value: string) => void,
  onRequestSearch?: (value: string) => void,
  placeholder?: string,
  style?: CSSProperties,
  value?: string,
  fullWidth?: boolean;
}

export function SearchBar(props: SearchBarProps) {
  const {
    cancelOnEscape,
    className = '',
    closeIcon = <ClearIcon />,
    searchIcon = <SearchIcon />,
    disabled = false,
    onCancelSearch,
    onChange,
    onRequestSearch,
    placeholder = 'Поиск',
    style,
    value = '',
    fullWidth = false,
    iconPosition = 'end',
    ...inputProps
  } = props;

  const inputRef = useRef();
  const [searchValue, setSearchValue] = useState(value);
  const [mouseOnFocus, setMouseOnFocus] = useState(false);
  const [onFocus, setOnFocus] = useState(false);

  useEffect(() => {
    setSearchValue(value);
    setOnFocus(Boolean(value));
  }, [value]);


  const propsStyle: StyleProps = {
    isFocus: onFocus
  };

  const classes = styles(propsStyle);

  const handleOnMouseEnter = () => {
    setMouseOnFocus(true);
  };
  const handleOnMouseLeave = () => {
    setMouseOnFocus(false);
  };

  const handleBlur = () => {
    setSearchValue((v) => v.trim());
    setOnFocus(false);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchValue(event.target.value);
    onChange && onChange(event.target.value);
  };

  const handleKeyUp = (event: any) => {
    if (event.charCode === 13 || event.key === 'Enter') {
      handleRequestSearch();
    } else if (
      cancelOnEscape &&
      (event.charCode === 27 || event.key === 'Escape')
    ) {
      handleCancel();
    }
  };

  const handleFocus = () => {
    setOnFocus(true);
  };

  const handleRequestSearch = () => {
    if (onRequestSearch) {
      onRequestSearch(searchValue);
    }
  };

  const handleCancel = () => {
    setSearchValue('');

    if (onCancelSearch) {
      onCancelSearch();
    }
  };

  const icons =
    <>
      <IconButton
        onClick={handleRequestSearch}
        className={`
          ${classes.iconButton}
          ${classes.searchIconButton}
          ${searchValue !== '' ? classes.iconButtonHidden : ''}
        `}
        disabled={disabled}
      >
        {cloneElement(searchIcon, {
          classes: { root: classes.icon },
        })}
      </IconButton>
      <IconButton
        onClick={handleCancel}
        className={`
          ${classes.iconButton}
          ${searchValue === '' ? classes.iconButtonHidden : ''}
        `}
        disabled={disabled}
      >
        {cloneElement(closeIcon, {
          classes: { root: classes.icon },
        })}
      </IconButton>
    </>;

  return (
    <CustomizedCard
      borders
      direction="row"
      className={`
        ${classes.root}
        ${className}
        ${mouseOnFocus ? classes.mouseOnFocus : ''}
        ${onFocus ? classes.onFocus : ''}
        ${fullWidth ? classes.fullWidth : ''}
        ${onFocus && !fullWidth ? classes.widthTransition : ''}
      `}
      style={style}
    >
      {iconPosition === 'start' && icons}
      <div className={classes.searchContainer}>
        <Input
          {...inputProps}
          inputRef={inputRef}
          onBlur={handleBlur}
          value={searchValue}
          onChange={handleInput}
          onKeyUp={handleKeyUp}
          onFocus={handleFocus}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
          fullWidth
          className={classes.input}
          disableUnderline
          disabled={disabled}
          placeholder={placeholder}
        />
      </div>
      {iconPosition === 'end' && icons}
    </CustomizedCard>
  );
}

export default SearchBar;
