import { Button, IconButton, ButtonProps } from '@mui/material';
import { IIconsNames, socialMediaIcons } from '../../social-media-icons';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export interface SocialMediaButtonProps extends ButtonProps {
  socialName: IIconsNames | undefined
  disableDropdown?: boolean;
};

export function SocialMediaButton(props: SocialMediaButtonProps) {
  const {
    disableDropdown = false,
    socialName = 'telegram',
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
          {socialMediaIcons[socialName]
            ? <img style={{ width: '20px' }} src={socialMediaIcons[socialName]}/>
            : <PanoramaFishEyeIcon/>}
          <ArrowDropDownIcon />
        </Button>
        <IconButton
          disableRipple
          sx={{ pointerEvents: 'none', aspectRatio: '1 / 1' }}
          component="span"
        >
          {socialMediaIcons[socialName]
            ? <img style={{ width: '20px' }} src={socialMediaIcons[socialName]}/>
            : <PanoramaFishEyeIcon/>}
        </IconButton>
      </>
    );
  }

  return (
    <>
      <Button
        {...buttonProps}
        style={{ borderRadius: '12px', minWidth: 40 }}
        color="inherit"
      >
        {socialMediaIcons[socialName]
          ? <img style={{ width: '20px' }} src={socialMediaIcons[socialName]}/>
          : <PanoramaFishEyeIcon/>}
        <ArrowDropDownIcon />
      </Button>
    </>
  );
}

export default SocialMediaButton;
