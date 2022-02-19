import { Avatar, Box, createTheme, IconButton, InputBase, Paper, responsiveFontSizes, TextField } from '@mui/material';
import { Theme, ThemeOptions } from '@mui/material/styles/createTheme';
import { TypographyStyle, TypographyStyleOptions } from '@mui/material/styles/createTypography';
import { styled, ThemeProvider } from '@mui/styles';
import { Outlet } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import './base-form.module.less';

type MyThemeOptions = ThemeOptions & {
  typography: {
    footer: TypographyStyleOptions;
  }
};

type MyTheme = Theme & {
  typography: {
    footer: TypographyStyle;
  }
};

let theme = createTheme({
  typography: {
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
    footer: {
      fontSize: 12
    },
    fontSize: 12,
    htmlFontSize: 10    
  },
} as MyThemeOptions) as MyTheme;
theme = responsiveFontSizes(theme) as MyTheme;

const Header = styled('header')({
  backgroundColor: theme.palette.grey['200'],
  borderTopColor: theme.palette.grey['50'], 
  borderTopStyle: 'solid', 
  borderTopWidth: 1,
  borderBottomColor: theme.palette.grey['400'], 
  borderBottomStyle: 'solid', 
  borderBottomWidth: 1,
  fontSize: theme.typography.footer.fontSize,
  padding: '4px 8px 8px 8px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
});

const TopLine = styled('div')({
  width: '100%',
  height: 30,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const SearchBox = () => 
  <Box
    sx={{ 
      backgroundColor: theme.palette.grey['50'],
      p: '2px 2px', 
      display: 'flex', 
      alignItems: 'center', 
      width: 400,
      borderColor: theme.palette.grey['400'], 
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 1,
      height: 24
    }}
    >
    <IconButton size='small' aria-label="search">
      <SearchIcon sx={{ width: 16, height: 16 }} />
    </IconButton>
    <InputBase
      sx={{ 
        ml: 1, 
        flex: 1,
        fontSize: theme.typography.footer.fontSize 
      }}
      placeholder="Enter search text..."
      inputProps={{ 'aria-label': 'search google maps' }}
    />
  </Box>

const Toolbar = styled('div')({
  backgroundColor: theme.palette.grey['100'],
  borderColor: theme.palette.grey['400'], 
  borderStyle: 'solid', 
  borderWidth: 1,
  borderRadius: 5,
  marginTop: 4,
  width: '100%',
  height: 64
});

const Footer = styled('footer')({
  backgroundColor: theme.palette.grey['200'],
  borderTopColor: theme.palette.grey['50'], 
  borderTopStyle: 'solid', 
  borderTopWidth: 1,
  borderBottomColor: theme.palette.grey['400'], 
  borderBottomStyle: 'solid', 
  borderBottomWidth: 1,
  fontSize: theme.typography.footer.fontSize,
  padding: '4px 8px 4px 8px'
});

const Main = styled('main')({
  minHeight: 'calc(100% - 100px - 24px)'
});

const Wrapper = styled('section')({
  minHeight: '100vh',
  display: 'grid',
  gridTemplateRows: '100px 1fr 24px'
});

/* eslint-disable-next-line */
export interface BaseFormProps {};

export function BaseForm(props: BaseFormProps) {
  return (
    <ThemeProvider theme={theme}>
      <Wrapper>
        <Header>
          <TopLine>
            <div>
              top1
            </div>
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
              <Avatar sx={{ 
                backgroundColor: 'green', 
                width: 22, 
                height: 22,
                fontSize: theme.typography.footer.fontSize,
                fontWeight: 100 
              }}>
                ЧН
              </Avatar>
            </Box>
          </TopLine>
          <Toolbar>
            
          </Toolbar>
        </Header>
        <Main>
          <Outlet />
        </Main>
        <Footer>
          footer
        </Footer>
      </Wrapper>
    </ThemeProvider>
  );
};

export default BaseForm;
