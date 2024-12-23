import { Tooltip, TooltipProps, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ErrorTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip
    arrow
    placement="bottom-start"
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -7],
            },
          },
        ],
      },
    }}
    {...props}
    classes={{ popper: className }}
  />
))(() => ({
  [`& .${tooltipClasses.arrow}`]: {
    transform: 'none !important',
    left: '10px !important',
    color: 'rgb(143, 64, 64)',
  },
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: '0.75rem',
    backgroundColor: 'rgb(143, 64, 64)',
  }
}));
