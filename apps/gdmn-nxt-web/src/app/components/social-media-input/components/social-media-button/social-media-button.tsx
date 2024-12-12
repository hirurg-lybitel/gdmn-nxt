import { Button, IconButton, ButtonProps } from '@mui/material';
import { socialMedia } from '../../social-media-icons';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { MessengerCode } from '@gsbelarus/util-api-types';

export interface SocialMediaButtonProps extends ButtonProps {
  socialName: MessengerCode | undefined
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
          style={{ borderRadius: 'var(--border-radius)' }}
          color="inherit"
          disabled
        >
          {socialMedia[socialName]
            ? <img style={{ width: '20px' }} src={socialMedia[socialName].icon}/>
            : <PanoramaFishEyeIcon/>}
          <ArrowDropDownIcon />
        </Button>
        <IconButton
          disableRipple
          sx={{ pointerEvents: 'none', aspectRatio: '1 / 1' }}
          component="span"
        >
          {socialMedia[socialName]
            ? <img style={{ width: '20px' }} src={socialMedia[socialName].icon}/>
            : <PanoramaFishEyeIcon/>}
        </IconButton>
      </>
    );
  }

  return (
    <>
      <Button
        {...buttonProps}
        style={{ borderRadius: 'var(--border-radius)', minWidth: 40 }}
        color="inherit"
      >
        {socialMedia[socialName]
          ? <img style={{ width: '20px' }} src={socialMedia[socialName].icon}/>
          : <PanoramaFishEyeIcon/>}
        <ArrowDropDownIcon />
      </Button>
    </>
  );
}

export default SocialMediaButton;
