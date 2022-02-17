import { Outlet } from 'react-router-dom';
import './base-form.module.less';

/* eslint-disable-next-line */
export interface BaseFormProps {};

export function BaseForm(props: BaseFormProps) {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default BaseForm;
