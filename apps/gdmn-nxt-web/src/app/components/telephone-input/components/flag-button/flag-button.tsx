import { IconButton, IconButtonProps } from '@mui/material';
import { TelInputCountry } from '../../constants/countries';
import { FlagSize } from '../../types';
import Flag from '../flag/flag';
import { getPhoneCodeOfCountry } from '../../helpers/countries';
import { Styled } from './styles';

export interface FlagButtonProps extends IconButtonProps {
  isoCode: TelInputCountry | null
  disableDropdown?: boolean;
  flagSize?: FlagSize;
  isFlagsMenuOpened: boolean;
  fixedCode?: boolean;
};

export function FlagButton(props: FlagButtonProps) {
  const {
    disableDropdown = false,
    isFlagsMenuOpened = false,
    fixedCode = false,
    flagSize = 'small',
    isoCode,
    ...iconButtonProps
  } = props;

  if (disableDropdown) {
    return (
      <IconButton
        className="TelInput-IconButton"
        disableRipple
        sx={{ pointerEvents: 'none', aspectRatio: '1 / 1' }}
        component="span"
      >
        <Flag size={flagSize} isoCode={isoCode} />
      </IconButton>
    );
  }

  return (
    <>
      <IconButton
        {...iconButtonProps}
        className="TelInput-IconButton"
        aria-haspopup="listbox"
        sx={{ aspectRatio: '1 / 1' }}
        aria-controls={isFlagsMenuOpened ? 'select-country' : undefined}
        aria-expanded={isFlagsMenuOpened ? 'true' : 'false'}
      >
        <Flag size={flagSize} isoCode={isoCode} />
      </IconButton>
      {fixedCode && isoCode ? (
        <Styled.CallingCodeSplitted>
        +{getPhoneCodeOfCountry(isoCode)}
        </Styled.CallingCodeSplitted>
      ) : null}
    </>
  );
}

export default FlagButton;
