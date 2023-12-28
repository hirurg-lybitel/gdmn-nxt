import { CountryCode } from 'libphonenumber-js';
import metadatas from 'libphonenumber-js/metadata.min.json';

export const COUNTRIES = metadatas.countries;
export const ISO_CODES = Object.keys(COUNTRIES) as CountryCode[];
export type TelInputCountry = CountryCode;
export const DEFAULT_ISO_CODE: TelInputCountry = 'BY';
