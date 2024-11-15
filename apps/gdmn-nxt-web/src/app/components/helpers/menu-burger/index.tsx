import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { cloneElement, useCallback, useEffect, useMemo, useState } from 'react';

interface ItemsProps {
  closeMenu: () => void
}

interface Props {
  disabled?: boolean;
  items: (props: ItemsProps) => JSX.Element[];
}

export default function MenuBurger({
  items,
  disabled
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
    .map((item, index) => (
      <MenuItem key={index} style={{ padding: 0 }}>
        {cloneElement(item, { style: { padding: '6px 16px', width: '100%' } })}
      </MenuItem>
    )), [handleClose, items, disabled]);

  if (MenuItems.length === 0) return null;

  return (
    <div>
      <IconButton
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
