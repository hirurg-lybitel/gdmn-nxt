import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

export const OptionsTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip
    {...props}
    arrow
    leaveTouchDelay={20000}
    classes={{ popper: className }}
  />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}::before`]: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.mainContent.borderColor}`
  },
  [`& .${tooltipClasses.tooltip}`]: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.mainContent.borderColor}`,
    padding: '8px'
  },
}));
