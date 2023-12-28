import { MenuItem, MenuItemProps, Typography } from '@mui/material';
import { FlagSize } from '../../types';
import { COUNTRIES, TelInputCountry } from '../../constants/countries';
import Flag from '../flag/flag';
import { Styled } from './styled';

export interface FlagMenuItemProps extends MenuItemProps {
  isoCode: TelInputCountry;
  onSelectCountry: (isoCode: TelInputCountry) => void;
  countryName: string | undefined;
  flagSize?: FlagSize;
}

export function FlagMenuItem(props: FlagMenuItemProps) {
  const {
    isoCode,
    onSelectCountry,
    countryName,
    flagSize = 'small',
    ...menuItemProps
  } = props;

  const handleClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    event.preventDefault();
    onSelectCountry(isoCode);
  };

  return (
    <MenuItem
      {...menuItemProps}
      onClick={handleClick}
      role="option"
      data-testid={`option-${isoCode}`}
      className="TelInput-MenuItem"
    >
      <Styled.ListItemIcon className="TelInput-ListItemIcon-flag">
        <Flag
          size={flagSize}
          isoCode={isoCode}
          countryName={countryName}
        />
      </Styled.ListItemIcon>
      <Styled.ListItemText className="TelInput-ListItemText-country">
        {countryName}
      </Styled.ListItemText>
      <Typography
        variant="body2"
        color="text.secondary"
        className="TelInput-Typography-calling-code"
      >
        +{COUNTRIES[isoCode]?.[0]}
      </Typography>
    </MenuItem>
  );
}

export default FlagMenuItem;
