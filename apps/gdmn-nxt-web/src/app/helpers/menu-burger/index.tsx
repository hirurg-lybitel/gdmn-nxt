import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { cloneElement, useCallback, useEffect, useMemo, useState } from 'react';
import CustomFilterButton from '../custom-filter-button';

interface ItemsProps {
  closeMenu: () => void;
}

interface Props {
  disabled?: boolean;
  items: (props: ItemsProps) => JSX.Element[];
  filter?: boolean;
  hasFilters?: boolean;
}

export default function MenuBurger({
  items,
  disabled,
  filter,
  hasFilters
}: Readonly<Props>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  useEffect(() => {
    setMenuOpen(Boolean(anchorEl));
  }, [anchorEl]);

  const handleClose = useCallback(() => {
    setMenuOpen(false);
    setAnchorEl(null);
  }, []);

  const MenuItems = useMemo(() => items({
    closeMenu: handleClose
  })
    .filter(({ key }) => !!key)
    .map((item, index) => !filter ? (
      <MenuItem
        disabled={item.props.disabled}
        key={index}
        style={{ padding: 0 }}
      >
        {cloneElement(item, { style: { padding: '6px 16px', width: '100%' } })}
      </MenuItem>
    ) : cloneElement(item, { style: { padding: '6px 16px', width: '100%' } })
    ), [items, handleClose, filter]);

  if (MenuItems.length === 0) return null;

  return (
    <div>
      {filter ? <CustomFilterButton hasFilters={hasFilters} onClick={handleMenuClick} /> : <IconButton
        id="basic-button"
        aria-controls={menuOpen ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        onClick={handleMenuClick}
        size="small"
        disabled={disabled}
      >
        <MoreVertIcon />
      </IconButton>
      }

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        MenuListProps={{
          disablePadding: true,
          'aria-labelledby': 'basic-button',
        }}
      >
        {MenuItems}
      </Menu>
    </div>
  );
}
