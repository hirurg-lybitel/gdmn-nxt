import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import { addViewForm } from './viewFormsSlice';

export const useViewForms = (name: string) => {
  const { viewForms } = useSelector((state: RootState) => state.viewForms);
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const activeViewForm = viewForms.find(vf => vf.pathname === pathname);

  useEffect(() => {
    if (!activeViewForm) {
      let nameCandidate = name;
      for (let i = 1; viewForms.find(vf => vf.name === nameCandidate); nameCandidate = `${name} #${i++}`);
      const newActiveViewForm = { name: nameCandidate, pathname };
      dispatch(addViewForm(newActiveViewForm));
    }
  }, [viewForms, activeViewForm, name, pathname, dispatch]);

  return { viewForms, activeViewForm };
};