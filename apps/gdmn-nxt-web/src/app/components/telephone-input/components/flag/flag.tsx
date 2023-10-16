import { TelInputCountry } from '../../constants/countries';
import { FlagSize } from '../../types';
import unknownFlag from '../../assets/unknown-flag.png';
import { Styled } from './styled';

const getSourceByIsoCode = (isoCode: TelInputCountry | null) => {
  if (!isoCode) {
    return unknownFlag;
  };

  return '';
};

export interface FlagProps {
  isoCode: TelInputCountry | null;
  countryName?: string;
  size?: FlagSize;
}

export function Flag(props: FlagProps) {
  const { size = 'small', isoCode, countryName = '' } = props;

  const isoCodeFormatted = isoCode ? isoCode.toLowerCase() : '';
  const sourceFound = getSourceByIsoCode(isoCode);
  const width = size === 'small' ? 40 : 80;

  return (
    <Styled.Flag className="TelInput-Flag">
      {sourceFound ? (
        <img
          src={sourceFound}
          alt={countryName || 'unknown'}
          width={width / 2}
        />
      ) : (
        <Styled.Picture>
          <source
            type="image/webp"
            srcSet={`https://flagcdn.com/w${width}/${isoCodeFormatted}.webp`}
          />
          <source
            type="image/png"
            srcSet={`https://flagcdn.com/w${width}/${isoCodeFormatted}.png`}
          />
          <img
            src={`https://flagcdn.com/w${width}/${isoCodeFormatted}.png`}
            width={width / 2}
            alt={countryName || 'unknown'}
            loading="lazy"
          />
        </Styled.Picture>
      )}

      {isoCode ? <Styled.Span>{isoCode}</Styled.Span> : null}
    </Styled.Flag>
  );
}

export default Flag;
