import { Button, IconButton, MenuItem, Modal, Select, Typography } from '@mui/material';
import styles from './update-list.module.less';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import { RootState } from '../store';
import { UserState } from '../features/user/userSlice';
import { useGetProfileSettingsQuery, useSetProfileSettingsMutation } from '../features/profileSettings';
import { useSelector } from 'react-redux';
import { updatesApi } from '../features/updates/updatesApi';
import { Skeleton } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50vw',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  height: '90vh',
  borderRadius: '20px',
};

export interface UpdateListProps {
}

export function UpdateList(props: UpdateListProps) {
  // const version = '';
  // const updates = initialUpdate.find(update => update.version === version) || initialUpdate[0];
  const { data: updates = [], isFetching, isLoading: updatesIsLoading } = updatesApi.useGetAllUpdatesQuery();
  const { userProfile } = useSelector<RootState, UserState>(state => state.user);
  const { data: settings, isLoading: userIsLoading } = useGetProfileSettingsQuery(userProfile?.id || -1);
  const [setSettings, { isLoading }] = useSetProfileSettingsMutation();
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
    setSettings({
      userId: userProfile?.id || -1,
      body: {
        AVATAR: settings?.AVATAR || '',
        COLORMODE: settings?.COLORMODE,
        LASTVERSION: updates?.[updates?.length - 1]?.USR$VERSION
      }
    });
  };

  useEffect(() => {
    if (!updates || !settings) return;
    if (settings?.LASTVERSION !== updates?.[updates?.length - 1]?.USR$VERSION && updates?.length !== 0) setOpen(true);
  }, [updatesIsLoading, userIsLoading]);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <IconButton
            style={{ position: 'absolute', top: 3, right: 5 }}
            onClick={handleClose}
            size="small"
            hidden
          >
            <CloseIcon />
          </IconButton>
          <PerfectScrollbar options={{ suppressScrollX: true }} >
            <div style={{ paddingRight: '20px', height: 'calc(100% - 60px)' }}>
              <Typography
                variant="h1"
                align="center"
              >
                <h1 style={{ margin: '0px' }}>
                  <em>{updates?.[updates?.length - 1]?.USR$VERSION}</em>
                </h1>
              </Typography>
              <Typography variant="h1" component="div">
                <ReactMarkdown className={styles.mark}>
                  {updates?.[updates?.length - 1]?.USR$CHANGES}
                </ReactMarkdown>
              </Typography>
            </div>
          </PerfectScrollbar>
        </Box>
      </Modal>
    </div>
  );
}

export default UpdateList;
