import styles from './customers-map.module.less';
import { Stack, Typography } from '@mui/material';
import { MapContainer, TileLayer, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MarkerCluster } from './marker-cluster';
import { useState } from 'react';
import { MarkerContainer } from './marker-container';

import 'leaflet/dist/leaflet.css';

import { customers } from './exampleCustomers';

const defaultCenter = { lat: 53.902891, lng: 27.561102 };

/* eslint-disable-next-line */
export interface CustomersMapProps {}

export function CustomersMap(props: CustomersMapProps) {
  const [selectedId, setSelectedId] = useState(-1);

  const handleMarkerClick = (id: number) => {
    setSelectedId(selectedId === id ? -1 : id);
  };

  return (
    <div className={styles['container']}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        minZoom={5}
        className={styles['map']}
      >
        <TileLayer
          url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          opacity={0.7}
        />
        <MarkerCluster>
          {customers.map(customer => {
            return (
              <MarkerContainer
                key={customer.id}
                id={customer.id}
                position={[customer.coordinates.lat, customer.coordinates.lng]}
                selected={selectedId === customer.id}
                onMarkerClick={handleMarkerClick}
              >
                <Popup closeButton={false}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">{customer.name}</Typography>
                    <Typography variant="caption">{customer.address}</Typography>
                  </Stack>
                </Popup>
              </MarkerContainer>
            );
          })}
        </MarkerCluster>
      </MapContainer>
    </div>
  );
}

export default CustomersMap;
