import { createPathComponent } from '@react-leaflet/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';

import 'react-leaflet-markercluster/dist/styles.min.css';
import 'leaflet/dist/leaflet.css';

export const MarkerCluster = createPathComponent(
  ({ children: _c, ...props }, ctx) => {
    const clusterProps: {[key: string]: any} = {};
    const clusterEvents: {[key: string]: any} = {};

    // Splitting props and events to different objects
    Object.entries(props).forEach(([propName, prop]) =>
      propName.startsWith('on')
        ? (clusterEvents[propName] = prop)
        : (clusterProps[propName] = prop)
    );

    // Creating markerClusterGroup Leaflet element
    const markerClusterGroup = L.markerClusterGroup(clusterProps);

    // Initializing event listeners
    Object.entries(clusterEvents).forEach(([eventAsProp, callback]) => {
      const clusterEvent = `cluster${eventAsProp.substring(2).toLowerCase()}`;
      markerClusterGroup.on(clusterEvent, callback);
    });

    return {
      instance: markerClusterGroup,
      context: { ...ctx, layerContainer: markerClusterGroup },
    };
  }
);
