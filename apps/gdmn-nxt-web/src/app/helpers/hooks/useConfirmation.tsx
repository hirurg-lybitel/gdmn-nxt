import { useMemo, useState } from 'react';
import ConfirmDialog from '../../confirm-dialog/confirm-dialog';

export interface IConfirmationProps {
  title?: string;
  text?: string;
  dangerous?: boolean;
  confirmClick?: () => void;
  cancelClick?: () => void;
  actions?: [string, string];
}

export default function useConfirmation() {
  const [options, setOptions] = useState<IConfirmationProps>({});
  const [open, setOpen] = useState(false);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleChangeOptions = (options: IConfirmationProps) => {
    setOptions(options);
  };

  const handleClose = () => setOpen(false);

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={open}
      {...options}
      cancelClick={options.cancelClick || handleClose}
    />,
  [open, options]);

  return [{ dialog: memoConfirmDialog, setOpen: handleOpenChange, setOptions: handleChangeOptions }];
}
