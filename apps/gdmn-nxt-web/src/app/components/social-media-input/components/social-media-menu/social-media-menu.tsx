import { Box, Menu, MenuProps } from '@mui/material';
import { useMemo } from 'react';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
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
        <CustomizedScrollBox>
          {Object.keys(socialMediaIcons).map((socialNameItem, index) =>
            <SocialMediaMenuItem
              onSelectSocial={onChangeSocial}
              key={index}
              socialName={socialMediaIcons[socialNameItem].name}
              selected={socialMediaIcons[socialNameItem].name === socialName}
            />
          )}
        </CustomizedScrollBox>
      </Box>
    </Menu>
  );
}

export default SocialMediaMenu;
