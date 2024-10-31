import * as React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import Typography from '@mui/material/Typography';

export function useAutocompleteVirtualization(itemSize?: number): any[] {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
    noSsr: true,
  });
  const currentItemSize = itemSize ? itemSize : smUp ? 36 : 48;

  function renderRow(props: ListChildComponentProps) {
    const { data, index, style } = props;
    const dataSet = data[index];
    const inlineStyle = {
      ...style,
      top: (style.top as number),
    };

    // if (dataSet.hasOwnProperty('group')) {
    //   return (
    //     <ListSubheader
    //       key={dataSet.key}
    //       component="div"
    //       style={inlineStyle}
    //     >
    //       {dataSet.group}
    //     </ListSubheader>
    //   );
    // }

    return (
      <Typography
        key={dataSet?.key}
        component="li"
        {...dataSet?.optionProps}
        noWrap
        style={inlineStyle}
      >
        {dataSet}
      </Typography>
    );
  }

  const OuterElementContext = React.createContext({});

  // eslint-disable-next-line react/display-name
  const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
    const outerProps = React.useContext(OuterElementContext);
    return (
      <div
        ref={ref}
        {...props}
        {...outerProps}
      />
    );
  });

  function useResetCache(data: any) {
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

    const getChildSize = (child: React.ReactElement) => {
      // if (child.hasOwnProperty('group')) {
      //   return 48;
      // }

      return currentItemSize;
    };

    const listMaxHeight = 250;
    const listHeight = Math.min(currentItemSize * itemData.length, listMaxHeight);

    const gridRef = useResetCache(itemCount);

    return (
      <div ref={ref}>
        <OuterElementContext.Provider value={other}>
          <VariableSizeList
            itemData={itemData}
            height={listHeight}
            width="100%"
            ref={gridRef}
            outerElementType={OuterElementType}
            innerElementType="ul"
            itemSize={(index: number) => getChildSize(itemData[index])}
            overscanCount={5}
            itemCount={itemCount}
          >
            {renderRow}
          </VariableSizeList>
        </OuterElementContext.Provider>
      </div>
    );
  });

  return [ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>];
}
