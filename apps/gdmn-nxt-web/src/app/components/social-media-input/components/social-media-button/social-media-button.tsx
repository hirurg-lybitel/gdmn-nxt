import { IconButton, IconButtonProps } from '@mui/material';
import { Styled } from './styles';
import { IIconsNames, socialMediaIcons } from '../../social-media-icons';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import { makeStyles } from '@mui/styles';

export interface SocialMediaButtonProps extends IconButtonProps {
  socialName: IIconsNames | undefined
  disableDropdown?: boolean;
  isMenuOpened: boolean;
};

const useStyles = makeStyles(() => ({
  triangle: {
    width: '40px',
    position: 'relative',
    '& .block': {
      right: '2px',
      top: '40%',
      position: 'absolute',
      display: 'inline-block',
      border: '6px solid transparent',
      borderTop: '10px solid rgba(0, 0, 0, 0.54)',
    },
    '& .MuiButtonBase-root': {
      paddingRight: '22px',
      height: '30px',
      borderRadius: '30%',
    }
  }
}));

export function SocialMediaButton(props: SocialMediaButtonProps) {
  const {
    disableDropdown = false,
    isMenuOpened = false,
    socialName = 'viber',
    ...iconButtonProps
  } = props;
  const classes = useStyles();
  if (disableDropdown) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
      <div className={classes.triangle} >
        <div className="block" />
        <IconButton
          {...iconButtonProps}
          className={classes.triangle}
          aria-haspopup="listbox"
          sx={{ aspectRatio: '1 / 1' }}
          aria-controls={isMenuOpened ? 'select-country' : undefined}
          aria-expanded={isMenuOpened ? 'true' : 'false'}
        >
          {socialMediaIcons[`${socialName}`]?.icon
            ? <img style={{ width: '20px' }} src={socialMediaIcons[`${socialName}`]?.icon}/>
            : <PanoramaFishEyeIcon/>}
        </IconButton>
      </div>
      {/* {fixedCode && isoCode ? (
        <Styled.CallingCodeSplitted>
        +{getPhoneCodeOfCountry(isoCode)}
        </Styled.CallingCodeSplitted>
      ) : null} */}
    </>
  );
}

export default SocialMediaButton;
