import HomepageEl from './HomepageEl';
import { useGlobeAvailability } from './useGlobeAvailability';

import { CountriesDataType, IndicatorsMetaDataType } from '@/Types';

function Homepage({
  indicatorsMetaData,
  countriesList,
  countriesListLoading,
  countriesListError,
}: {
  indicatorsMetaData: IndicatorsMetaDataType[];
  countriesList: CountriesDataType[];
  countriesListLoading: boolean;
  countriesListError: boolean;
}) {
  const {
    globeAvailability: apiGlobeAvailability,
    countriesWithData,
    isLoading: globeAvailabilityLoading,
  } = useGlobeAvailability(indicatorsMetaData);

  return (
    <HomepageEl
      cachedCountriesYes={countriesWithData.map(id => ({ id, x: 'Yes' as const }))}
      cachedGlobeAvailability={apiGlobeAvailability}
      globeAvailabilityLoading={globeAvailabilityLoading}
      indicatorsMetaData={indicatorsMetaData}
      countriesList={countriesList}
      countriesListLoading={countriesListLoading}
      countriesListError={countriesListError}
    />
  );
}

export default Homepage;
