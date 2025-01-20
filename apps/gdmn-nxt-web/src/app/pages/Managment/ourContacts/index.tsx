import { useDispatch } from 'react-redux';
import Contacts from '../Contacts';
import { clearFilterData, saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import { useEffect } from 'react';

export default function OurContacts () {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(saveFilterData({ 'contacts': { isOur: true } }));
    return () => {
      dispatch(clearFilterData({ filterEntityName: 'contacts' }));
    };
  }, []);

  return <Contacts />;
}
