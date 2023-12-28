import * as icons from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';
interface IconByNameProps extends SvgIconProps {
  name: string
}
export const IconByName = ({ name, ...style }: IconByNameProps) => {
  const allIcons: any = icons;
  const Icon = allIcons[`${name}`];
  if (!Icon) return <></>;
  return <>
    <Icon {...style} />
  </>;
};
