import { API_BASE_URL, logFactsLoadEnd, logFactsLoadStart } from '@/Constants';

export type GetFactsPageParams = {
  mainIndicatorId?: number;
  subIndicatorId?: number;
  countryCode?: string;
  year?: number;
  regionId?: string | null;
  productMarketId?: string | null;
  page: number;
  pageSize: number;
};

export async function getFactsPage(params: GetFactsPageParams) {
  const search = new URLSearchParams();
  if (params.mainIndicatorId !== undefined)
    search.set('mainIndicatorId', String(params.mainIndicatorId));
  if (params.subIndicatorId !== undefined)
    search.set('subIndicatorId', String(params.subIndicatorId));
  if (params.countryCode) search.set('countryCode', params.countryCode);
  if (params.year !== undefined) search.set('year', String(params.year));
  if (params.regionId !== undefined)
    search.set('regionId', String(params.regionId));
  if (params.productMarketId !== undefined)
    search.set('productMarketId', String(params.productMarketId));
  search.set('page', String(params.page));
  search.set('pageSize', String(params.pageSize));

  const label = `getFactsPage(page=${params.page}, pageSize=${params.pageSize})`;
  const start = logFactsLoadStart(label);
  const response = await fetch(`${API_BASE_URL}/Facts?${search.toString()}`);
  const data = await response.json();
  logFactsLoadEnd(label, start);
  return data;
}
