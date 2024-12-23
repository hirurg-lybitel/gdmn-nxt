import { GeoData } from '@gsbelarus/util-api-types';

export async function getGeoData(ip: string): Promise<GeoData> {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const { country, countryCode, city } = await response.json();

    return {
      country, countryCode, city
    };
  } catch (error) {
    console.error('Error fetching geo data:', error);
    return { country: '', countryCode: '', city: '' };
  }
}
