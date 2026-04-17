import { Spinner } from '@undp/design-system-react/Spinner';

import { CountrySelect } from '@/Components/CountrySelect';
import { CountriesDataType } from '@/Types';

export const CountrySelectionSection = ({
  countriesList,
  indicator,
  loading = false,
}: {
  countriesList: CountriesDataType[];
  indicator: string;
  loading?: boolean;
}) => {
  return (
    <div
      className={`flex items-center w-full bg-cover bg-center bg-no-repeat bg-[url('/imgs/sphere.webp')] px-4 lg:px-20 min-h-0 lg:min-h-[calc(100vh-120px)] py-12 lg:py-0`}
    >
      {loading ? (
        <Spinner />
      ) : (
        <CountrySelect
          countriesList={countriesList}
          heading={`Uncover detailed ${indicator} data for your country`}
          description='Choose a country to reveal its complete anti-corruption profile — from key indicators to institutional strategies'
        />
      )}
    </div>
  );
};
