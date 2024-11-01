import * as React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, Theme } from '@mui/material/styles';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';

interface IAutocompleteVirtualizationProps {
  itemHeight?: number
}

const useStyles = makeStyles((theme: Theme) => ({
  list: {
    '& .MuiAutocomplete-listbox': {
      padding: 0
    },
    '& ul': {
      margin: 0
    }
  },
  item: {
    overflow: 'hidden',
    '& .MuiListItem-root': {
      height: '100%'
    }
  }
}));

export function useAutocompleteVirtualization({ itemHeight }: IAutocompleteVirtualizationProps): React.ComponentType<React.HTMLAttributes<HTMLElement>>[] {
  const theme = useTheme();
  const classes = useStyles();

  const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
    noSsr: true,
  });
  const currentitemHeight = itemHeight ?? (smUp ? 36 : 48);

  function renderRow(props: ListChildComponentProps) {
    const { data, index, style } = props;
    const dataSet = data[index];
    const inlineStyle = {
      ...style,
      top: (style.top as number),
      height: currentitemHeight + 'px',
    };

    return (
      <Typography
        key={dataSet?.key}
        component="li"
        {...dataSet?.optionProps}
        style={inlineStyle}
        className={classes.item}
      >
        {dataSet}
      </Typography>
    );
  }

  const OuterElementContext = React.createContext({});
  const OuterElementTypeComponent = (props: {}, ref: React.ForwardedRef<HTMLDivElement>) => {
    const outerProps = React.useContext(OuterElementContext);
    return (
      <div
        ref={ref}
        {...props}
        {...outerProps}
      />
    );
  };
  const OuterElementType = React.forwardRef<HTMLDivElement>(OuterElementTypeComponent);

  function useResetCache(data: number) {
    const ref = React.useRef<VariableSizeList>(null);
    React.useEffect(() => {
      if (ref.current != null) {
        ref.current.resetAfterIndex(0, true);
      }
    }, [data]);
    return ref;
  }

  const ListboxComponent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData: React.ReactElement[] = [];
    (children as React.ReactElement[]).forEach(
      (item: React.ReactElement & { children?: React.ReactElement[] }) => {
        itemData.push(item);
        itemData.push(...(item.children || []));
      },
    );

    const itemCount = itemData.length;

    const listMaxHeight = 1000;

    const listHeight = Math.min(currentitemHeight * (itemData.length), listMaxHeight);

    const gridRef = useResetCache(itemCount);

    return (
      <div ref={ref} className={classes.list} >
        <OuterElementContext.Provider value={other}>
          <VariableSizeList
            itemData={itemData}
            height={listHeight}
            width="100%"
            ref={gridRef}
            outerElementType={OuterElementType}
            innerElementType="ul"
            itemSize={(index: number) => currentitemHeight}
            overscanCount={5}
            itemCount={itemCount}
          >
            {renderRow}
          </VariableSizeList>
        </OuterElementContext.Provider>
      </div>
    );
  });

  return [ListboxComponent];
}
