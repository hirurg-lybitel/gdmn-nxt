import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { cloneElement, useCallback, useEffect, useState } from 'react';

interface ItemsProps {
  closeMenu: () => void
}

interface Props {
  items: (props: ItemsProps) => JSX.Element[];
}

export default function MenuBurger({
  items
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

  return (
    <div>
      <IconButton
        id="basic-button"
        aria-controls={menuOpen ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        onClick={handleMenuClick}
        size="small"
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
        {items({
          closeMenu: handleClose
        }).map((item, index) => (
          <MenuItem key={index} style={{ padding: 0 }}>
            {cloneElement(item, { style: { padding: '6px 16px', width: '100%' } })}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
