import styles from './user-groups.module.less';

/* eslint-disable-next-line */
export interface UserGroupsProps {}

export function UserGroups(props: UserGroupsProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to UserGroups!</h1>
    </div>
  );
}

export default UserGroups;
