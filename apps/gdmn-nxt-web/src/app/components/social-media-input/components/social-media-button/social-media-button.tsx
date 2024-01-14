import { IconButton, IconButtonProps } from '@mui/material';
import { Styled } from './styles';
import { socialMediaIcons } from '../../social-media-icons';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';

export interface SocialMediaButtonProps extends IconButtonProps {
  socialName: string | null
  disableDropdown?: boolean;
  isFlagsMenuOpened: boolean;
  fixedCode?: boolean;
};

export function SocialMediaButton(props: SocialMediaButtonProps) {
  const {
    disableDropdown = false,
    isFlagsMenuOpened = false,
    fixedCode = false,
    socialName,
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
        {socialMediaIcons[`${socialName}`]?.icon
          ? <img style={{ width: '20px' }} src={socialMediaIcons[`${socialName}`]?.icon}/>
          : <PanoramaFishEyeIcon/>}
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
        {socialMediaIcons[`${socialName}`]?.icon
          ? <img style={{ width: '20px' }} src={socialMediaIcons[`${socialName}`]?.icon}/>
          : <PanoramaFishEyeIcon/>}
      </IconButton>
      {/* {fixedCode && isoCode ? (
        <Styled.CallingCodeSplitted>
        +{getPhoneCodeOfCountry(isoCode)}
        </Styled.CallingCodeSplitted>
      ) : null} */}
    </>
  );
}

export default SocialMediaButton;
