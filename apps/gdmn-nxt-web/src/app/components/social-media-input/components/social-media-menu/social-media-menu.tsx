import { Box, Menu, MenuProps } from '@mui/material';
import { useMemo } from 'react';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import styles from './social-media-menu.module.less';
import SocialMediaMenuItem from '../social-media-item/social-media-menu-item';
import { socialMediaIcons } from '../../social-media-icons';

export interface SocialMediaMenuProps extends Partial<MenuProps> {
  socialName: string | null;
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
      id="select-country"
      className={`TelInput-Menu ${className ?? ''}`}
      MenuListProps={{
        role: 'listbox',
        'aria-activedescendant': socialName ? `country-${socialName}` : '',
        'aria-labelledby': 'select-country'
      }}
      {...rest}
    >
      <Box className={styles.menuContent}>
        <CustomizedScrollBox>
          {Object.keys(socialMediaIcons).map((socialNameItem, index) =>
            <SocialMediaMenuItem
              onSelectSocial={onChangeSocial}
              key={index}
              socialName={socialNameItem}
              selected={socialMediaIcons[socialNameItem].name === socialName}
              id={`country-${socialNameItem}`}
            />
          )}
        </CustomizedScrollBox>
      </Box>
    </Menu>
  );
}

export default SocialMediaMenu;
