import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import styles from './updates-info.module.less';
import { useGetAllUpdatesQuery } from '../../../features/updates';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { useGetProfileSettingsQuery, useSetProfileSettingsMutation } from '../../../features/profileSettings';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import CloseIcon from '@mui/icons-material/Close';
import CustomizedScrollBox from '../../Styled/customized-scroll-box/customized-scroll-box';
import { useEffect, useState } from 'react';

/* eslint-disable-next-line */
export interface UpdatesInfoProps {}

export function UpdatesInfo(props: UpdatesInfoProps) {
  const { data: updates = [], isLoading: updatesIsLoading } = useGetAllUpdatesQuery();
  const [open, setOpen] = useState(false);
  const userId = useSelector<RootState, number>(state => state.user?.userProfile?.id || -1);

  const { data: settings = {}, isLoading: settingsIsLoading } = useGetProfileSettingsQuery(userId);
  const [setSettings] = useSetProfileSettingsMutation();

  const copiedUpdates = [...updates];
  const lastUpdate = copiedUpdates.shift();

  useEffect(() => {
    if (updatesIsLoading || settingsIsLoading) return;
    if (updates.length === 0) return;
    if (Object.keys(settings).length === 0) return;
    if ((settings?.LASTVERSION ?? '') >= (lastUpdate?.VERSION ?? '')) return;

    setOpen(true);
  }, [updatesIsLoading, settingsIsLoading]);

  const onClose = () => {
    setOpen(false);

    setSettings({
      userId: userId,
      body: {
        ...settings,
        LASTVERSION: lastUpdate?.VERSION
      }
    });
  };

  return (
    <Dialog
      open={open}
      PaperProps={{
        sx: {
          height: '80%',
          width: '80%',
          maxWidth: '100%'
        }
      }}
    >
      <DialogTitle variant="h3">
        <span>Gedemin CRM обновилась до версии {lastUpdate?.VERSION}</span>
        <IconButton
          style={{ position: 'absolute', top: 3, right: 5 }}
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <CustomizedScrollBox>
          <ReactMarkdown>
            {lastUpdate?.CHANGES || ''}
          </ReactMarkdown>
        </CustomizedScrollBox>
      </DialogContent>

    </Dialog>
  );
}

export default UpdatesInfo;
