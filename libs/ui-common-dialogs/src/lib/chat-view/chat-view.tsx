import styles from './chat-view.module.less';

/* eslint-disable-next-line */
export interface ChatViewProps {}

export function ChatView(props: ChatViewProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to ChatView!</h1>
    </div>
  );
}

export default ChatView;
