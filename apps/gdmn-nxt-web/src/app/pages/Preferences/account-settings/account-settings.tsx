import styles from './account-settings.module.less';

/* eslint-disable-next-line */
export interface AccountSettingsProps {}

export function AccountSettings(props: AccountSettingsProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to AccountSettings!</h1>
    </div>
  );
}

export default AccountSettings;
