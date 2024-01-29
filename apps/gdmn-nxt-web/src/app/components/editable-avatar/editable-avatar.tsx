import DeleteIcon from '@mui/icons-material/Delete';
import { Avatar, IconButton } from '@mui/material';
import { useRef, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';

export interface EditableAvatarProps {
  value?: string,
  onChange: (arg1: string | undefined) => void,
  disabled?: boolean,
  size?: number,
  iconButtonSize?: 'inherit' | 'large' | 'medium' | 'small'
}

export function EditableAvatar({
  value,
  onChange,
  disabled,
  size = 40,
  iconButtonSize
}: EditableAvatarProps) {
  const [isAvatarEdit, setIsAvatarEdit] = useState<boolean>(false);

  const handleAvatarEditOpen = () => {
    setIsAvatarEdit(true);
  };

  const handleAvatarEditClose = () => {
    handleAvatarBlur();
    setIsAvatarEdit(false);
  };

  const [isAvatarFocus, setisAvatarFocus] = useState<boolean>(false);

  const handleAvatarFocus = () => {
    setisAvatarFocus(true);
  };

  const handleAvatarBlur = () => {
    setisAvatarFocus(false);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleUploadAvatar = (e: any) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0] || undefined;
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = (e) => {
      onChange(reader.result?.toString() || '');
    };
    handleAvatarEditClose();
  };

  const handleDeleteAvatar = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    handleAvatarEditClose();
  };

  return (
    <div
      style={{ display: 'flex', position: 'relative', borderRadius: '100%' }}
      onMouseEnter={handleAvatarFocus}
      onMouseLeave={handleAvatarBlur}
    >
      <div style={{ position: 'relative', borderRadius: '100%' }}>
        {/* {(isAvatarFocus && !isAvatarEdit) &&
            <div
              style={{
                background: 'black',
                borderRadius: '100%',
                opacity: '0.5', width: '40px', height: '40px',
                position: 'absolute', left: '0', zIndex: 1 }}
            />
          } */}
        <Avatar sx={{ width: size, height: size }} src={value} />
      </div>

      {!isAvatarEdit ?
        <div
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${size}px`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'rgba(0,0,0,0.5)',
            opacity: isAvatarFocus ? 1 : 0, visibility: isAvatarFocus ? 'visible' : 'hidden',
            borderRadius: '100%'
          }}
        >
          <IconButton
            style={!isAvatarFocus ? { opacity: '0', visibility: 'hidden' } : {}}
            onClick={handleAvatarEditOpen}
            size="small"
          >
            <EditIcon fontSize={iconButtonSize || 'small'} color="primary" />
          </IconButton>
        </div>
        : <div style={{ margin: '0px 5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton
            onClick={handleAvatarEditClose}
            size="small"
          >
            <CloseIcon fontSize={iconButtonSize || 'small'} color="primary" />
          </IconButton>
          <IconButton
            size="small"
            component="label"
          >
            <input
              disabled={disabled}
              hidden
              accept="image/*"
              multiple
              type="file"
              onChange={handleUploadAvatar}
              ref={inputRef}
            />
            <UploadFileIcon fontSize={iconButtonSize || 'small'} color="primary" />
          </IconButton>
          <IconButton
            onClick={handleDeleteAvatar}
          >
            <DeleteIcon fontSize={iconButtonSize || 'small'} color="primary" />
          </IconButton>
        </div>
      }
    </div>
  );
}

export default EditableAvatar;
