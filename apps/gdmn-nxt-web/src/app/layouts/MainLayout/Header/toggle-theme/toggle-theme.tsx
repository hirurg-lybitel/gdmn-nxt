import { IconButton } from '@mui/material';
import styles from './toggle-theme.module.less';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ColorMode } from '@gsbelarus/util-api-types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'apps/gdmn-nxt-web/src/app/store';
import { useGetProfileSettingsQuery, useSetProfileSettingsMutation } from 'apps/gdmn-nxt-web/src/app/features/profileSettings';
import { setColorMode } from 'apps/gdmn-nxt-web/src/app/store/settingsSlice';

/* eslint-disable-next-line */
export interface ToggleThemeProps {}

export function ToggleTheme(props: ToggleThemeProps) {
  const dispatch = useDispatch();
  const userId = useSelector<RootState, number>(state => state.user.userProfile?.id ?? -1);
  const settings = useSelector((state: RootState) => state.settings);

  const { data: profileSettings } = useGetProfileSettingsQuery(userId || -1, { skip: !userId });
  const [setSettings, { isLoading }] = useSetProfileSettingsMutation();
  const addOrUpdateTheme = (typeTheme: ColorMode) => {
    if (!userId) {
      return;
    }
    setSettings({
      userId,
      body: {
        ...profileSettings,
        COLORMODE: typeTheme,
      }
    });
  };

  const handleChange = async (event: any) => {
    if (!userId) {
      return;
    }
    if (settings.customization.colorMode === ColorMode.Light) {
      dispatch(setColorMode(ColorMode.Dark));
      addOrUpdateTheme(ColorMode.Dark);
    } else {
      dispatch(setColorMode(ColorMode.Light));
      addOrUpdateTheme(ColorMode.Light);
    }
  };
  return (
    <IconButton
      onClick={handleChange}
      size="large"
      disabled={isLoading}
    >
      {settings.customization.colorMode === ColorMode.Light
        ? <NightsStayIcon color="secondary" />
        : <LightModeIcon />}
    </IconButton>
  );
}

export default ToggleTheme;
