import { API_BASE_URL } from '@/Constants';

export interface BandDataDto {
  low_Min: number;
  low_Max: number;
  medium_Min: number;
  medium_Max: number;
  high_Min: number;
  high_Max: number;
}

// Mirrors CountryIndicatorOverviewRowDto
export interface LatestOverviewEntry {
  subIndicatorId: string | null;
  subIndicatorName: string | null;
  numericValue: number | null;
  indicatorValue: string | null;
  bandData: BandDataDto | null;
}

// Mirrors CountryIndicatorMarketRowDto
export interface MarketRowDto {
  productMarketId: number;
  marketName: string | null;
  numericValue: number | null;
  indicatorValue: string | null;
}

// Mirrors CountryIndicatorMarketBreakdownDto
export interface MarketBreakdownDto {
  subIndicatorId: string | null;
  year: number;
  contractValue: string | null;
  markets: MarketRowDto[] | null;
}

// Mirrors CountryIndicatorAvailabilityPointDto
export interface AvailabilityPointDto {
  year: number;
  indicatorAvailability: number | null;
}

// Mirrors ProductMarketRefDto
export interface ProductMarketRefDto {
  productMarketId: number;
  name: string | null;
}

// Mirrors CountryIndicatorAvailabilityDto
export interface DataAvailabilitySeriesDto {
  subIndicatorId: string | null;
  contractValue: string | null;
  productMarket: ProductMarketRefDto | null;
  series: AvailabilityPointDto[] | null;
}

// Mirrors CountryIndicatorDashboardDto
export interface CountryIndicatorDashboardResponse {
  countryCode: string | null;
  mainIndicatorId: number;
  availableYears: number[] | null;
  latestYear: number | null;
  availableContractValues: string[] | null;
  latestOverview: LatestOverviewEntry[] | null;
  marketBreakdown: MarketBreakdownDto[] | null;
  dataAvailability: DataAvailabilitySeriesDto[] | null;
  availableMarkets: ProductMarketRefDto[] | null;
}

export async function getCountryIndicatorDashboard(
  countryCode: string,
  mainIndicatorId: number,
): Promise<CountryIndicatorDashboardResponse> {
  const res = await fetch(
    `${API_BASE_URL}/CountryIndicatorDashboard/${countryCode}/${mainIndicatorId}`,
  );
  if (!res.ok) throw new Error(`CountryIndicatorDashboard ${res.status}`);
  return res.json();
}
