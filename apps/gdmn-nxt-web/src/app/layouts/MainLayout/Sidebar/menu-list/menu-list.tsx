import { Box, Stack, TextField, Typography, useTheme } from '@mui/material';
import menuItems, { IMenuItem, representativeMenuItems } from '../../../../menu-items';
import MenuGroup from '../menu-group/menu-group';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import { makeStyles } from '@mui/styles';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { useCallback, useMemo, useState } from 'react';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import MenuItem from '../menu-item/menu-item';
import { useSelector } from 'react-redux';
import { Permissions } from '@gsbelarus/util-api-types';
import { RootState } from 'apps/gdmn-nxt-web/src/app/store';
import MenuCollapse from '../menu-collapse/menu-collapse';

const useStyles = makeStyles(() => ({
  scroll: {
    paddingLeft: '16px',
    paddingRight: '16px',
    '& .ps__rail-y': {
      borderRadius: 'var(--border-radius)',
      opacity: 0.5,
    },
    '& .ps__thumb-y ': {
      backgroundColor: 'white',
    },
  },
}));


/* eslint-disable-next-line */
export interface MenuListProps {
  onItemClick?: (item: IMenuItem, lavel: number) => void;
}

export function MenuList({ onItemClick }: Readonly<MenuListProps>) {
  const classes = useStyles();
  const theme = useTheme();

  const representative = useSelector<RootState, boolean>(state => state.user.userProfile?.isCustomerRepresentative ?? false);

  const [searchText, setSearchText] = useState('');

  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  function filterMenuItems(menu: IMenuItem[], searchText: string): IMenuItem[] {
    if (searchText === '') {
      return menu;
    }
    return menu.reduce((filteredItems, menuItem) => {
      if (['item', 'collapse'].includes(menuItem.type) && menuItem.title?.toUpperCase().includes(searchText.toUpperCase())) {
        filteredItems.push(menuItem);
      }
      if (menuItem.children && menuItem.children.length > 0) {
        const filteredChildren = filterMenuItems(menuItem.children, searchText);
        filteredItems.push(...filteredChildren);
      }
      return filteredItems;
    }, [] as IMenuItem[]);
  }

  const handleClick = useCallback((item: IMenuItem, lavel: number) => {
    onItemClick && onItemClick(item, lavel);
  }, [onItemClick]);

  const navItems = useMemo(() => filterMenuItems(representative ? representativeMenuItems.items : menuItems.items, searchText)
    .map((item) => {
      switch (item.type) {
        case 'collapse':
          return (
            <MenuCollapse
              onClick={handleClick}
              key={item.id}
              menu={item}
              level={1}
            />
          );
        case 'group':
          return (
            <MenuGroup
              onClick={handleClick}
              key={item.id}
              item={item}
            />
          );
        case 'item':
          return (
            <PermissionsGate
              key={item.id}
              actionAllowed={userPermissions?.[item.actionCheck?.name ?? '']?.[item.actionCheck?.method ?? ''] ?? !item.actionCheck}
            >
              <MenuItem
                onClick={handleClick}
                key={item.id}
                item={item}
                level={1}
              />
            </PermissionsGate>
          );
        default:
          return (
            <Typography
              key={item.id}
              variant="h6"
              color="error"
              align="center"
            >
              Ошибка отображения
            </Typography>
          );
      }
    }), [filterMenuItems, handleClick, searchText, userPermissions]);

  const searchOnChange = (value: string) => {
    setSearchText(value);
  };

  const searchOnClear = () => {
    setSearchText('');
  };

  return (
    <Stack height="100%" spacing={0.5}>
      <div
        style={{
          padding: '0 8px'
        }}
      >
        <SearchBar
          fullWidth
          onCancelSearch={searchOnClear}
          onChange={searchOnChange}
        />
      </div>
      <Box height="100%">
        <CustomizedScrollBox
          externalScrollLock
          className={classes.scroll}
          withBlur
          backgroundColor={theme.menu?.backgroundColor}
        >
          {navItems}
        </CustomizedScrollBox>
      </Box>
    </Stack>
  );
}

export default MenuList;
