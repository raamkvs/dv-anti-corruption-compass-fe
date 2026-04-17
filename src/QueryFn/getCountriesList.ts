import { logGlobalApiTimingEnd, logGlobalApiTimingStart } from '@/Constants';

export const getCountriesList = async () => {
  const start = logGlobalApiTimingStart();
  const response = await fetch(
    'https://app.anti-corruption.org/api/Countries/',
  );
  const data = await response.json();
  logGlobalApiTimingEnd('getCountriesList (GET /Countries/)', start);
  return data;
};
