import styles from './profile.module.less';
import { CardContent, CardHeader, Divider, Tab, Tabs, Typography } from '@mui/material';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useEffect, useState } from 'react';
import { useGetProfileSettingsQuery } from '../../../features/profileSettings';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import ShieldIcon from '@mui/icons-material/Shield';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useLocation } from 'react-router-dom';
import SystemTab from './tabs/system';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import useUserData from '@gdmn-nxt/helpers/hooks/useUserData';
import AccountTab from './tabs/account';
import SecurityTab from './tabs/security';
import NotificationsTab from './tabs/notifications';
import LinkTab from '@gdmn-nxt/components/link-tab/link-tab';
import TuneIcon from '@mui/icons-material/Tune';
import OptionsTab from './tabs/options';

/* eslint-disable-next-line */
export interface ProfileProps {}

export const TABS = ['account', 'security', 'notifications', 'system', 'options'] as const;
type TabIndex = typeof TABS[number];

export function Profile(props: ProfileProps) {
  const userProfile = useUserData();
  const userPermissions = usePermissions();
  const { isLoading } = useGetProfileSettingsQuery(userProfile?.id ?? -1);

  const location = useLocation();
  const tabDefault = location.pathname.split('/').at(-1) as TabIndex ?? 'account';
  const [tabIndex, setTabIndex] = useState<TabIndex>(tabDefault);
  useEffect(() => {
    setTabIndex(tabDefault as TabIndex);
  }, [tabDefault]);


  const handleTabsChange = (event: any, newindex: TabIndex) => {
    setTabIndex(newindex);
  };

  return (
    <CustomizedCard className={styles.mainCard}>
      <CardHeader title={<Typography variant="pageHeader">Настройки</Typography>} />
      <Divider />
      <CardContent className={styles['card-content']}>
        <TabContext value={tabIndex}>
          <TabList onChange={handleTabsChange} className={styles.tabHeaderRoot}>
            <LinkTab
              label="Профиль"
              value="account"
              href="/employee/system/settings/account"
              icon={<PersonIcon />}
              iconPosition="start"
            />
            <LinkTab
              label="Безопасность"
              value="security"
              href="/employee/system/settings/security"
              icon={<ShieldIcon />}
              iconPosition="start"
            />
            <LinkTab
              label="Уведомления"
              value="notifications"
              href="/employee/system/settings/notifications"
              icon={<NotificationsIcon />}
              iconPosition="start"
            />
            <LinkTab
              label="Система"
              value="system"
              href="/employee/system/settings/system"
              className={!userPermissions?.system?.PUT ? styles.tabHeaderHide : ''}
              icon={<SettingsSuggestIcon />}
              iconPosition="start"
            />
            <LinkTab
              label="Опции"
              value="options"
              href="/employee/system/settings/options"
              icon={<TuneIcon />}
              iconPosition="start"
            />
          </TabList>
          <Divider style={{ margin: 0 }} />
          <TabPanel value="account" className={tabIndex === 'account' ? styles.tabPanel : ''}>
            <AccountTab />
          </TabPanel>
          <TabPanel value="security" className={tabIndex === 'security' ? styles.tabPanel : ''}>
            <SecurityTab />
          </TabPanel>
          <TabPanel value="notifications" className={tabIndex === 'notifications' ? styles.tabPanel : ''}>
            <NotificationsTab />
          </TabPanel>
          <PermissionsGate actionAllowed={userPermissions?.system?.PUT}>
            <TabPanel value="system" className={tabIndex === 'system' ? styles.tabPanel : ''}>
              <SystemTab />
            </TabPanel>
          </PermissionsGate>
          <TabPanel value="options" className={tabIndex === 'options' ? styles.tabPanel : ''}>
            <OptionsTab />
          </TabPanel>
        </TabContext>
      </CardContent>
    </CustomizedCard>
  );
}

export default Profile;
