import { API_BASE_URL } from '@/Constants';

// Mirrors GlobeAvailabilityEntryDto — countryCode and subIndicatorId are nullable in the schema
export interface GlobeAvailabilityEntry {
  countryCode: string | null;
  subIndicatorId: string | null; // composite e.g. "1_1"
  latestYear: number; // NOT nullable in schema
}

// Mirrors GlobeAvailabilityDto
export interface GlobeAvailabilityResponse {
  generatedAt: string;
  countriesWithData: string[] | null;
  entries: GlobeAvailabilityEntry[] | null;
}

export async function getGlobeAvailability(): Promise<GlobeAvailabilityResponse> {
  const res = await fetch(`${API_BASE_URL}/GlobeAvailability`);
  if (!res.ok) throw new Error(`GlobeAvailability ${res.status}`);
  return res.json();
}
