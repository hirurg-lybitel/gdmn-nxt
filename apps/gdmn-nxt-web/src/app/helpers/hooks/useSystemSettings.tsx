import { useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import { ISystemSettings } from '@gsbelarus/util-api-types';

export default function useSystemSettings() {
  return useSelector<RootState, ISystemSettings | undefined>(state => state.settings.system);
};
