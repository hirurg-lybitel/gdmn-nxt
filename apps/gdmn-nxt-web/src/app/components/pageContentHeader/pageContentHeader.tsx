import { Box, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import SearchBar from '../search-bar/search-bar';
import CustomizedCard from '../Styled/customized-card/customized-card';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import CustomFilterButton from '@gdmn-nxt/helpers/custom-filter-button';
import { ReactNode, useMemo } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PermissionsGate from '../Permissions/permission-gate/permission-gate';

interface PageHeaderProps {
  title?: string,
  isLoading?: boolean,
  isFetching?: boolean,
  onCancelSearch: () => void,
  onRequestSearch: (value: string) => void,
  searchValue?: string,
  searchPlaceholder?: string,
  onRefetch: () => void,
  onFilterClick: () => void,
  hasFilters?: boolean
  onAddClick?: () => void,
  addButton?: boolean
  addButtonTooltip?: string,
  action?: ReactNode,
  wrapAction?: ReactNode
}

export default function PageContentHeader(props: PageHeaderProps) {
  const {
    title,
    isLoading = false,
    isFetching = false,
    onCancelSearch,
    onRequestSearch,
    searchValue,
    searchPlaceholder = 'Поиск',
    onRefetch,
    onFilterClick,
    hasFilters = false,
    onAddClick,
    addButton = false,
    addButtonTooltip,
    action,
    wrapAction
  } = props;

  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const searchBar = useMemo(() => (
    <SearchBar
      fullWidth={matchDownSm}
      disabled={isLoading}
      onCancelSearch={onCancelSearch}
      onRequestSearch={onRequestSearch}
      cancelOnEscape
      placeholder={searchPlaceholder}
      value={searchValue}
    />
  ), [isLoading, matchDownSm, onCancelSearch, onRequestSearch, searchPlaceholder, searchValue]);

  return (
    <CustomizedCard
      direction="row"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: matchDownSm ? 'visible' : 'hidden',
        minHeight: matchDownSm ? 'auto' : '54px',
        padding: '10px 16px',
        alignItems: 'center'
      }}
    >
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', minHeight: '34px' }}>

        {title && <Typography style={{ textWrap: 'nowrap', marginRight: '8px' }} variant="pageHeader">{title}</Typography>}
        {action && (
          <Box>
            {action}
          </Box>
        )}
        {wrapAction && (
          <Box display={{ xs: 'none', sm: 'block' }}>
            {wrapAction}
          </Box>
        )}
        <Box flex={1} />
        <Box
          pr={1}
          display={{ xs: 'none', sm: 'block' }}
          minWidth={0}
        >
          {searchBar}
        </Box>

        {addButton && <Box display="inline-flex" alignSelf="center">
          <IconButton
            size="small"
            disabled={isFetching}
            onClick={onAddClick}
          >
            <Tooltip arrow title={addButtonTooltip ?? ''}>
              <AddCircleIcon color={isFetching ? 'disabled' : 'primary'} />
            </Tooltip>
          </IconButton>
        </Box>}
        <CustomLoadingButton
          hint="Обновить данные"
          loading={isFetching}
          onClick={onRefetch}
        />
        <Box display="inline-flex" alignSelf="center">
          <CustomFilterButton
            onClick={onFilterClick}
            disabled={isFetching}
            hasFilters={hasFilters}
          />
        </Box>
      </div>
      <Box style={{ width: '100% ', marginTop: '10px' }} display={{ xs: 'block', sm: 'none' }}>
        {wrapAction}
      </Box>
      <Box style={{ width: '100% ', marginTop: '10px' }} display={{ xs: 'block', sm: 'none' }}>
        {searchBar}
      </Box>
    </CustomizedCard>
  );
}
