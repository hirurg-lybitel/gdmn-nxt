import Button from '@mui/material/Button/Button';
import './select-mode.module.less';

export interface SelectModeProps {
  employeeModeSelected: () => void;
  customerModeSelected: () => void;
};

export function SelectMode({ employeeModeSelected, customerModeSelected }: SelectModeProps) {
  return (
    <div>
      <h1>Добро пожаловать на портал БелГИСС</h1>
      <Button onClick={employeeModeSelected}>Войти как сотрудник</Button>
      <Button onClick={customerModeSelected}>Войти как клиент</Button>
    </div>
  );
}

export default SelectMode;
