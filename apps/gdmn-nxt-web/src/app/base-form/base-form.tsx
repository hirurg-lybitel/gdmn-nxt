import { Avatar, Box, createTheme, IconButton, InputBase, responsiveFontSizes } from '@mui/material';
import { Theme, ThemeOptions } from '@mui/material/styles/createTheme';
import { TypographyStyle, TypographyStyleOptions } from '@mui/material/styles/createTypography';
import { styled, ThemeProvider } from '@mui/styles';
import { Link, Outlet, useLocation } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import './base-form.module.less';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

type MyThemeOptions = ThemeOptions & {
  typography: {
    smallUI: TypographyStyleOptions;
    mediumUI: TypographyStyleOptions;
    selectedUI: TypographyStyleOptions;
  }
};

type MyTheme = Theme & {
  typography: {
    smallUI: TypographyStyle;
    mediumUI: TypographyStyle;
    selectedUI: TypographyStyle;
  }
};

let theme = createTheme({
  typography: {
    body1: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      fontSize: 14
    },
    smallUI: {
      fontSize: 12,
    },
    mediumUI: {
      fontSize: 13,
    },
    selectedUI: {
      fontWeight: 600
    },
    fontSize: 12,
    htmlFontSize: 10
  },
} as MyThemeOptions) as MyTheme;

theme = responsiveFontSizes(theme) as MyTheme;

// console.log(theme);

const Header = styled('header')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '4px 8px 8px 8px',
  backgroundColor: theme.palette.grey['200'],
  borderTopColor: theme.palette.grey['50'],
  borderTopStyle: 'solid',
  borderTopWidth: 1,
  borderBottomColor: theme.palette.grey['400'],
  borderBottomStyle: 'solid',
  borderBottomWidth: 1,
  fontSize: theme.typography.smallUI.fontSize,
  '& a': {
    textDecoration: 'none',
    outline: 'none',
    color: 'inherit'
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
      backgroundColor: theme.palette.grey['50'],
      borderColor: theme.palette.grey['400'],
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
        fontSize: theme.typography.smallUI.fontSize
      }}
      placeholder="Enter search text..."
    />
  </Box>;

const Menubar = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  gap: '16px',
  width: '100%',
  marginTop: 4,
  height: 22,
  fontSize: theme.typography.mediumUI.fontSize
});

const MenubarItem = styled('div')((props: { active?: 1 }) => ({
  fontWeight: props.active ? '500' : 'normal',
  borderBottom: props.active ? `2px solid ${theme.palette.primary.main}` : 'none'
}));

const Toolbar = styled('div')({
  width: '100%',
  marginTop: 4,
  height: 72,
  backgroundColor: theme.palette.grey['100'],
  borderColor: theme.palette.grey['400'],
  borderStyle: 'solid',
  borderWidth: 1,
  borderRadius: 5,
});

const Footer = styled('footer')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: 48,
  padding: 0,
  backgroundColor: theme.palette.grey['200'],
  borderTopColor: theme.palette.grey['400'],
  borderTopStyle: 'solid',
  borderTopWidth: 1,
  borderBottomColor: theme.palette.grey['400'],
  borderBottomStyle: 'solid',
  borderBottomWidth: 1,
  fontSize: theme.typography.smallUI.fontSize,
});

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
  backgroundColor: theme.palette.grey['50'],
  borderTopWidth: highlighted ? 0 : 1,
  borderTopColor: theme.palette.grey['400'],
  borderTopStyle: 'solid',
  borderRightColor: theme.palette.grey['400'],
  borderRightStyle: 'solid',
  borderRightWidth: 1,
  borderBottomColor: highlighted ? theme.palette.primary.main : theme.palette.grey['400'],
  borderBottomStyle: 'solid',
  borderBottomWidth: highlighted ? 3 : 1,
  borderLeftColor: theme.palette.grey['400'],
  borderLeftStyle: 'solid',
  borderLeftWidth: 1,
  fontSize: theme.typography.mediumUI.fontSize,
  fontWeight: highlighted ? theme.typography.selectedUI.fontWeight : 'normal',
  color: highlighted ? theme.palette.primary.main : theme.palette.grey['800'],
}));

const FooterBottom = styled('div')({
  padding: '2px 8px 2px 8px',
});

const Main = styled('main')({
  minHeight: 'calc(100vh - 132px - 48px)',
  maxHeight: 'calc(100vh - 132px - 48px)'
});

const Wrapper = styled('section')({
  display: 'grid',
  gridTemplateRows: '132px 1fr 48px',
  minHeight: '100vh',
});

/* eslint-disable-next-line */
export interface BaseFormProps {};

export function BaseForm(props: BaseFormProps) {
  const { viewForms } = useSelector((state: RootState) => state.viewForms);
  const { pathname } = useLocation();

  return (
    <ThemeProvider theme={theme}>
      <Wrapper>
        <Header>
          <TopLine>
            <TopLeftLinks>
              <Link to="/system/er-model-domains">Domains</Link>
              <Link to="/system/er-model">Entities</Link>
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
              <span>Чак Норрис</span>
              <Avatar
                sx={{
                  backgroundColor: 'primary.dark',
                  width: 24,
                  height: 24,
                  fontSize: theme.typography.smallUI.fontSize,
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
          <Toolbar />
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
            Gdmn-nxt -- next big thing...
          </FooterBottom>
        </Footer>
      </Wrapper>
    </ThemeProvider>
  );
};

export default BaseForm;
