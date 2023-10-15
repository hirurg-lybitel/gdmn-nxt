import { NumberType } from 'libphonenumber-js';
import { TelInputCountry } from '../constants/countries';

export type FlagSize = 'small' | 'large';
export type TelInputReason = 'country' | 'input';
export interface TelInputInfo {
  countryCode: TelInputCountry | null;
  countryPhoneCode: string | null;
  nationalNumber: string | null;
  numberType: Exclude<NumberType, undefined> | null;
  numberValue: string | null;
  reason: TelInputReason;
};
