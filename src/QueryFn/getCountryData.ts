import {
  API_BASE_URL,
  FACTS_API_PAGE_SIZE,
  logFactsPayloadSize,
  logFactsLoadStart,
  logFactsLoadEnd,
} from '@/Constants';

export const getCountryData = async (
  countryCode: string,
  mainIndicatorId: number,
) => {
  const label = `getCountryData(${countryCode}, ${mainIndicatorId})`;
  const loadStart = logFactsLoadStart(label);
  const response = await fetch(
    `${API_BASE_URL}/Facts?countryCode=${countryCode}&regionId=null&mainIndicatorId=${mainIndicatorId}&pageSize=${FACTS_API_PAGE_SIZE}`,
  );
  const data = await response.json();
  logFactsPayloadSize(label, data);
  logFactsLoadEnd(label, loadStart);
  return data;
};
