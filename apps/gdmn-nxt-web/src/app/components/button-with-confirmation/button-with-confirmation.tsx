import { Button, ButtonProps } from '@mui/material';
import styles from './button-with-confirmation.module.less';
import Confirmation from '../helpers/confirmation';
import { ReactNode, useCallback } from 'react';

export interface ButtonWithConfirmationProps extends ButtonProps {
  children: ReactNode;
  title: string;
  text?: string;
  dangerous?: boolean;
  confirmation?: boolean;
  onClick: () => void;
}

export function ButtonWithConfirmation({
  children,
  title,
  text = 'Вы уверены, что хотите продолжить?',
  confirmation = true,
  dangerous,
  onClick,
  ...props
}: ButtonWithConfirmationProps) {
  const hanldeConfirm = useCallback(() => {
    onClick && onClick();
  }, [onClick]);

  return (
    confirmation
      ? <Confirmation
        title={title}
        text={text}
        dangerous={dangerous}
        onConfirm={hanldeConfirm}
      >
        <Button
          {...props}
        >
          {children}
        </Button>
      </Confirmation>
      : <Button
        {...props}
        onClick={onClick}
      >
        {children}
      </Button>
  );
}

export default ButtonWithConfirmation;
