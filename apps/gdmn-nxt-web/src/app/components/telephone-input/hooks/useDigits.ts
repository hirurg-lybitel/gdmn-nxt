import { ChangeEvent, useEffect, useRef, useState } from 'react';
import examples from 'libphonenumber-js/mobile/examples';
import { AsYouType, getExampleNumber } from 'libphonenumber-js';
import { COUNTRIES, DEFAULT_ISO_CODE, TelInputCountry } from '../constants/countries';
import { getPhoneCodeOfCountry } from '../helpers/countries';
import { TelInputInfo, TelInputReason } from '../types';

type UseDigitsParams = {
  value: string;
  onChange?: (value: string, info: TelInputInfo) => void;
  defaultCountry?: TelInputCountry;
  disableFormatting: boolean;
  onlyCountries?: TelInputCountry[];
  fixedCode?: boolean;
  strictMode?: boolean;
}

type State = {
  inputValue: string;
  isoCode: TelInputCountry | null;
}

type GetInitialStateParams = {
  initialValue: string;
  defaultCountry?: TelInputCountry;
  disableFormatting: boolean;
  fixedCode?: boolean;
}

export function getInitialState(params: GetInitialStateParams): State {
  const { defaultCountry, initialValue, disableFormatting, fixedCode } =
    params;

  const fallbackValue = defaultCountry
    ? `+${COUNTRIES[defaultCountry]?.[0] as string}`
    : '';

  const asYouType = new AsYouType(defaultCountry);
  let inputValue = asYouType.input(initialValue);

  if (fixedCode && inputValue === '+' && defaultCountry) {
    inputValue = `+${COUNTRIES[defaultCountry]?.[0] as string}`;
  }

  const phoneNumberValue = asYouType.getNumberValue();

  if (disableFormatting && phoneNumberValue) {
    inputValue = phoneNumberValue;
  }

  return {
    inputValue: inputValue || fallbackValue,
    isoCode: asYouType.getCountry() ?? defaultCountry ?? null
  };
}

type Filters = {
  onlyCountries?: TelInputCountry[];
}

function checkIsoCodeAccepted(
  isoCode: TelInputCountry,
  filters: Filters
): boolean {
  const { onlyCountries } = filters;

  if (Array.isArray(onlyCountries) && !onlyCountries.includes(isoCode)) {
    return false;
  }

  return true;
}

export default function UseDigits(params: UseDigitsParams) {
  const {
    value,
    onChange,
    defaultCountry,
    onlyCountries,
    disableFormatting,
    fixedCode,
    strictMode
  } = params;

  const previousCountryRef = useRef<TelInputCountry | null>(
    defaultCountry ?? null
  );
  const asYouTypeRef = useRef<AsYouType>(new AsYouType(defaultCountry));
  const inputRef = useRef<HTMLInputElement>(null);
  const [previousDefaultCountry, setPreviousDefaultCountry] = useState<TelInputCountry | undefined>(defaultCountry);

  const [state, setState] = useState<State>(() => {
    return getInitialState({
      initialValue: value,
      defaultCountry,
      disableFormatting,
      fixedCode
    });
  });

  const [previousValue, setPreviousValue] = useState(value);

  const getPhoneInfo = (reason: TelInputReason): TelInputInfo => ({
    countryPhoneCode: asYouTypeRef.current.getCallingCode() || null,
    countryCode: asYouTypeRef.current.getCountry() || null,
    nationalNumber: asYouTypeRef.current.getNationalNumber(),
    numberType: asYouTypeRef.current.getNumber()?.getType() ?? null,
    numberValue: asYouTypeRef.current.getNumberValue() || null,
    reason
  });

  const checkIsoCodeValid = (isoCode: TelInputCountry | null) => {
    return (
      isoCode &&
      checkIsoCodeAccepted(isoCode, { onlyCountries })
    );
  };

  const typeNewValue = (inputValue: string): string => {
    asYouTypeRef.current.reset();

    return asYouTypeRef.current.input(inputValue);
  };

  const checkStartWithPlusOrEmpty = (inputValue: string): string => {
    return inputValue.startsWith('+') || inputValue === ''
      ? inputValue
      : `+${inputValue}`;
  };

  const checkStartWithPlusIsoCode = (
    inputValue: string,
    country: TelInputCountry
  ): string => {
    return `+${getPhoneCodeOfCountry(country)}${inputValue}`;
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const inputValue = fixedCode
      ? checkStartWithPlusIsoCode(
        event.target.value,
          state.isoCode as TelInputCountry
      )
      : checkStartWithPlusOrEmpty(event.target.value);

    const formattedValue = typeNewValue(inputValue);
    const newCountryCode = asYouTypeRef.current.getCountry();

    const country = fixedCode
      ? state.isoCode
      : newCountryCode || previousCountryRef.current;
    const numberValue = asYouTypeRef.current.getNumberValue() ?? '';

    if (strictMode) {
      const examplePhoneNumber = getExampleNumber(state.isoCode ?? DEFAULT_ISO_CODE, examples);
      if (examplePhoneNumber?.number &&
        examplePhoneNumber.number.length > 0 &&
        numberValue.length > examplePhoneNumber.number.length) {
        return;
      }
    };

    previousCountryRef.current = country;

    const phoneInfo = getPhoneInfo('input');

    if (numberValue && (!country || !checkIsoCodeValid(country))) {
      const validNumberValue = phoneInfo.nationalNumber ? numberValue : '';
      onChange?.(validNumberValue, {
        ...getPhoneInfo('input'),
        countryCode: null,
        countryPhoneCode: null,
        nationalNumber: null
      });
      setPreviousValue(validNumberValue);
      setState({
        isoCode: null,
        inputValue: validNumberValue
      });
    } else {
      const valueToSet = disableFormatting ? numberValue : formattedValue;
      const validValue = phoneInfo.nationalNumber ? valueToSet : '';
      onChange?.(validValue, getPhoneInfo('input'));
      setPreviousValue(validValue);
      setState({
        isoCode: country,
        inputValue: validValue
      });
    }
  };

  useEffect(() => {
    if (value !== previousValue) {
      setPreviousValue(value);
      const newState = getInitialState({
        initialValue: value,
        defaultCountry,
        // defaultCountry: previousCountryRef.current ?? defaultCountry,
        disableFormatting,
        fixedCode
      });
      previousCountryRef.current = newState.isoCode;
      setState(newState);
    }
  }, [
    value,
    previousValue,
    defaultCountry,
    disableFormatting,
    fixedCode
  ]);

  useEffect(() => {
    if (defaultCountry !== previousDefaultCountry) {
      setPreviousDefaultCountry(defaultCountry);
      asYouTypeRef.current = new AsYouType(defaultCountry);
      const { inputValue, isoCode } = getInitialState({
        initialValue: '',
        defaultCountry,
        disableFormatting,
        fixedCode
      });
      setPreviousValue(inputValue);
      asYouTypeRef.current.input(inputValue);
      previousCountryRef.current = asYouTypeRef.current.getCountry() ?? null;
      onChange?.(inputValue, getPhoneInfo('country'));
      setState({
        inputValue,
        isoCode
      });
    }
  }, [
    defaultCountry,
    previousDefaultCountry,
    onChange,
    disableFormatting,
    fixedCode
  ]);

  const onCountryChange = (newCountry: TelInputCountry): void => {
    if (newCountry === state.isoCode) {
      return;
    };

    const callingCode = COUNTRIES[newCountry]?.[0] as string;
    const { inputValue, isoCode } = state;
    const inputValueWithoutCallingCode = isoCode
      ? inputValue.replace(`+${getPhoneCodeOfCountry(isoCode)}`, '')
      : inputValue;

    let newValue = `+${callingCode}${inputValueWithoutCallingCode}`;

    if (!disableFormatting) {
      newValue = typeNewValue(newValue);
    }

    onChange?.(newValue, {
      ...getPhoneInfo('country'),
      countryCode: newCountry
    });
    previousCountryRef.current = newCountry;
    setPreviousValue(newValue);
    setState({
      isoCode: newCountry,
      inputValue: newValue
    });
  };

  return {
    inputValue: state.inputValue,
    isoCode: state.isoCode,
    onInputChange,
    onCountryChange,
    inputRef
  };
}
