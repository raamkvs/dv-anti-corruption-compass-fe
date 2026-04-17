export type HomepageCountriesYes = { id: string; x: 'Yes' }[];

export type HomepageGlobeAvailability = {
  countryCode: string;
  indicatorId: string; // `${mainIndicatorId}_${subIndicatorId}`
  year: number;
}[];

type HomepageFactsCache = {
  version: 1;
  savedAt: string;
  countriesYes: HomepageCountriesYes;
  globeAvailability: HomepageGlobeAvailability;
};

const STORAGE_KEY = 'ac-compass:homepage-facts-cache:v1';

export function loadHomepageFactsCache(): HomepageFactsCache | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HomepageFactsCache;
    if (parsed?.version !== 1) return null;
    if (!Array.isArray(parsed.countriesYes)) return null;
    if (!Array.isArray(parsed.globeAvailability)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveHomepageFactsCache(input: {
  countriesYes: HomepageCountriesYes;
  globeAvailability: HomepageGlobeAvailability;
}): void {
  try {
    const payload: HomepageFactsCache = {
      version: 1,
      savedAt: new Date().toISOString(),
      countriesYes: input.countriesYes,
      globeAvailability: input.globeAvailability,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore (private mode, quota exceeded, etc.)
  }
}
