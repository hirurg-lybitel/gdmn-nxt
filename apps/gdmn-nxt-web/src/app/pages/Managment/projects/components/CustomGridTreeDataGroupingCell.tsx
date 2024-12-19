import { Box, ButtonProps, Chip, IconButton, Stack } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { GridGroupNode, GridRenderCellParams, gridFilteredDescendantCountLookupSelector, useGridApiContext, useGridSelector } from '@mui/x-data-grid-pro';
import { useCallback } from 'react';
import { IKanbanColumn, ITimeTrackProject, ITimeTrackTask } from '@gsbelarus/util-api-types';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import { renderCellExpand } from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SwitchStar from '@gdmn-nxt/components/switch-star/switch-star';
import { useAddFavoriteTaskMutation, useDeleteFavoriteTaskMutation } from 'apps/gdmn-nxt-web/src/app/features/time-tracking';

interface CustomGridTreeDataGroupingCellProps extends GridRenderCellParams<any, any, any, GridGroupNode> {
  projects?: ITimeTrackProject[];
}

export const CustomGridTreeDataGroupingCell = (props: CustomGridTreeDataGroupingCellProps) => {
  const { id, field, rowNode, value, row, projects = [] } = props;

  const userPermissions = usePermissions();

  const project = projects?.find(c => c.ID === Number(value));

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
    // onCardAddClick && onCardAddClick(Number(value));
  }, [value]);

  const [addFavoriteTask] = useAddFavoriteTaskMutation();
  const [deleteFavoriteTask] = useDeleteFavoriteTaskMutation();

  const handleSwitchFavorite = (row: any) => () => {
    const data = { taskId: row.ID, projectId: (row).hierarchy[0] };
    if (row.isFavorite) {
      deleteFavoriteTask(data);
    } else {
      addFavoriteTask(data);
    }
  };

  /** For indent */
  if (filteredDescendantCount === 0) {
    return (
      <>
        <SwitchStar selected={row.isFavorite} onClick={handleSwitchFavorite(row)} />
        <div style={{ marginLeft: '10px' }} />
        {renderCellExpand(props, row.name || '')}
      </>
    );
  }

  return (
    <Box sx={{ ml: rowNode.depth * 4 }}>
      <div>
        {filteredDescendantCount > 0 ? (
          <Stack direction="row" alignItems="center">
            {project?.isFavorite ? <StarIcon style={{ color: '#faaf00' }} /> : <StarBorderIcon />}
            {/* <PermissionsGate actionAllowed={userPermissions?.deals.POST}>
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
            </PermissionsGate> */}
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
                {project?.name || ''}
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
