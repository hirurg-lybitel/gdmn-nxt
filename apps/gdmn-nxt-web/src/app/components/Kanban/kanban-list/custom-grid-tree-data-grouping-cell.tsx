import { Box, ButtonProps, Chip, IconButton, Stack } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { GridGroupNode, GridRenderCellParams, gridFilteredDescendantCountLookupSelector, useGridApiContext, useGridSelector } from '@mui/x-data-grid-pro';
import { renderCellExpand } from '../../Styled/styled-grid/styled-grid';
import { useCallback } from 'react';
import { IKanbanColumn } from '@gsbelarus/util-api-types';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import usePermissions from '../../helpers/hooks/usePermissions';

interface CustomGridTreeDataGroupingCellProps extends GridRenderCellParams<any, any, any, GridGroupNode> {
  columns?: IKanbanColumn[];
  onCardAddClick?: (columnId: number) => void;
  disableAddCard?: boolean;
}

export const CustomGridTreeDataGroupingCell = (props: CustomGridTreeDataGroupingCellProps) => {
  const { id, field, rowNode, value, row, columns = [], disableAddCard = false, onCardAddClick } = props;

  const userPermissions = usePermissions();

  const column = columns?.find(c => c.ID === Number(value));

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

  const handleCardAdd = useCallback(() => {
    onCardAddClick && onCardAddClick(Number(value));
  }, [onCardAddClick, value]);

  /** For indent */
  if (filteredDescendantCount === 0) {
    return (
      <>
        <div style={{ marginLeft: '48px' }} />
        {renderCellExpand(props, row.USR$NAME || '')}
      </>
    );
  }

  return (
    <Box sx={{ ml: rowNode.depth * 4 }}>
      <div>
        {filteredDescendantCount > 0 ? (
          <Stack direction="row" alignItems="center">
            {!disableAddCard &&
              <PermissionsGate actionAllowed={userPermissions?.deals.POST}>
                <IconButton
                  onClick={handleCardAdd}
                  color="primary"
                  size="small"
                  {...(() => column?.USR$INDEX !== 0
                    ? {
                      disabled: true
                    }
                    : {})()}
                >
                  <AddCircleIcon />
                </IconButton>
              </PermissionsGate>}
            <IconButton
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              size="small"
              tabIndex={-1}
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
                {column?.USR$NAME || ''}
              </Box>
              <Chip label={filteredDescendantCount} size="small" />
            </Stack>
          </Stack>
        ) : (
          <span />
        )}
      </div>
    </Box>
  );
};
