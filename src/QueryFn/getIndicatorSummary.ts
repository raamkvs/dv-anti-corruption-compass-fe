import { API_BASE_URL } from '@/Constants';

export interface BandDataDto {
  low_Min: number;
  low_Max: number;
  medium_Min: number;
  medium_Max: number;
  high_Min: number;
  high_Max: number;
}

export interface IndicatorSummarySubIndicatorDto {
  subIndicatorId: string | null;
  name: string | null;
  bandDataByContractValue: Record<string, BandDataDto> | null;
}

export interface IndicatorSummaryOverviewStatsDto {
  countryCount: number;
  p25: number | null;
  median: number | null;
  p75: number | null;
}

export interface IndicatorSummaryGlobeRowDto {
  countryCode: string | null;
  numericValue: number | null;
  indicatorValue: string | null;
}

export interface IndicatorSummaryTableRowDto {
  countryCode: string | null;
  countryName: string | null;
  numericValue: number | null;
  indicatorValue: string | null;
}

// Mirrors IndicatorSummaryDto from Swagger
export interface IndicatorSummaryDto {
  mainIndicatorId: number;
  availableYears: number[] | null;
  latestYear: number | null;
  subIndicators: IndicatorSummarySubIndicatorDto[] | null;
  overviewStats: IndicatorSummaryOverviewStatsDto;
  currentGlobeRows: IndicatorSummaryGlobeRowDto[] | null;
  tableRows: IndicatorSummaryTableRowDto[] | null;
}

export interface GetIndicatorSummaryParams {
  year?: number;
  subIndicatorId?: string;
  contractValue?: string;
}

export async function getIndicatorSummary(
  mainIndicatorId: number,
  params?: GetIndicatorSummaryParams,
): Promise<IndicatorSummaryDto> {
  const search = new URLSearchParams();
  if (params?.year !== undefined) search.set('year', String(params.year));
  if (params?.subIndicatorId) search.set('subIndicatorId', params.subIndicatorId);
  if (params?.contractValue) search.set('contractValue', params.contractValue);
  const query = search.toString();
  const res = await fetch(
    `${API_BASE_URL}/IndicatorSummary/${mainIndicatorId}${query ? `?${query}` : ''}`,
  );
  if (!res.ok) throw new Error(`IndicatorSummary ${res.status}`);
  return res.json();
}
