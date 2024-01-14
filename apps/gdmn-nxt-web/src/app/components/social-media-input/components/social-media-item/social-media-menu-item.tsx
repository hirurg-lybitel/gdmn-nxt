import { MenuItem, MenuItemProps, Typography } from '@mui/material';
import { Styled } from './styled';
import { socialMediaIcons } from '../../social-media-icons';

export interface SocialMediaMenuItemProps extends MenuItemProps {
  socialName: string;
  onSelectSocial: (isoCode: string) => void;
}

export function SocialMediaMenuItem(props: SocialMediaMenuItemProps) {
  const {
    socialName,
    onSelectSocial,
    ...menuItemProps
  } = props;

  const handleClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    event.preventDefault();
    onSelectSocial(socialName);
  };

  return (
    <MenuItem
      {...menuItemProps}
      onClick={handleClick}
      role="option"
      data-testid={`option-${socialName}`}
      className="TelInput-MenuItem"
    >
      <Styled.ListItemIcon className="TelInput-ListItemIcon-flag">
        <img style={{ width: '30px' }} src={socialMediaIcons[`${socialName}`]?.icon}/>
      </Styled.ListItemIcon>
      <Styled.ListItemText className="TelInput-ListItemText-country">
        {socialMediaIcons[`${socialName}`]?.name}
      </Styled.ListItemText>
      <Typography
        variant="body2"
        color="text.secondary"
        className="TelInput-Typography-calling-code"
      >
        {socialMediaIcons[`${socialName}`]?.mask}
      </Typography>
    </MenuItem>
  );
}

export default SocialMediaMenuItem;
