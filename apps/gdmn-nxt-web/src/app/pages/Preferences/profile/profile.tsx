import styles from './profile.module.less';
import NoPhoto from './img/Belarus.png';
import { Box, CardHeader, Divider, Fab, Stack, Typography } from '@mui/material';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { ChangeEvent, useCallback, useState } from 'react';

/* eslint-disable-next-line */
export interface ProfileProps {}

export function Profile(props: ProfileProps) {
  const [image, setImage] = useState<string | null>(null);
  const handleUploadClick = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    console.log('handleUploadClick', e);

    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0] || undefined;
    const reader = new FileReader();

    const url = reader.readAsDataURL(file);
    reader.onloadend = (e) => {
      setImage(reader.result?.toString() || '');
    };
  }, []);

  console.log('Profile', image);

  return (
    // <Stack className={styles['container']} direction="row">
    //   <h1>Welcome to Profile!</h1>
    //   <img src={Photo} width={500} style={{ backgroundColor: 'red', borderRadius: '50%' }} />
    //   <Divider orientation="horizontal"/>
    // </Stack>
    <CustomizedCard borders style={{ flex: 1 }}>
      <CardHeader title={<Typography variant="h3">Аккаунт</Typography>} />
      <Divider />
      <Stack direction="row" flex={1} height="100%">
        <Box p={2} position="relative">
          <img src={image || NoPhoto} alt="Нет фото" width={300} height={300} style={{ borderRadius: '50%', border: '1px solid #64b5f6', objectFit: 'cover' }} />
          <Box position="absolute" top={250}>
            <label htmlFor="contained-button-file">
              <Fab component="span" color="primary">
                <AddPhotoAlternateIcon />
              </Fab>
            </label>
          </Box>
          <input
            accept="image/*"
            id="contained-button-file"
            style={{ display: 'none' }}
            // className={classes.input}
            type="file"
            onChange={handleUploadClick}
          />
        </Box>
        <Divider orientation="vertical" flexItem />
        <div>Description</div>
      </Stack>
    </CustomizedCard>
  );
}

export default Profile;
