import { ILabel } from '@gsbelarus/util-api-types';
import styles from './label-marker.module.less';
import { IconByName } from '@gdmn-nxt/components/icon-by-name';
import { useTheme } from '@mui/material';
/* eslint-disable-next-line */
export interface LabelMarkerProps {
  label: ILabel;
  icon?: string;
  nowrap?: boolean
}

function hexToRGB(h: any) {
  let r = 0, g = 0, b = 0;

  // 3 digits
  if (h?.length === 4) {
    r = h[1] + h[1];
    g = h[2] + h[2];
    b = h[3] + h[3];

  // 6 digits
  } else if (h?.length === 7) {
    r = parseInt(h[1] + h[2], 16);
    g = parseInt(h[3] + h[4], 16);
    b = parseInt(h[5] + h[6], 16);
  }

  return { r, g, b };
}

function RGBToHSL(r: number, g: number, b: number) {
  // Make r, g, and b fractions of 1
  r /= 255;
  g /= 255;
  b /= 255;

  // Find greatest and smallest channel values
  const cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin;
  let h = 0,
    s = 0,
    l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
}

const getColors = (color: string | undefined, theme: 'dark' | 'light') => {
  const rgb = hexToRGB(color);
  const hsl = RGBToHSL(rgb.r, rgb.g, rgb.b);
  const labelH = hsl.h;
  const labelS = hsl.s;
  const labelL = hsl.l;
  const textL = (labelL >= 85) ? labelL : 85;
  const textS = labelS === 0 ? labelS : 100;
  if (theme === 'dark') {
    return {
      background: `hsla(${labelH}, ${labelS}%, ${labelL + 20}%, ${0.2})`,
      text: `hsl(${labelH}, ${textS}%, ${textL}%)`,
      border: `hsl(${labelH}, ${labelS}%, ${labelL - 5}%)`
    };
  }
  const background = `hsl(${labelH}, ${labelS}%, ${labelL}%)`;
  return {
    background: background,
    text: (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) < 165 ? 'white' : 'black',
    border: labelL >= 95 ? 'rgba(0, 0, 0, 0.2)' : background
  };
};

export function LabelMarker(props: LabelMarkerProps) {
  const { USR$COLOR: color, USR$NAME: name, USR$ICON } = props.label;
  const { icon, nowrap } = props;
  const theme = useTheme();

  const colors = getColors(color, theme.palette.mode);

  const noWrapStyles: any = nowrap ? {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textWrap: 'nowrap'
  } : {};

  if (!name) return <></>;
  return (
    <div
      className={styles.label}
      style={{
        backgroundColor: colors.background,
        border: `1px solid ${colors.border}`, maxWidth: '100%', wordWrap: 'break-word',
        display: 'flex',
        alignItems: 'center',
        padding: '0px 5px',
        minHeight: '20px',
        fontSize: '0.8125rem',
        fontWeight: 600,
        textTransform: 'none',
        color: colors.text
      }}
    >
      {(icon || USR$ICON) &&
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <IconByName name={icon ?? USR$ICON} style={{ width: 14, height: 14 }} />
        </div>
      }
      <span style={{ margin: '0 5px', marginTop: '-1px', textTransform: 'capitalize', ...noWrapStyles }}>
        {name || 'Пример'}
      </span>
    </div>
  );
}

export default LabelMarker;
