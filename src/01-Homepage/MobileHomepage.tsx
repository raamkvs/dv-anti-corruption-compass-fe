import HomepageEl from './HomepageEl';
import { useGlobeAvailability } from './useGlobeAvailability';

import { CountriesDataType, IndicatorsMetaDataType } from '@/Types';

type Props = {
  indicatorsMetaData: IndicatorsMetaDataType[];
  countriesList: CountriesDataType[];
  countriesListLoading: boolean;
  countriesListError: boolean;
};

export function MobileHomepage(props: Props) {
  const {
    globeAvailability: apiGlobeAvailability,
    countriesWithData,
    isLoading: globeAvailabilityLoading,
  } = useGlobeAvailability(props.indicatorsMetaData);

  return (
    <HomepageEl
      {...props}
      cachedCountriesYes={countriesWithData.map(id => ({
        id,
        x: 'Yes' as const,
      }))}
      cachedGlobeAvailability={apiGlobeAvailability}
      globeAvailabilityLoading={globeAvailabilityLoading}
    />
  );
}
