/* eslint-disable react/prop-types */
import { Avatar, Box, IconButton, InputBase } from '@mui/material';
import { styled, ThemeProvider } from '@mui/styles';
import { Link, Outlet, useLocation } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import './base-form.module.less';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { GdmnTheme, gdmnTheme } from '../theme/gdmn-theme';
import menuItems from '../menu-items';
import { useCallback, useEffect } from 'react';
import { clearError } from '../features/error-slice/error-slice';
import { useGetErModelQuery } from '../features/er-model/erModelApi';
import { useTheme } from '@mui/material/styles';
import styles from './base-form.module.less';
import { useSnackbar } from '@gdmn-nxt/helpers/hooks/useSnackbar';
/* eslint-disable-next-line */
export interface BaseFormProps {};

export function BaseForm(props: BaseFormProps) {
  const themeStyles = useTheme();
  const Header = styled('header')({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '4px 8px 8px 8px',
    backgroundColor: themeStyles.palette.background.paper,
    borderTopColor: themeStyles.palette.background.paper,
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    '& a': {
      textDecoration: 'none',
      outline: 'none',
      color: themeStyles.textColor,
    }
  });

  const TopLine = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 30,
    width: '100%',
  });

  const TopLeftLinks = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12
  });

  const SearchBox = () =>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 26,
        width: 400,
        p: '2px 2px',
        backgroundColor: themeStyles.palette.background.paper,
        borderColor: gdmnTheme.palette.grey['400'],
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 1,
      }}
    >
      <IconButton size="small" aria-label="search">
        <SearchIcon sx={{ width: 16, height: 16 }} />
      </IconButton>
      <InputBase
        sx={{
          ml: 1,
          flex: 1,
          fontSize: gdmnTheme.typography.smallUI.fontSize
        }}
        placeholder="Enter search text..."
      />
    </Box>;

  const Menubar = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: '16px',
    width: '100%',
    marginTop: 4,
    height: 22,
    color: themeStyles.textColor,
    fontSize: (theme as GdmnTheme).typography.mediumUI.fontSize,
  }));

  const MenubarItem = styled('div')((props: { active?: 1 }) => ({
    fontWeight: props.active ? '500' : 'normal',
    borderBottom: props.active ? `2px solid ${gdmnTheme.palette.primary.main}` : 'none'
  }));

  const Footer = styled('footer')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 48,
    padding: 0,
    backgroundColor: themeStyles.palette.background.paper,
    borderTopColor: gdmnTheme.palette.grey['400'],
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    borderBottomColor: gdmnTheme.palette.grey['400'],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    color: themeStyles.textColor,
    fontSize: (theme as GdmnTheme).typography.smallUI.fontSize,
  }));

  const FooterTabs = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: 24,
    gap: 4,
    '& a': {
      textDecoration: 'none',
      outline: 'none'
    }
  });

  const FooterTab = styled('div')(({ highlighted }: { highlighted?: 1 }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
    top: -1,
    height: 24,
    minWidth: 80,
    padding: '0px 8px 0px 8px',
    backgroundColor: themeStyles.palette.background.paper,
    borderTopWidth: highlighted ? 0 : 1,
    borderTopColor: gdmnTheme.palette.grey['400'],
    borderTopStyle: 'solid',
    borderRightColor: gdmnTheme.palette.grey['400'],
    borderRightStyle: 'solid',
    borderRightWidth: 1,
    borderBottomColor: highlighted ? gdmnTheme.palette.primary.main : gdmnTheme.palette.grey['400'],
    borderBottomStyle: 'solid',
    borderBottomWidth: highlighted ? 3 : 1,
    borderLeftColor: gdmnTheme.palette.grey['400'],
    borderLeftStyle: 'solid',
    borderLeftWidth: 1,
    fontSize: gdmnTheme.typography.mediumUI.fontSize,
    fontWeight: highlighted ? gdmnTheme.typography.selectedUI.fontWeight : 'normal',
    color: highlighted ? gdmnTheme.palette.primary.main : themeStyles.textColor,
  }));

  const FooterBottom = styled('div')({
    padding: '2px 8px 2px 8px',
  });

  const Main = styled('main')({
    height: '100%',
    minHeight: 'calc(100vh - 62px - 48px)',
    maxHeight: 'calc(100vh - 62px - 48px)',
  });

  const Wrapper = styled('section')({
    display: 'grid',
    gridTemplateRows: '62px 1fr 48px',
    minHeight: '100vh',
    fontSize: gdmnTheme.typography.mediumUI.fontSize,
  });


  const { viewForms } = useSelector((state: RootState) => state.viewForms);
  const { data: erModel } = useGetErModelQuery();
  const { pathname } = useLocation();
  const errorMessage = useSelector<RootState, string>(state => state.error.errorMessage);
  const dispatch = useDispatch();

  const { addSnackbar } = useSnackbar();

  const onClose = useCallback(() => {
    dispatch(clearError());
  }, []);

  useEffect(() => {
    if (!errorMessage) return;

    addSnackbar(errorMessage, { variant: 'error', onClose });
  }, [errorMessage, onClose]);

  return (
    <ThemeProvider theme={gdmnTheme}>
      <Wrapper>
        <Header>
          <TopLine>
            <TopLeftLinks>
              {menuItems.items
                .find(it => it.id === 'system')?.children
                ?.map(item => <Link key={item.id} to={item.url || ''}>{item.title}</Link>
                )}
            </TopLeftLinks>
            <SearchBox />
            <Box
              sx = {{
                display: 'flex',
                direction: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 1
              }}
            >
              <span style={{ color: themeStyles.textColor }}>Чак Норрис</span>
              <Avatar
                sx={{
                  backgroundColor: 'primary.dark',
                  width: 24,
                  height: 24,
                  fontSize: gdmnTheme.typography.smallUI.fontSize,
                  fontWeight: 100
                }}
              >
                ЧН
              </Avatar>
            </Box>
          </TopLine>
          <Menubar>
            <MenubarItem active={1}>Главная</MenubarItem>
            <MenubarItem>Редактирование</MenubarItem>
            <MenubarItem>Справка</MenubarItem>
          </Menubar>
        </Header>
        <Main>
          <Outlet />
        </Main>
        <Footer>
          <FooterTabs>
            {
              viewForms.map(vf =>
                <Link key={vf.pathname} to={vf.pathname}>
                  <FooterTab highlighted={vf.pathname === pathname ? 1 : undefined}>
                    <div>
                      {vf.name}
                    </div>
                  </FooterTab>
                </Link>
              )
            }
          </FooterTabs>
          <FooterBottom>
            {'erModel: ' + (erModel ? erModel.fullDbName : 'not loaded...')}
          </FooterBottom>
        </Footer>
      </Wrapper>
    </ThemeProvider>
  );
};

export default BaseForm;
