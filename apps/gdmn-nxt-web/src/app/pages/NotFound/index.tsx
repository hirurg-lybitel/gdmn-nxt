import { Button, Card, CardActions, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import CustomizedCard from '../../components/Styled/customized-card/customized-card';
import { useNavigate } from 'react-router-dom';
import { saveFilterData } from '../../store/filtersSlice';
import { useDispatch } from 'react-redux';
// import sdfs from '../../../assets/'
// 404

export default function NotFound() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const backToMain = () => {
    dispatch(saveFilterData({ menu: { path: '/' } }));
    navigate('/');
  };

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignContent="center"
      sx={{ height: '100%' }}
    >
      <Grid item>
        <CustomizedCard
          borders
          boxShadows
          sx={{ width: 700 }}
        >
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
                <Typography
                  align="center"
                  variant="h6"
                  width={500}
                >
                    Запрошенная страница не найдена.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  align="center"
                  variant="body1"
                  width={600}
                  fontWeight={600}
                  color={'text.secondary'}
                >
                    Извините, мы не смогли найти страницу, которую вы ищете.
                    Возможно, вы ошиблись адресом? Обязательно проверьте путь.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', my: 2 }}>
            <Button
              variant="contained"
              component="a"
              onClick={backToMain}
            >Вернуться на главную</Button>
          </CardActions>

        </CustomizedCard>
      </Grid>
    </Grid>

  );
}
