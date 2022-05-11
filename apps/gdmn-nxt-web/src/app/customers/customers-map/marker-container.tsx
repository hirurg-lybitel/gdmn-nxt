import { useMemo, useState } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface IMarkerContainer {
  position: [number, number];
  id: number;
  onMarkerClick?: (id: number) => void;
  selected?: boolean;
  children: JSX.Element;
}

export const MarkerContainer = (props: IMarkerContainer) => {
  const { children } = props;
  const { position, selected, id } = props;
  const { onMarkerClick } = props;

  // const [selected, setSelected] = useState(false);

  const eventHandlers: L.LeafletEventHandlerFnMap = {
    click(e: any) {
      // setSelected(!selected);
      // console.log('click', id, selected);
      // onMarkerClick && onMarkerClick(id);
    },
    remove(e: any) {
      // setSelected(false);
      // if (selected) {
      //   onMarkerClick && onMarkerClick(id);
      // };
    },
    popupclose(e: any) {
      // setSelected(false);
      // console.log('popupclose', id, e);
      // if (selected) {
      //   onMarkerClick && onMarkerClick(id);
      // };
    },
  };

  const defaultIcon = L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${selected ? 'red' : 'blue'}.png`,
    shadowUrl: iconShadow,
    iconSize: [25, 40],
    iconAnchor: [20, 40],
    popupAnchor: [-7, -40]
  });

  return (
    <Marker
      position={position}
      icon={defaultIcon}
      eventHandlers={eventHandlers}
    >
      {children}
    </Marker>
  );
};
