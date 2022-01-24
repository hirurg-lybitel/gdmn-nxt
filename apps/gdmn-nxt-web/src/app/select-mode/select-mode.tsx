import { Stack, Typography } from '@mui/material';
import Button from '@mui/material/Button/Button';
import './select-mode.module.less';

export interface SelectModeProps {
  employeeModeSelected: () => void;
  customerModeSelected: () => void;
};

export function SelectMode({ employeeModeSelected, customerModeSelected }: SelectModeProps) {
  return (
    <>
      <Typography
        variant="h1"
      >
        Добро пожаловать на портал БелГИСС
      </Typography>
      <Stack direction="row" justifyContent="center" alignContent="stretch" spacing={2}>
        <Button
          onClick={employeeModeSelected}
          variant="contained"
        >
          Войти как сотрудник
        </Button>
        <Button
          onClick={customerModeSelected}
          variant="contained"
        >
          Войти как клиент
        </Button>
      </Stack>
    </>
  );
}

export default SelectMode;
