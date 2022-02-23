import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { RootState } from "../../store";
import { addViewForm } from "./viewFormsSlice";

export const useViewForms = (name: string) => {
  const { viewForms } = useSelector( (state: RootState) => state.viewForms );
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  let activeViewForm = viewForms.find( vf => vf.pathname === pathname );

  if (!activeViewForm) {
    let nameCandidate = name;
    for (let i = 1; viewForms.find( vf => vf.name === nameCandidate ); nameCandidate = `${name} #${i++}`) {}
    activeViewForm = { name: nameCandidate, pathname };
    dispatch(addViewForm(activeViewForm));
  }

  return { viewForms, activeViewForm };
};