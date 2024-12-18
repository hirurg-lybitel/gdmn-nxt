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
  disabled?: boolean
}
export default function Confirmation({
  children,
  onConfirm,
  dangerous = false,
  text = 'Вы уверены, что хотите продолжить?',
  title = 'Внимание',
  actions = ['Нет', 'Да'],
  onClose,
  disabled,
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
      <div {...props} onClick={disabled ? undefined : handleClick}>
        {children}
      </div>
      {memoConfirmDialog}
    </>
  );
}
