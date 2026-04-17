import { API_BASE_URL } from '@/Constants';

export interface FactsTableRow {
  factId: number;
  mainIndicatorId: number;
  mainIndicatorName: string | null;
  countryCode: string | null;
  countryName: string | null;
  subIndicatorId: string | null;
  subIndicatorName: string | null;
  year: number;
  numericValue: number | null;
  indicatorValue: string | null;
  indicatorColors: string | null;
  suffix: string | null;
}

export interface FactsTableFilters {
  mainIndicatorId: number | null;
  year: number | null;
  subIndicatorIds: string[] | null;
  countryCode: string | null;
}

export interface FactsTableResponse {
  rows: FactsTableRow[] | null;
  page: number;
  pageSize: number;
  totalRows: number;
  hasNext: boolean;
  filters: FactsTableFilters | null;
}

export interface GetFactsTableParams {
  mainIndicatorId?: number;
  year?: number;
  subIndicatorIds?: string[];
  countryCode?: string;
  page: number;
  pageSize: number;
}

export async function getFactsTable(
  params: GetFactsTableParams,
): Promise<FactsTableResponse> {
  const search = new URLSearchParams();
  if (params.mainIndicatorId !== undefined)
    search.set('mainIndicatorId', String(params.mainIndicatorId));
  if (params.year !== undefined) search.set('year', String(params.year));
  if (params.subIndicatorIds?.length)
    search.set('subIndicatorIds', params.subIndicatorIds.join(','));
  if (params.countryCode) search.set('countryCode', params.countryCode);
  search.set('page', String(params.page));
  search.set('pageSize', String(params.pageSize));

  const res = await fetch(`${API_BASE_URL}/FactsTable?${search.toString()}`);
  if (!res.ok) throw new Error(`FactsTable ${res.status}`);
  return res.json();
}
