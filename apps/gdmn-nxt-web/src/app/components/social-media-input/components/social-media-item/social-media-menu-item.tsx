import { MenuItem, MenuItemProps, Typography } from '@mui/material';
import { Styled } from './styled';
import { IIconsNames, socialMediaIcons } from '../../social-media-icons';

export interface SocialMediaMenuItemProps extends MenuItemProps {
  socialName: IIconsNames | undefined;
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
    onSelectSocial(socialName as IIconsNames);
  };

  return (
    <MenuItem
      {...menuItemProps}
      onClick={handleClick}
      role="option"
      data-testid={`option-${socialName}`}
    >
      <Styled.ListItemIcon>
        <img style={{ width: '30px' }} src={socialMediaIcons[`${socialName}`]?.icon}/>
      </Styled.ListItemIcon>
      <Styled.ListItemText>
        {socialMediaIcons[`${socialName}`]?.name}
      </Styled.ListItemText>
    </MenuItem>
  );
}

export default SocialMediaMenuItem;
