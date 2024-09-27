import { DataGridPro, DataGridProProps, GridRenderCellParams, ruRU } from '@mui/x-data-grid-pro';
import styles from './styled-grid.module.less';
import CustomNoRowsOverlay from './DataGridProOverlay/CustomNoRowsOverlay';
import CustomLinearLoadingOverlay from './DataGridProOverlay/CustomLinearLoadingOverlay';
import { memo, useEffect, useRef, useState } from 'react';
import { Box, Popper, Typography } from '@mui/material';
import CustomizedCard from '../customized-card/customized-card';
import { useTheme } from '@mui/material/styles';
import CustomCircularLoadingOverlay from './DataGridProOverlay/CustomCircularLoadingOverlay';

const defaultRowHeight = 40;
const stylelessRowHeight = 31;

interface IStyledGridProps extends DataGridProProps{
  hideColumnHeaders?: boolean;
  hideHeaderSeparator?: boolean;
  loadingMode?: 'circular' | 'linear';
  autoHeightForFields?: string[];
}

/** Disable license expired message error */
const disableLicenseError = () => {
  const searchText = ['MUI X: Missing license key', 'MUI X: License key expired', 'MUI X Expired package version']
    .map(s => s.toLowerCase());
  const root = document.querySelectorAll('.MuiDataGrid-main');

  root.forEach((grid) => {
    const children = Array.from(grid.childNodes);

    for (const element of children) {
      if (!element.textContent) {
        return;
      }
      if (searchText.includes(element.textContent?.toLowerCase())) {
        if (element.nodeName.toLowerCase() !== 'div') {
          return;
        }
        const div = element as HTMLDivElement;
        div.style.display = 'none';
      }
    }
  });
};


export default function StyledGrid(props: IStyledGridProps) {
  const theme = useTheme();
  const defaultTheme = ({ hideHeaderSeparator, rowHeight = defaultRowHeight }: IStyledGridProps) => ({
    border: 'none',
    padding: '0px',
    flex: 1,
    '& .MuiDataGrid-cell': {
      padding: '12px 24px'
    },
    '& .MuiDataGrid-columnHeader:focus-within': {
      outline: 'none !important',
    },
    '& .MuiDataGrid-cell:focus-within': {
      outline: 'none !important',
    },
    '& .MuiDataGrid-columnHeader': {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
    '& > .MuiDataGrid-columnSeparator': {
      visibility: 'hidden',
    },
    '& .MuiDataGrid-iconSeparator': {
      ...(hideHeaderSeparator && { display: 'none' })
    },
    '& .MuiDataGrid-pinnedColumnHeaders': {
      background: theme.palette.background.paper
    },
    '& .MuiDataGrid-pinnedColumns': {
      background: theme.palette.background.paper
    },
    '& .MuiDataGrid-footerContainer': {
      height: '60px'
    },
    '.MuiDataGrid-detailPanel': {
      backgroundColor: 'inherit',
      padding: '24px',
    },
    ...(hideColumnHeaders && {
      '& .MuiDataGrid-columnHeaders': {
        display: 'none'
      },
    }),
    '& .cell-with-auto-height': {
      '& .MuiDataGrid-cell': {
        padding: `calc((${rowHeight}px - ${stylelessRowHeight}px) / 2) 24px`
      },
    },
    '& .MuiDataGrid-detailPanel': {
      padding: 0
    }
  });

  const {
    loadingMode = 'linear',
    hideColumnHeaders,
    autoHeightForFields
  } = props;

  useEffect(() => {
    disableLicenseError();
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
        <DataGridPro
          localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
          // onStateChange={() => disableLicenseError()}
          getRowId={row => row.ID}
          slots={{
            loadingOverlay: loadingMode === 'linear' ? CustomLinearLoadingOverlay : CustomCircularLoadingOverlay,
            noRowsOverlay: CustomNoRowsOverlay,
            noResultsOverlay: CustomNoRowsOverlay,
          }}
          columnHeaderHeight={hideColumnHeaders ? 0 : 50}
          getRowClassName={(params) => autoHeightForFields?.some((field) => !!params.row[field]) ? 'cell-with-auto-height' : ''}
          getRowHeight={({ model }) => {
            const isAutoHeight = autoHeightForFields?.some((field) => !!model[field]);
            if (isAutoHeight) {
              return 'auto';
            }
            return props.rowHeight ?? defaultRowHeight;
          }}
          {...props}
          sx={{
            ...defaultTheme(props),
            ...props.sx
          }}
        />
      </div>
    </div>
  );
};

function isOverflown(element: HTMLDivElement | null) {
  if (!element) return false;
  return (
    element?.scrollHeight > element?.clientHeight ||
    element?.scrollWidth > element?.clientWidth
  );
}

interface GridCellExpandProps {
  width: number;
  value: string;
};


export const GridCellExpand = memo(function GridCellExpand(props: GridCellExpandProps) {
  const { width, value } = props;
  const wrapper = useRef(null);
  const cellDiv = useRef<HTMLDivElement>(null);
  const cellValue = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [showFullCell, setShowFullCell] = useState(false);
  const [showPopper, setShowPopper] = useState(false);

  const handleMouseEnter = () => {
    const isCurrentlyOverflown = isOverflown(cellValue.current);
    setShowPopper(isCurrentlyOverflown);
    setAnchorEl(cellDiv.current);
    setShowFullCell(true);
  };

  const handleMouseLeave = () => {
    setShowFullCell(false);
  };

  useEffect(() => {
    if (!showFullCell) {
      return undefined;
    }

    function handleKeyDown(nativeEvent: any) {
      if (nativeEvent.key === 'Escape' || nativeEvent.key === 'Esc') {
        setShowFullCell(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setShowFullCell, showFullCell]);

  return (
    <Box
      ref={wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        alignItems: 'center',
        lineHeight: '24px',
        width: 1,
        height: 1,
        position: 'relative',
        display: 'flex',
      }}
    >
      <Box
        ref={cellDiv}
        sx={{
          height: 1,
          width,
          display: 'block',
          position: 'absolute',
          top: 0,
        }}
      />
      <Box
        ref={cellValue}
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {value}
      </Box>
      {showPopper && (
        <Popper
          open={showFullCell && anchorEl !== null}
          anchorEl={anchorEl}
          style={{
            width,
            // marginLeft: -17
          }}
        >
          <CustomizedCard
            style={{
              minHeight: wrapper?.current ? (wrapper.current as any).offsetHeight : 0 - 3
            }}
            borders
            boxShadows
          >
            <Typography variant="body2" style={{ padding: 8 }}>
              {value}
            </Typography>
          </CustomizedCard>
        </Popper>
      )}
    </Box>
  );
});

export function renderCellExpand(params: GridRenderCellParams, value = '') {
  return (
    <GridCellExpand value={value} width={params.colDef.computedWidth} />
  );
};
