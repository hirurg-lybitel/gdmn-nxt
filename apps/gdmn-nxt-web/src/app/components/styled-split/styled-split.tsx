import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { styled } from '@mui/styles';

export interface StyledSplitProps {
  /**
   * Size of the dragging area between panes in pixels
   * @default 8
   */
  separatorSize?: number;
  /**
   * Color of the dragging area
   * @default 'none'
   */
  separatorColor?: string;
  /**
   * Color of the dragging area in focus
   * @default '#007fd4'
   */
  separatorFocusColor?: string
}

export const StyledSplit = styled(Allotment)((props: StyledSplitProps) => ({
  ...(props.separatorSize && {
    '--sash-size': `${props.separatorSize}px`,
    '--sash-hover-size': `${props.separatorSize}px`
  }),
  ...(props.separatorColor && { '--separator-border': props.separatorColor }),
  ...(props.separatorFocusColor && { '--focus-border': props.separatorFocusColor }),
}));

export const StyledSplitPane = Allotment.Pane;
