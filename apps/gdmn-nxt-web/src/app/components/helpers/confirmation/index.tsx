import { DetailedHTMLProps, HTMLAttributes, useCallback, useMemo, useState } from 'react';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';

interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: JSX.Element;
  onConfirm: () => void;
  dangerous?: boolean;
  title?: string;
  text?: string;
  actions?: [string, string];
  onClose?: () => void;
}
export default function Confirmation({
  children,
  onConfirm,
  dangerous = false,
  text = 'Вы уверены, что хотите продолжить?',
  title = 'Внимание',
  actions = ['Нет', 'Да'],
  onClose,
  ...props
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const handleClick = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmOpen(false);
    onClose && onClose();
  }, []);

  const handleConfirm = useCallback(() => {
    setConfirmOpen(false);
    onConfirm();
  }, [onConfirm]);

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      dangerous={dangerous}
      title={title}
      text={text}
      actions={actions}
      confirmClick={handleConfirm}
      cancelClick={handleCancel}
    />,
  [actions, confirmOpen, dangerous, handleCancel, handleConfirm, text, title]);

  return (
    <>
      <div {...props} onClick={handleClick}>
        {children}
      </div>
      {memoConfirmDialog}
    </>
  );
}
