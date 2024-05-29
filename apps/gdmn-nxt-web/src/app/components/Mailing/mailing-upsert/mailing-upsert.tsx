import styles from './mailing-upsert.module.less';

/* eslint-disable-next-line */
export interface MailingUpsertProps {}

export function MailingUpsert(props: MailingUpsertProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to MailingUpsert!</h1>
    </div>
  );
}

export default MailingUpsert;
