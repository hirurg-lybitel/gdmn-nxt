import { COUNTRIES, TelInputCountry } from '../constants/countries';

export function getPhoneCodeOfCountry(isoCode: TelInputCountry): string {
  return COUNTRIES[isoCode]?.[0] as string;
};
