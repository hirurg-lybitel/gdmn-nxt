import { Box, ButtonProps, Chip, IconButton, Stack } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { GridRenderCellParams, gridFilteredDescendantCountLookupSelector, useGridApiContext, useGridSelector } from '@mui/x-data-grid-pro';
import { renderCellExpand } from '../../Styled/styled-grid/styled-grid';
import { useCallback } from 'react';
import { IKanbanColumn } from '@gsbelarus/util-api-types';

interface CustomGridTreeDataGroupingCellProps extends GridRenderCellParams {
  columns?: IKanbanColumn[];
}

export const CustomGridTreeDataGroupingCell = (props: CustomGridTreeDataGroupingCellProps) => {
  const { id, field, rowNode, value, row, columns = [] } = props;

  const column = columns?.find(c => c.ID === value);

  const apiRef = useGridApiContext();
  const filteredDescendantCountLookup = useGridSelector(
    apiRef,
    gridFilteredDescendantCountLookupSelector,
  );
  const filteredDescendantCount = filteredDescendantCountLookup[rowNode.id] ?? 0;

  const isNavigationKey = useCallback((key: string) =>
    key === 'Home' ||
    key === 'End' ||
    key.indexOf('Arrow') === 0 ||
    key.indexOf('Page') === 0 ||
    key === ' '
  , []);

  const handleKeyDown: ButtonProps['onKeyDown'] = (event) => {
    if (event.key === ' ') {
      event.stopPropagation();
    }
    if (isNavigationKey(event.key) && !event.shiftKey) {
      apiRef.current.publishEvent('cellNavigationKeyDown' as any, props, event);
    }
  };

  const handleClick: ButtonProps['onClick'] = (event) => {
    apiRef.current.setRowChildrenExpansion(id, !(rowNode as any).childrenExpanded);
    apiRef.current.setCellFocus(id, field);
    event.stopPropagation();
  };

  /** For indent */
  if (filteredDescendantCount === 0) {
    return (
      <>
        <div style={{ marginLeft: '48px' }} />
        {renderCellExpand(props, row.TASK?.USR$NAME || '')}
      </>
    );
  }

  return (
    <Box sx={{ ml: rowNode.depth * 4 }}>
      <div>
        {filteredDescendantCount > 0 ? (
          <Stack direction="row" alignItems="center">
            <IconButton
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              size="small"
              tabIndex={-1}
            >
              {(rowNode as any).childrenExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
            </IconButton>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              mt={0.5}
            >
              <Box>
                {column?.USR$NAME || ''}
              </Box>
              <Chip label={filteredDescendantCount} size="small" />
            </Stack>
          </Stack>
        ) : (

          <span style={{ paddingLeft: 24 }}>{renderCellExpand(props, row.TASK?.USR$NAME || '')}</span>
        )}
      </div>
    </Box>
  );
};
