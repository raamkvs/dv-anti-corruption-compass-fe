import {
  API_BASE_URL,
  FACTS_API_PAGE_SIZE,
  logFactsPayloadSize,
  logFactsLoadStart,
  logFactsLoadEnd,
} from '@/Constants';

export const getAllCountriesAllData = async () => {
  const label = 'getAllCountriesAllData (homepage)';
  const loadStart = logFactsLoadStart(label);
  const response = await fetch(
    `${API_BASE_URL}/Facts?regionId=null&productMarketId=null&pageSize=${FACTS_API_PAGE_SIZE}`,
  );
  const data = await response.json();
  logFactsPayloadSize(label, data);
  logFactsLoadEnd(label, loadStart);
  return data;
};
