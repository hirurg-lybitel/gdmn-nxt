import { Box, Menu, MenuProps } from '@mui/material';
import styles from './social-media-menu.module.less';
import SocialMediaMenuItem from '../social-media-item/social-media-menu-item';
import { IIconsNames, socialMediaIcons } from '../../social-media-icons';

export interface SocialMediaMenuProps extends Partial<MenuProps> {
  socialName: IIconsNames | undefined;
  onChangeSocial: (value: string) => void;
}

export function SocialMediaMenu(props: SocialMediaMenuProps) {
  const {
    className,
    anchorEl,
    socialName,
    onChangeSocial,
    ...rest
  } = props;

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      {...rest}
    >
      <Box className={styles.menuContent}>
        {Object.keys(socialMediaIcons).map((socialNameItem, index) =>
          <SocialMediaMenuItem
            onSelectSocial={onChangeSocial}
            key={index}
            socialName={socialNameItem as IIconsNames}
            selected={socialNameItem === socialName}
          />
        )}
      </Box>
    </Menu>
  );
}

export default SocialMediaMenu;
