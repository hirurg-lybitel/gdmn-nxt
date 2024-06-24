import { Box, ButtonProps, Chip, IconButton, Stack } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { GridGroupNode, GridRenderCellParams, gridFilteredDescendantCountLookupSelector, useGridApiContext, useGridSelector } from '@mui/x-data-grid-pro';
import { useCallback } from 'react';
import { renderCellExpand } from '../../../components/Styled/styled-grid/styled-grid';

interface CustomGridTreeDataGroupingCellProps extends GridRenderCellParams<any, any, any, GridGroupNode> {};

export const CustomGridTreeDataGroupingCell = (props: CustomGridTreeDataGroupingCellProps) => {
  const { id, field, rowNode, value, row } = props;


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
    apiRef.current.setRowChildrenExpansion(id, !rowNode.childrenExpanded);
    apiRef.current.setCellFocus(id, field);
    event.stopPropagation();
  };

  if (filteredDescendantCount === 0) {
    const title: string = (() => {
      const names = row.NAME.split('/');
      if (names.length === 1) {
        return row.NAME;
      };
      return names[1].trim();
    })();
    return (
      <Box sx={{ ml: rowNode.depth === 0 ? '34px' : rowNode.depth * 6 }}>
        {renderCellExpand(props, title)}
      </Box>
    );
  }

  return (
    <Box sx={{ ml: rowNode.depth * 4 }}>
      <div>
        <Stack direction="row" alignItems="center">
          <IconButton
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            size="small"
          >
            {rowNode.childrenExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            mt={0.5}
          >
            <Box>
              {value}
            </Box>
            <Chip label={filteredDescendantCount} size="small" />
          </Stack>
        </Stack>
      </div>
    </Box>
  );
};
