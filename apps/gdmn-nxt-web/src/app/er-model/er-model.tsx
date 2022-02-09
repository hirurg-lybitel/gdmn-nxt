import { CircularIndeterminate } from '../circular-indeterminate/circular-indeterminate';
import { useGetErModelQuery } from '../features/er-model/erModelApi';
import './er-model.module.less';

/* eslint-disable-next-line */
export interface ErModelProps {};

export function ErModel(props: ErModelProps) {

  const { data, isFetching, isError } = useGetErModelQuery();

  return (
    isFetching ?
      <CircularIndeterminate open={true} />
    :
      <pre>
        {JSON.stringify(data, undefined, 2)}
      </pre>  
  );
};

export default ErModel;
