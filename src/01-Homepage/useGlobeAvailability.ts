import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getGlobeAvailability } from '@/QueryFn/getGlobeAvailability';
import { GlobeAvailabilityResponse } from '@/QueryFn/getGlobeAvailability';
import { HomepageGlobeAvailability } from '@/Utils/homepageFactsCache';
import { mapGlobeSubIndicatorCodeToCompositeId } from '@/Utils/mapGlobeSubIndicatorCodeToCompositeId';
import { IndicatorsMetaDataType } from '@/Types';
import staticGlobeAvailability from '@/static/globeAvailability.json';

export function useGlobeAvailability(indicatorsMetaData: IndicatorsMetaDataType[]) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['globeAvailability'],
    queryFn: getGlobeAvailability,
    initialData: staticGlobeAvailability as unknown as GlobeAvailabilityResponse,
    initialDataUpdatedAt: 0, // treat bundled data as stale → refetch immediately in background
    staleTime: 1000 * 60 * 60, // 1 h — matches CDN long TTL
    gcTime: 1000 * 60 * 60 * 24,
  });

  const globeAvailability: HomepageGlobeAvailability = useMemo(() => {
    return (data?.entries ?? [])
      .filter(e => e.countryCode != null && e.subIndicatorId != null)
      .map(e => {
        const compositeId = mapGlobeSubIndicatorCodeToCompositeId(
          e.subIndicatorId!,
          indicatorsMetaData,
        );
        if (!compositeId) return null;
        return {
          countryCode: e.countryCode!,
          indicatorId: compositeId,
          year: e.latestYear,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row != null);
  }, [data?.entries, indicatorsMetaData]);

  return {
    globeAvailability,
    countriesWithData: data?.countriesWithData ?? [],
    isLoading,
    isError,
  };
}
