import MainIndicatorPageEl from './index';

import { CountriesDataType, IndicatorsMetaDataType } from '@/Types';

type Props = {
  indicatorMetaData: IndicatorsMetaDataType;
  countriesList: CountriesDataType[];
  countriesListDataError: boolean;
  countriesListDataLoading: boolean;
};

export function MobileMainIndicatorPage(props: Props) {
  // Initial implementation reuses the desktop composition to keep behavior identical.
  // Mobile-specific layout refinements can be layered on via the `.mobileApp` scope.
  return <MainIndicatorPageEl {...props} />;
}
