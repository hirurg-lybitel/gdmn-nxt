import { Tooltip, TooltipProps, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ErrorTooltip = styled(({ className, title, ...props }: TooltipProps) => (
  <Tooltip
    open={!!title}
    title={title}
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
    color: 'var(--color-error)',
  },
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: '0.75rem',
    backgroundColor: 'var(--color-error)',
  }
}));
