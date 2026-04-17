import { Spinner } from '@undp/design-system-react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import Viz from './Viz';

import { CountriesDataType, IndicatorsMetaDataType } from '@/Types';
import { ErrorState } from '@/Components/ErrorState';
import {
  getCountryIndicatorDashboard,
  CountryIndicatorDashboardResponse,
} from '@/QueryFn/getCountryIndicatorDashboard';
import staticDashboard2 from '@/static/cache/countryDashboard_2.json';
import staticDashboard1 from '@/static/cache/countryDashboard_1.json';

const dashboardCaches: Record<
  number,
  Record<string, CountryIndicatorDashboardResponse>
> = {
  1: staticDashboard1 as unknown as Record<
    string,
    CountryIndicatorDashboardResponse
  >,
  2: staticDashboard2 as unknown as Record<
    string,
    CountryIndicatorDashboardResponse
  >,
};

function useDashboardForCountry(
  countryCode: string,
  mainIndicatorId: number,
) {
  const seeded = useMemo(() => {
    const cache = dashboardCaches[mainIndicatorId];
    return cache?.[countryCode] ?? undefined;
  }, [countryCode, mainIndicatorId]);

  return useQuery({
    queryKey: ['countryIndicatorDashboard', countryCode, mainIndicatorId],
    queryFn: () => getCountryIndicatorDashboard(countryCode, mainIndicatorId),
    initialData: seeded,
    initialDataUpdatedAt: 0,
  });
}

interface Props {
  countryInfo: CountriesDataType;
  indicatorMetaData: IndicatorsMetaDataType;
  suffix: string;
}

function DefaultViz({ countryInfo, indicatorMetaData, suffix }: Props) {
  const { data, isLoading, isError } = useDashboardForCountry(
    countryInfo['Alpha-3 code'],
    indicatorMetaData.mainIndicatorId,
  );

  if (isLoading)
    return (
      <div className='my-8'>
        <Spinner size='lg' className='my-20 m-auto' />
      </div>
    );
  if (isError)
    return (
      <div className='px-4 container mx-auto'>
        <ErrorState />
      </div>
    );
  if (data)
    return (
      <Viz
        dashboard={data}
        indicatorMetaData={indicatorMetaData}
        suffix={suffix}
      />
    );
  return;
}

export default DefaultViz;
