import { createTheme, Grid, responsiveFontSizes } from '@mui/material';
import { Theme, ThemeOptions } from '@mui/material/styles/createTheme';
import { TypographyStyle, TypographyStyleOptions } from '@mui/material/styles/createTypography';
import { styled, ThemeProvider } from '@mui/styles';
import { Outlet } from 'react-router-dom';
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
    fontSize: 12    
  }
} as MyThemeOptions) as MyTheme;
theme = responsiveFontSizes(theme) as MyTheme;

const Header = styled('header')({
  flexBasis: '0 0 128px'
});

const Footer = styled('footer')({
  flexBasis: '0 0 24px',
  backgroundColor: theme.palette.grey['200'],
  borderTopColor: theme.palette.grey['50'], 
  borderBottomColor: theme.palette.grey['800'], 
  fontSize: theme.typography.footer.fontSize,
  padding: '4px 8px 4px 8px'
});

const Main = styled('main')({
  minHeight: 'calc(100% - 152px)'
});

const Wrapper = styled('section')({
  minHeight: '100vh',
  display: 'grid',
  gridTemplateRows: 'auto 1fr auto'
});

/* eslint-disable-next-line */
export interface BaseFormProps {};

export function BaseForm(props: BaseFormProps) {
  return (
    <ThemeProvider theme={theme}>
      <Wrapper>
        <Header>
          top
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
