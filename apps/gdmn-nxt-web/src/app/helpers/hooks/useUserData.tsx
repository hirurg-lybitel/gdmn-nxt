import { useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import { IUserProfile } from '@gsbelarus/util-api-types';

export default function useUserData() {
  return useSelector<RootState, IUserProfile>(state => state.user.userProfile!);
};
