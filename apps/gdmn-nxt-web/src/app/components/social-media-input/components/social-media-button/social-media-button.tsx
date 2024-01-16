import { Button, IconButton, ButtonProps } from '@mui/material';
import { Styled } from './styles';
import { IIconsNames, socialMediaIcons } from '../../social-media-icons';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import { makeStyles } from '@mui/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export interface SocialMediaButtonProps extends ButtonProps {
  socialName: IIconsNames | undefined
  disableDropdown?: boolean;
  isMenuOpened: boolean;
};

export function SocialMediaButton(props: SocialMediaButtonProps) {
  const {
    disableDropdown = false,
    isMenuOpened = false,
    socialName = 'viber',
    ...buttonProps
  } = props;

  if (disableDropdown) {
    return (
      <>
        <Button
          {...buttonProps}
          style={{ borderRadius: '12px' }}
          color="inherit"
          disabled
        >
          {socialMediaIcons[`${socialName}`]?.icon
            ? <img style={{ width: '20px' }} src={socialMediaIcons[`${socialName}`]?.icon}/>
            : <PanoramaFishEyeIcon/>}
          <ArrowDropDownIcon />
        </Button>
        <IconButton
          disableRipple
          sx={{ pointerEvents: 'none', aspectRatio: '1 / 1' }}
          component="span"
        >
          {socialMediaIcons[`${socialName}`]?.icon
            ? <img style={{ width: '20px' }} src={socialMediaIcons[`${socialName}`]?.icon}/>
            : <PanoramaFishEyeIcon/>}
        </IconButton>
      </>
    );
  }

  return (
    <>
      <Button
        {...buttonProps}
        style={{ borderRadius: '12px' }}
        color="inherit"
      >
        {socialMediaIcons[`${socialName}`]?.icon
          ? <img style={{ width: '20px' }} src={socialMediaIcons[`${socialName}`]?.icon}/>
          : <PanoramaFishEyeIcon/>}
        <ArrowDropDownIcon />
      </Button>
    </>
  );
}

export default SocialMediaButton;
