import styles from './editable-avatar.module.less';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Avatar, ClickAwayListener, Fade, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popper, Skeleton } from '@mui/material';
import { ChangeEvent, MouseEvent, useRef, useState } from 'react';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CustomizedCard from '../Styled/customized-card/customized-card';

export interface EditableAvatarProps {
  value?: string,
  onChange: (arg1: string | undefined) => void,
  disabled?: boolean,
  size?: number,
  loading?: boolean;
}

export function EditableAvatar({
  value,
  onChange,
  disabled,
  size = 40,
  loading = false,
}: EditableAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [arrowRef, setArrowRef] = useState<HTMLElement | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const handleUploadAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0] || undefined;
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = (e) => {
      onChange(reader.result?.toString() ?? '');
    };
  };

  const handleAvatarClick = (e: MouseEvent<HTMLDivElement>) => {
    setDialogOpen(true);
  };

  const handleClickAway = () => {
    setDialogOpen(false);
  };

  const handleDeleteAvatar = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <Skeleton
        variant="circular"
        height={size}
        width={size}
      />
    );
  }

  return (
    <div className={styles.mainContainer} style={{ height: size, width: size }}>
      <Avatar
        className={styles.avatar}
        sx={{ width: size, height: size }}
        src={value}
        ref={avatarRef}
      />
      <div
        className={styles.editBox}
        onClick={handleAvatarClick}
      >
        <EditIcon color="secondary" />
      </div>
      <input
        id="input-file"
        disabled={disabled}
        hidden
        accept="image/*"
        type="file"
        onChange={handleUploadAvatar}
        ref={inputRef}
      />
      <Popper
        className={styles.menuContainer}
        open={dialogOpen}
        anchorEl={avatarRef.current}
        placement="bottom-start"
        transition
        sx={{
          paddingLeft: `${size / 2 - 20}px`,
          '::before': {
            left: `calc(-100% - -${size}px)`
          }
        }}
        modifiers={[
          {
            name: 'arrow',
            enabled: true,
            options: {
              element: arrowRef,
            },
          },
        ]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClickAway}>
            <Fade {...TransitionProps} timeout={350}>
              <div>
                <span className={styles.arrow} ref={setArrowRef} />
                <CustomizedCard
                  borders
                  boxShadows
                >
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton style={{ height: 30 }}>
                        <ListItemIcon style={{ minWidth: 30 }}>
                          <UploadFileIcon />
                        </ListItemIcon>
                        <label htmlFor="input-file" className={styles.menuLabel}>Загрузить</label>
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton style={{ height: 30 }} onClick={handleDeleteAvatar}>
                        <ListItemIcon style={{ minWidth: 30 }}>
                          <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText primary="Удалить" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </CustomizedCard>
              </div>
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
    </div>
  );
}

export default EditableAvatar;
