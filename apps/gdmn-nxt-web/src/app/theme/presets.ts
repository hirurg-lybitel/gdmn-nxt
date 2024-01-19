import { ColorMode } from '@gsbelarus/util-api-types';
import { colors } from '@mui/material';

interface Style {
  fontFamily?: string;
  buttonTextColor?: string;
  backgroundColor: string;
  paperColor?: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  captionTextColor: string;
  borderColor: string;
  menuBackgroundColor: string;
  menuTextColor: string;
  buttonPrimaryColor: string;
}

const defaultStyle: Partial<Style> = {
  fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"'].join(','),
  buttonTextColor: colors.common.white,
  paperColor: colors.common.white,
};

export const themes: {[key in ColorMode]: { [key: string]: Style}} = {
  [ColorMode.Light]: {
    'blue': {
      ...defaultStyle,
      backgroundColor: colors.grey[100],
      textColor: colors.grey[800],
      captionTextColor: colors.grey[600],
      primaryColor: colors.blue[300],
      secondaryColor: colors.common.white,
      menuBackgroundColor: colors.blue[300],
      menuTextColor: colors.common.white,
      borderColor: '#f0f0f0',
      buttonPrimaryColor: colors.blue[300],
    },
    'grey': {
      ...defaultStyle,
      backgroundColor: colors.grey[100],
      primaryColor: 'rgb(78, 125, 149)',
      secondaryColor: colors.common.white,
      textColor: 'rgba(40, 62, 79, 0.9)',
      captionTextColor: 'rgba(40, 62, 79, 0.7)',
      borderColor: 'rgb(240, 240, 240)',
      menuBackgroundColor: 'rgb(78, 125, 149)',
      menuTextColor: colors.common.white,
      buttonPrimaryColor: 'rgb(254, 131, 75)',
    }

  },
  [ColorMode.Dark]: {
    'black': {
      ...defaultStyle,
      backgroundColor: colors.grey[900],
      menuBackgroundColor: colors.blueGrey[900],
      primaryColor: colors.blue[400],
      textColor: colors.common.white,
      captionTextColor: colors.grey[500],
      secondaryColor: colors.grey[300],
      menuTextColor: colors.grey[300],
      paperColor: colors.grey[800],
      borderColor: '#303030',
      buttonPrimaryColor: colors.blue[500],

    },
  }
};
