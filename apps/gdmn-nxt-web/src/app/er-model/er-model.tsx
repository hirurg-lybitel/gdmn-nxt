import { CircularIndeterminate } from '../circular-indeterminate/circular-indeterminate';
import { useGetErModelQuery } from '../features/er-model/erModelApi';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import './er-model.module.less';
import TreeView from '@mui/lab/TreeView/TreeView';
import { Entity, IEntities, IERModel } from '@gsbelarus/util-api-types';
import TreeItem from '@mui/lab/TreeItem';
import { useMemo } from 'react';

/* eslint-disable-next-line */
export interface ErModelProps {};

export function ErModel(props: ErModelProps) {

  const { data, isFetching, isError } = useGetErModelQuery();

  const recurse = (parent?: string) => data && Object.values(data.entities)
    .filter( e => e.parent === parent )
    .map(
      e => 
        <TreeItem key={e.name} nodeId={e.name} label={e.name}>
          {recurse(e.name)}
        </TreeItem>
    );

  const treeItems = useMemo(recurse, [data]);  
  
  return (
    isFetching ?
      <CircularIndeterminate open={true} />
    :
      <TreeView
        aria-label="er-model"
        defaultExpanded={['TgdcBase']}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
      >
        {treeItems}
      </TreeView>  
  );
};

export default ErModel;
