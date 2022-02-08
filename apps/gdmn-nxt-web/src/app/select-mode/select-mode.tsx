import { Card, CardActions, CardHeader, Grid, Stack, Typography } from '@mui/material';
import Button from '@mui/material/Button/Button';
import './select-mode.module.less';

export interface SelectModeProps {
  employeeModeSelected: () => void;
  customerModeSelected: () => void;
};

export function SelectMode({ employeeModeSelected, customerModeSelected }: SelectModeProps) {
  return (
    <Card >
      <CardHeader title={<Typography variant="h1" align="center" noWrap>Добро пожаловать на портал БелГИСС</Typography>} />
      <CardActions>
        <Grid container justifyContent="center" spacing={2}>
          <Grid item >
            <Button
              onClick={employeeModeSelected}
              variant="contained"
              sx={{ width: 220}}
            >
              Войти как сотрудник
            </Button>

          </Grid>
          <Grid item>
            <Button
              onClick={customerModeSelected}
              variant="contained"
              sx={{ width: 220}}
            >
              Войти как клиент
            </Button>
          </Grid>
        </Grid>
      </CardActions>
      </Card>
  );
}

export default SelectMode;
