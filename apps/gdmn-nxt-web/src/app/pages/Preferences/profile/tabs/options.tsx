import { Checkbox, Stack, } from '@mui/material';
import { useGetProfileSettingsQuery, useSetProfileSettingsMutation } from 'apps/gdmn-nxt-web/src/app/features/profileSettings';
import { RootState } from 'apps/gdmn-nxt-web/src/app/store';
import { setAppOptions, setSystemSettings } from 'apps/gdmn-nxt-web/src/app/store/settingsSlice';
import { useDispatch, useSelector } from 'react-redux';
export default function OptionsTab() {
  const userId = useSelector<RootState, number>(state => state.user.userProfile?.id ?? -1);
  const { data: profileSettings } = useGetProfileSettingsQuery(userId || -1, { skip: !userId });
  const [setSettings, { isLoading }] = useSetProfileSettingsMutation();
  const dispatch = useDispatch();
  const appOptions = useSelector((state: RootState) => state.settings.appOptions);

  const handleClick = () => {
    dispatch(setAppOptions({ saveFilters: !appOptions.saveFilters }));
    setSettings({
      userId,
      body: {
        ...profileSettings,
        SAVEFILTERS: !appOptions.saveFilters,
      }
    });
  };

  console.log(appOptions);

  return (
    <Stack>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          disabled={isLoading || !userId}
          checked={appOptions.saveFilters}
          onClick={handleClick}
        /> Сохранять выбранные фильтры
      </div>
    </Stack>
  );
}
