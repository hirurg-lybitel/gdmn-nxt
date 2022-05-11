import styles from './customers-map.module.less';
import { Stack, Typography } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MarkerCluster } from './marker-cluster';

import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import { customers } from './exampleCustomers';


const defaultCenter = { lat: 53.902891, lng: 27.561102 };

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [30, 40],
  iconAnchor: [20, 40],
  popupAnchor: [-5, -40]
});

/* eslint-disable-next-line */
export interface CustomersMapProps {}

export function CustomersMap(props: CustomersMapProps) {
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
              <Marker key={customer.id} position={[customer.coordinates.lat, customer.coordinates.lng]} icon={defaultIcon}>
                <Popup closeButton={false}>
                  <Stack spacing={1}>
                    <Typography variant="h4">{customer.name}</Typography>
                    <Typography variant="caption">{customer.address}</Typography>
                  </Stack>
                </Popup>
              </Marker>
            );
          })}
        </MarkerCluster>
      </MapContainer>
    </div>
  );
}

export default CustomersMap;
