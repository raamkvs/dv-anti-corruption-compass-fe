import {
  API_BASE_URL,
  FACTS_API_PAGE_SIZE_SMALL,
  logFactsPayloadSize,
  logFactsLoadStart,
  logFactsLoadEnd,
} from '@/Constants';

export const getRegionalDataForCountry = async (
  countryCode: string,
  mainIndicatorId: number,
  subIndicatorId: number,
  year: number,
  productMarketId: number | null,
) => {
  const label = `getRegionalDataForCountry(${countryCode}, ...)`;
  const loadStart = logFactsLoadStart(label);
  const response = await fetch(
    `${API_BASE_URL}/Facts?countryCode=${countryCode}&subIndicatorId=${subIndicatorId}&productMarketId=${productMarketId}&year=${year}&mainIndicatorId=${mainIndicatorId}&pageSize=${FACTS_API_PAGE_SIZE_SMALL}`,
  );
  const data = await response.json();
  logFactsPayloadSize(label, data);
  logFactsLoadEnd(label, loadStart);
  return data;
};
