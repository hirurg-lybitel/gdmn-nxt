import { Autocomplete, Button, TextField } from '@mui/material';
import styles from './icon-select.module.less';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { MouseEvent, useMemo, useState } from 'react';
import CustomizedCard from '../Styled/customized-card/customized-card';
import * as iconsSource from '@mui/icons-material';
import { IconByName } from '../icon-by-name';

interface ListboxComponentProps {
  open: boolean;
  onClose: () => void;
  onChange: (e: any, value: string | null) => void;
}

const ListboxComponent = ({ open, onClose, onChange }: ListboxComponentProps) => {
  const icons = useMemo(() =>
    [''].concat(
      Object.keys(iconsSource).filter(item =>
        !item.includes('Outlined') &&
        !item.includes('Rounded') &&
        !item.includes('TwoTone') &&
        !item.includes('Sharp'))
    ), []);

  if (!open) return <></>;

  return (
    <CustomizedCard
      borders
      className={styles.selectForm}
    >
      <Autocomplete
        options={icons || []}
        open
        disableListWrap
        disableCloseOnSelect
        fullWidth
        onClose={onClose}
        onChange={onChange}
        ListboxProps={{
          className: styles.listBox
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            autoFocus
            placeholder="Поиск иконки..."
          />
        )}
        renderOption={(props, option) => (
          <li
            {...props}
            key={option}
            className={styles.listBoxItem}
          >
            <IconByName
              name={option}
              fontSize="medium"
              color="action"
            />
          </li>
        )}
      />
    </CustomizedCard>
  );
};

export interface IconSelectProps {
  icon: string,
  setIcon: (iconName: string) => void
}

export function IconSelect(props: Readonly<IconSelectProps>) {
  const { icon, setIcon } = props;

  const [toggleSelect, setToggleSelect] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handlecloseToggleSelect = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setToggleSelect(prev => !prev);
  };

  const handleCloseSelect = () => {
    setToggleSelect(false);
  };

  const handleChange = (e: any, value: string | null) => {
    setIcon(value ?? '');
  };

  return (
    <div>
      <Button
        className={styles.button}
        color="inherit"
        onClick={handlecloseToggleSelect}
      >
        {icon ? <IconByName name={icon} color="primary" /> : <RadioButtonUncheckedIcon color="primary" />}
        <ArrowDropDownIcon />
      </Button>
      <ListboxComponent
        open={toggleSelect}
        onClose={handleCloseSelect}
        onChange={handleChange}
      />
    </div>
  );
}

export default IconSelect;
