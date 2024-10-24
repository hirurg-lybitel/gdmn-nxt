import { ReactElement, isValidElement, useRef } from 'react';
import { List, ListRowProps } from 'react-virtualized';
import React from 'react';
import { Padding } from '@mui/icons-material';

export function useAutocompleteVirtualization(itemSize = 42): any[] {
  const autocompleteRef = useRef<any>(null);

  type ListboxComponentProps = React.HTMLAttributes<HTMLElement> & {
    children: React.ReactNode;
    role: string;
  };

  // eslint-disable-next-line react/display-name
  const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  ListboxComponentProps
>((props, ref) => {
  const { children, role, ...other } = props;
  const items = React.Children.toArray(children) as ReactElement[];

  const listMaxHeight = 250;
  const listHeight = Math.min(itemSize * items.length, listMaxHeight);

  return (
    <div ref={ref}>
      <div {...other}>
        <List
          height={listHeight}
          width={autocompleteRef?.current?.offsetWidth}
          rowHeight={itemSize}
          overscanCount={5}
          rowCount={items.length}
          rowRenderer={(listRowProps: ListRowProps) => {
            if (isValidElement(items[listRowProps.index])) {
              return React.cloneElement(items[listRowProps.index], {
                style: listRowProps.style,
              });
            }
            return null;
          }}
          role={role}
        />
      </div>
    </div>
  );
});

  return [autocompleteRef, ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>];
}
