import { IndicatorsMetaDataType } from '@/Types';

/**
 * GlobeAvailability returns `subIndicatorId` as the sub-indicator *code* (e.g. corr_singleb, CORR1),
 * while the homepage globe filters on the composite UI id from /api/Indicators (e.g. 1_2).
 */
export function mapGlobeSubIndicatorCodeToCompositeId(
  apiSubIndicatorId: string,
  indicatorsMetaData: IndicatorsMetaDataType[],
): string | null {
  const t = apiSubIndicatorId.trim();
  for (const ind of indicatorsMetaData) {
    for (const sub of ind.subIndicators) {
      if (sub.code === t) return sub.id;
    }
  }
  const tl = t.toLowerCase();
  for (const ind of indicatorsMetaData) {
    for (const sub of ind.subIndicators) {
      if (sub.code.toLowerCase() === tl) return sub.id;
    }
  }
  return null;
}
