import { logGlobalApiTimingEnd, logGlobalApiTimingStart } from '@/Constants';

export const getIndicatorsMetaData = async () => {
  const start = logGlobalApiTimingStart();
  const response = await fetch(
    'https://app.anti-corruption.org/api/Indicators',
  );
  const data = await response.json();
  logGlobalApiTimingEnd('getIndicatorsMetaData (GET /Indicators)', start);
  return data;
};
