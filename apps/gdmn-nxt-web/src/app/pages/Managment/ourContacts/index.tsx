import { useDispatch } from 'react-redux';
import Contacts from '../contacts';
import { clearFilterData, saveFilterData } from '../../../store/filtersSlice';
import { useEffect } from 'react';

export default function OurContacts () {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(saveFilterData({ 'contacts': { isOur: true } }));
    return () => {
      dispatch(clearFilterData('contacts'));
    };
  }, []);

  return <Contacts />;
}
