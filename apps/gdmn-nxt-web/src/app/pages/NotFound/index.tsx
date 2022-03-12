import { Button, CardActions, CardContent, Grid, Typography } from '@mui/material';
import CustomizedCard from '../../components/customized-card/customized-card';
// import sdfs from '../../../assets/'
// 404

export default function NotFound() {
  console.log('NotFound');
  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignContent="center"
      sx={{ height: '100%' }}
    >
      <Grid item>
        <CustomizedCard borders boxShadows sx={{ width: 700 }}>
          <CardContent>
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="center"
              spacing={2}
              sx={{ alignSelf: 'center' }}
            >
              <Grid item xs={12}>
                <Typography align="center" sx={{ fontSize: 100, fontWeight: 700, color: '#dbdee3' }}>404</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography align="center" variant="h1" width={500}>
                    Запрошенная страница не найдена.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography align="center" variant="h4" width={600} sx={{ color: 'text.secondary' }}>
                    Извините, мы не смогли найти страницу, которую вы ищете.
                    Возможно, вы ошиблись адресом? Обязательно проверьте правописание.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', my: 2 }}>
            <Button
              variant="contained"
              component="a"
              href={'/'}
            >Вернуться на главную</Button>
          </CardActions>

        </CustomizedCard>
      </Grid>
    </Grid>

  );
}
