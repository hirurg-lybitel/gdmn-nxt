import { Box, ButtonProps, Chip, IconButton, Stack } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { GridGroupNode, GridRenderCellParams, gridFilteredDescendantCountLookupSelector, useGridApiContext, useGridSelector } from '@mui/x-data-grid-pro';
import { renderCellExpand } from '../../Styled/styled-grid/styled-grid';
import { useCallback } from 'react';
import { IKanbanColumn } from '@gsbelarus/util-api-types';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';

interface CustomGridTreeDataGroupingCellProps extends GridRenderCellParams<any, any, any, GridGroupNode> {
  columns?: IKanbanColumn[];
  onCardAddClick?: (columnId: number) => void;
  disableAddCard?: boolean;
}

export const CustomGridTreeDataGroupingCell = (props: CustomGridTreeDataGroupingCellProps) => {
  const { rowNode, value, row, disableAddCard = false, onCardAddClick, formattedValue } = props;

  const userPermissions = usePermissions();

  const handleCardAdd = useCallback((e: any) => {
    e.stopPropagation();
    onCardAddClick && onCardAddClick(Number(value));
  }, [onCardAddClick, value]);

  return (
    <Box sx={{ ml: rowNode.depth * 4 }}>
      <div>
        <Stack
          direction="row"
          alignItems="center"
          onClick={(e) => row?.CARDS.length < 1 && e.stopPropagation()}
        >
          <PermissionsGate actionAllowed={userPermissions?.deals.POST}>
            <IconButton
              onClick={handleCardAdd}
              color="primary"
              size="small"
              disabled={row?.USR$INDEX !== 0 || disableAddCard}
            >
              <AddCircleIcon />
            </IconButton>
          </PermissionsGate>
          <IconButton
            size="small"
            disabled={row?.CARDS.length < 1}
          >
            {formattedValue ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            mt={0.5}
            style={{ pointerEvents: 'none' }}
          >
            <Box>
              {row?.USR$NAME || ''}
            </Box>
            <Chip label={row?.CARDS.length.toString()} size="small" />
          </Stack>
        </Stack>
      </div>
    </Box>
  );
};
