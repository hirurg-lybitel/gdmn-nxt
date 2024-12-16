export interface GeoData {
  country: string;
  countryCode: string;
  city: string;
}

export interface DeviceData {
  os?: {
    name: string;
    version?: string;
  };
  browser?: {
    name: string;
    version?: string;
  };
}

export interface ISessionInfo {
  id: string,
  ip: string,
  location: GeoData,
  device?: DeviceData,
  creationDate: Date,
  current: boolean
}
