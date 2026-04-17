import { IndicatorsMetaDataType, SubIndicatorsMetaDataType } from '@/Types';

function norm(s: string | null | undefined): string {
  return (s || '').toLowerCase().replaceAll('_', ' ').trim();
}

function findSubIndicator(
  indicator: IndicatorsMetaDataType,
  predicate: (s: SubIndicatorsMetaDataType) => boolean,
): SubIndicatorsMetaDataType | undefined {
  return indicator.subIndicators.find(predicate);
}

/**
 * Picks the default sub-indicator per pillar for the homepage.
 * Falls back to the first sub-indicator if no preferred match is found.
 */
export function getHomepageDefaultSubIndicatorId(
  indicator: IndicatorsMetaDataType,
): string {
  const indicatorName = norm(indicator.name);

  // Public Procurement: prefer "Non-open procedures"
  if (indicatorName.includes('public procurement')) {
    const match =
      findSubIndicator(indicator, s => norm(s.name).includes('non-open')) ||
      findSubIndicator(indicator, s => norm(s.name).includes('non open')) ||
      findSubIndicator(indicator, s => norm(s.code).includes('non-open')) ||
      findSubIndicator(indicator, s => norm(s.code).includes('non open'));
    return match?.id || indicator.subIndicators[0]?.id;
  }

  // World Bank Enterprise Survey: prefer "Bribe expected by tax officials"
  if (
    indicatorName.includes('enterprise survey') ||
    indicatorName.includes('enterprise surveys') ||
    indicatorName.includes('world bank')
  ) {
    const match =
      findSubIndicator(indicator, s =>
        norm(s.name).includes('bribe expected by tax officials'),
      ) ||
      findSubIndicator(indicator, s =>
        norm(s.name).includes('tax officials'),
      ) ||
      findSubIndicator(indicator, s => norm(s.code).includes('tax')) ||
      findSubIndicator(indicator, s => norm(s.code).includes('bribe'));
    return match?.id || indicator.subIndicators[0]?.id;
  }

  return indicator.subIndicators[0]?.id;
}
