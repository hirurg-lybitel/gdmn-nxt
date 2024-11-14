import React, { useMemo } from 'react';
import { Theme } from '@mui/material/styles';
import { VariableSizeList, VariableSizeGrid, ListChildComponentProps, GridChildComponentProps } from 'react-window';
import { makeStyles } from '@mui/styles';

interface IAutocompleteVirtualizationProps {
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
  },
  gridList: {
    width: '100% !important',
    '& li': {
      display: 'block !important'
    }
  }
}));

const defaultItemHeight = 42;

export function useAutocompleteVirtualization(props?: IAutocompleteVirtualizationProps): React.ComponentType<React.HTMLAttributes<HTMLElement>>[] {
  const classes = useStyles();

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
    const gridRef = useResetCache(itemCount);
    const rowHeights = new Map<number, number>();

    const ListItem = (props: ListChildComponentProps) => {
      const { data, index, style } = props;
      const dataSet = data[index];
      const rowRef = React.useRef<HTMLDivElement | null>(null);

      React.useEffect(() => {
        if (rowRef.current) {
          setRowHeight(index, rowRef.current.clientHeight);
        }
      }, [rowRef]);

      function setRowHeight(index: number, size: number) {
        gridRef.current?.resetAfterIndex(0);
        rowHeights.set(index, size);
      }

      return (
        <li style={style} {...dataSet?.optionProps}>
          <div ref={rowRef}>{dataSet}</div>
        </li>
      );
    };

    function getRowHeight(index: number) {
      if (rowHeights.size === 0) {
        return defaultItemHeight;
      }
      return rowHeights.get(index) ?? defaultItemHeight;
    }

    return (
      <div ref={ref} className={classes.list}>
        <OuterElementContext.Provider value={other}>
          <VariableSizeList
            ref={gridRef}
            itemData={itemData}
            height={380}
            width="100%"
            style={{
              height: 'auto'
            }}
            outerElementType={OuterElementType}
            innerElementType="ul"
            itemSize={getRowHeight}
            overscanCount={5}
            itemCount={itemCount}
          >
            {ListItem}
          </VariableSizeList>
        </OuterElementContext.Provider>
      </div>
    );
  });

  return [ListboxComponent];
}

interface IAutocompleteGridVirtualizationProps {
  width: number,
  columnCount: number,
  rowHeight: number
}

export function useAutocompleteGridVirtualization({ width, columnCount, rowHeight }: IAutocompleteGridVirtualizationProps): React.ComponentType<React.HTMLAttributes<HTMLElement>>[] {
  const classes = useStyles();
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
    const ref = React.useRef<VariableSizeGrid>(null);
    React.useEffect(() => {
      if (ref.current != null) {
        ref.current.resetAfterColumnIndex(0, true);
      }
    }, [data]);
    return ref;
  }

  const ListboxComponent = (listprops: React.HTMLAttributes<HTMLElement>) => {
    const { children, ...other } = listprops;
    const itemData: React.ReactElement[] = [];
    (children as React.ReactElement[]).forEach(
      (item: React.ReactElement & { children?: React.ReactElement[] }) => {
        itemData.push(item);
        itemData.push(...(item.children || []));
      },
    );

    const itemCount = itemData.length;
    const gridRef = useResetCache(itemCount);
    const rowHeights = new Map<number, number>();
    const rowCount = Math.ceil(itemCount / columnCount);
    const itemWidth = (width - 10) / columnCount;

    const ListItem = (props: GridChildComponentProps) => {
      const { data, rowIndex, columnIndex, style } = props;
      const dataSet = data[columnCount * rowIndex + columnIndex];
      const rowRef = React.useRef<HTMLDivElement | null>(null);

      // React.useEffect(() => {
      //   if (rowRef.current) {
      //     setRowHeight(rowIndex, rowRef.current.clientHeight);
      //   }
      // }, [rowRef]);

      function setRowHeight(index: number, size: number) {
        gridRef.current?.resetAfterColumnIndex(0);
        rowHeights.set(index, size);
      }

      return (
        <div style={style} {...dataSet?.optionProps}>
          <div ref={rowRef}>{dataSet}</div>
        </div>
      );
    };

    function getRowHeight(index: number) {
      return rowHeight;
      if (rowHeights.size === 0) {
        return defaultItemHeight;
      }
      return rowHeights.get(index) ?? defaultItemHeight;
    }

    return (
      <div>
        <OuterElementContext.Provider value={other}>
          <VariableSizeGrid
            className={classes.gridList}
            columnCount={columnCount}
            columnWidth={() => itemWidth}
            height={380}
            rowCount={rowCount}
            rowHeight={getRowHeight}
            width={width}
            ref={gridRef}
            itemData={itemData}
            outerElementType={OuterElementType}
            overscanColumnCount={5}
          >
            {ListItem}
          </VariableSizeGrid>
        </OuterElementContext.Provider>
      </div>
    );
  };

  const memoListBox = useMemo(() => ListboxComponent, []);

  return [memoListBox];
}
