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
    padding: '8px',
    boxShadow: '0px 4px 5px -2px rgb(0 0 0 / 20%), 0px 7px 10px 1px rgb(0 0 0 / 14%), 0px 2px 16px 1px rgb(0 0 0 / 12%)',
    color: theme.palette.text.primary
  },
}));
