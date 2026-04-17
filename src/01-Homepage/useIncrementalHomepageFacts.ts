import { useEffect, useMemo, useRef, useState } from 'react';

import { DataType, IndicatorsMetaDataType } from '@/Types';
import { getFactsPage } from '@/QueryFn/getFactsPage';
import {
  loadHomepageFactsCache,
  saveHomepageFactsCache,
} from '@/Utils/homepageFactsCache';
import seededStageAFacts from '@/static/factsStageA.json';

const seededFactsStageA = seededStageAFacts as unknown as DataType[];

const DEFAULT_PAGE_SIZE = 50000;

function indicatorId(mainIndicatorId: number, subIndicatorId: number) {
  return `${mainIndicatorId}_${subIndicatorId}`;
}

function parseCombinedId(id: string): {
  mainIndicatorId: number;
  subIndicatorId: number;
} {
  const [m, s] = id.split('_');
  return { mainIndicatorId: parseInt(m, 10), subIndicatorId: parseInt(s, 10) };
}

type AvailabilityKey = `${string}|${string}`; // `${countryCode}|${indicatorId}`

export function useIncrementalHomepageFacts(options: {
  indicatorsMetaData: IndicatorsMetaDataType[];
  firstPillarsCount: number;
}) {
  const { indicatorsMetaData, firstPillarsCount } = options;

  const cached = useMemo(() => loadHomepageFactsCache(), []);

  const hasSeededStageAFacts = seededFactsStageA.length > 0;

  const [facts, setFacts] = useState<DataType[]>(seededFactsStageA);
  const [factsLoading, setFactsLoading] = useState(!hasSeededStageAFacts);
  const [factsError, setFactsError] = useState(false);
  const [globeAvailability, setGlobeAvailability] = useState(
    cached?.globeAvailability || [],
  );

  const factsByIdRef = useRef<Map<number, DataType>>(new Map());
  const availabilityRef = useRef<Map<AvailabilityKey, number>>(new Map());
  const loadedIndicatorIdsRef = useRef<Set<string>>(new Set());
  const abortRef = useRef<boolean>(false);

  // seed availability map from cache
  useEffect(() => {
    if (!cached?.globeAvailability) return;
    for (const a of cached.globeAvailability) {
      const key = `${a.countryCode}|${a.indicatorId}` as AvailabilityKey;
      const prev = availabilityRef.current.get(key);
      // Preserve the latest year if we already seeded from static facts.
      if (prev === undefined || a.year > prev) {
        availabilityRef.current.set(key, a.year);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstTargets = useMemo(() => {
    const activeIndicators = indicatorsMetaData.filter(d => !d.comingSoon);

    // Priority load: Public Procurement + World Bank Enterprise Survey
    const priority = activeIndicators
      .filter(ind => {
        const name = (ind.name || '').toLowerCase();
        return (
          name.includes('public procurement') ||
          name.includes('enterprise survey') ||
          name.includes('enterprise surveys') ||
          name.includes('world bank')
        );
      })
      // Ensure deterministic order: Public Procurement first, then WBES
      .sort((a, b) => {
        const an = (a.name || '').toLowerCase();
        const bn = (b.name || '').toLowerCase();
        const score = (n: string) =>
          n.includes('public procurement')
            ? 0
            : n.includes('enterprise survey') ||
                n.includes('enterprise surveys') ||
                n.includes('world bank')
              ? 1
              : 2;
        return score(an) - score(bn);
      });

    const chosen =
      priority.length >= firstPillarsCount
        ? priority.slice(0, firstPillarsCount)
        : [
            ...priority,
            ...activeIndicators.filter(i => !priority.includes(i)),
          ].slice(0, firstPillarsCount);

    return Array.from(
      new Set(
        chosen.flatMap(ind => ind.subIndicators.map(s => s.id)).filter(Boolean),
      ),
    );
  }, [indicatorsMetaData, firstPillarsCount]);

  const backgroundTargets = useMemo(() => {
    const activeIndicators = indicatorsMetaData.filter(d => !d.comingSoon);
    const all = activeIndicators.flatMap(ind =>
      ind.subIndicators.map(s => s.id),
    );
    const remaining = all.filter(id => id && !firstTargets.includes(id));
    return Array.from(new Set(remaining));
  }, [indicatorsMetaData, firstTargets]);

  const recomputeDerived = () => {
    const availability: {
      countryCode: string;
      indicatorId: string;
      year: number;
    }[] = [];
    availabilityRef.current.forEach((year, key) => {
      const [countryCode, indId] = key.split('|');
      availability.push({ countryCode, indicatorId: indId, year });
    });
    setGlobeAvailability(availability);

    const countriesYes = [...new Set(availability.map(a => a.countryCode))].map(
      d => ({ id: d, x: 'Yes' as const }),
    );
    saveHomepageFactsCache({ countriesYes, globeAvailability: availability });
  };

  // Seed internal maps for first render (so globe + charts can render instantly).
  useEffect(() => {
    if (!hasSeededStageAFacts) return;

    for (const fact of seededFactsStageA) {
      factsByIdRef.current.set(fact.factId, fact);
      if (fact.numericValue !== null && fact.numericValue !== undefined) {
        const key = `${fact.countryCode}|${fact.id}` as AvailabilityKey;
        const prev = availabilityRef.current.get(key);
        if (prev === undefined || fact.year > prev) {
          availabilityRef.current.set(key, fact.year);
        }
      }
    }

    recomputeDerived();
    setFactsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mergeFactsPage = (
    page: unknown[],
    mainIndicatorId: number,
    subIndicatorId: number,
  ) => {
    let factsChanged = false;
    let availabilityChanged = false;
    for (const raw of page as DataType[]) {
      const factId = raw.factId as unknown as number;
      const mapped: DataType = {
        ...raw,
        id: indicatorId(mainIndicatorId, subIndicatorId),
      };

      const prevFact = factsByIdRef.current.get(factId);
      if (!prevFact) {
        factsByIdRef.current.set(factId, mapped);
        factsChanged = true;
      } else if (
        prevFact.year !== mapped.year ||
        prevFact.numericValue !== mapped.numericValue ||
        prevFact.contractValue !== mapped.contractValue
      ) {
        // Refresh may return updated numeric/year values for the same factId.
        factsByIdRef.current.set(factId, mapped);
        factsChanged = true;
      }

      if (mapped.numericValue !== null && mapped.numericValue !== undefined) {
        const key = `${mapped.countryCode}|${mapped.id}` as AvailabilityKey;
        const prev = availabilityRef.current.get(key);
        if (prev === undefined || mapped.year > prev) {
          availabilityRef.current.set(key, mapped.year);
          availabilityChanged = true;
        }
      }
    }

    if (factsChanged) {
      setFacts(Array.from(factsByIdRef.current.values()));
    }
    if (factsChanged || availabilityChanged) {
      recomputeDerived();
    }
  };

  async function fetchAllPagesForSubIndicator(combinedId: string) {
    const { mainIndicatorId, subIndicatorId } = parseCombinedId(combinedId);
    if (loadedIndicatorIdsRef.current.has(combinedId)) return;
    loadedIndicatorIdsRef.current.add(combinedId);

    let page = 1;
    // keep paging until page returns < pageSize

    while (true) {
      if (abortRef.current) return;
      const data = await getFactsPage({
        mainIndicatorId,
        subIndicatorId,
        regionId: null,
        productMarketId: null,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      if (abortRef.current) return;
      if (Array.isArray(data) && data.length > 0) {
        mergeFactsPage(data, mainIndicatorId, subIndicatorId);
      }
      if (!Array.isArray(data) || data.length < DEFAULT_PAGE_SIZE) break;
      page += 1;
    }
  }

  useEffect(() => {
    abortRef.current = false;
    setFactsError(false);
    setFactsLoading(!hasSeededStageAFacts);

    (async () => {
      try {
        // StageA: first N pillars default sub-indicators (parallel)
        await Promise.all(
          firstTargets.map(t => fetchAllPagesForSubIndicator(t)),
        );
        if (abortRef.current) return;
        setFactsLoading(false);

        // StageB: remaining sub-indicators (sequential background)
        for (const t of backgroundTargets) {
          if (abortRef.current) return;
          if (loadedIndicatorIdsRef.current.has(t)) continue;

          await fetchAllPagesForSubIndicator(t);
        }
      } catch {
        if (abortRef.current) return;
        setFactsError(true);
        setFactsLoading(false);
      }
    })();

    return () => {
      abortRef.current = true;
    };
  }, [firstTargets, backgroundTargets]);

  return {
    facts,
    factsLoading,
    factsError,
    globeAvailability,
    cachedCountriesYes: cached?.countriesYes || [],
  };
}
