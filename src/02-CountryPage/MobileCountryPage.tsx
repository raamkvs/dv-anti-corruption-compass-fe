import CountryPageEl from './index';

import { CountriesDataType, IndicatorsMetaDataType } from '@/Types';

type Props = {
  isoCode: string;
  indicatorsMetaData: IndicatorsMetaDataType[];
  countriesList: CountriesDataType[];
  selectedIndicator: IndicatorsMetaDataType | 'country-profile';
};

export function MobileCountryPage(props: Props) {
  // Reuse existing country page for now; mobile-specific stacking is handled by global layout.
  return <CountryPageEl {...props} />;
}
