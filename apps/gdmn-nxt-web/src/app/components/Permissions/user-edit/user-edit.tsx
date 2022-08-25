import styles from './user-edit.module.less';

/* eslint-disable-next-line */
export interface UserEditProps {}

export function UserEdit(props: UserEditProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to UserEdit!</h1>
    </div>
  );
}

export default UserEdit;
