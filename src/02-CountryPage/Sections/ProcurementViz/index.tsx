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
import { getRegionList } from '@/QueryFn/getRegionList';
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

function useDataForCountry(countryCode: string, mainIndicatorId: number) {
  const seeded = useMemo(() => {
    const cache = dashboardCaches[mainIndicatorId];
    return cache?.[countryCode] ?? undefined;
  }, [countryCode, mainIndicatorId]);

  const dashboard = useQuery({
    queryKey: ['countryIndicatorDashboard', countryCode, mainIndicatorId],
    queryFn: () => getCountryIndicatorDashboard(countryCode, mainIndicatorId),
    initialData: seeded,
    initialDataUpdatedAt: 0,
  });

  const regionList = useQuery({
    queryKey: ['regionList', countryCode],
    queryFn: () => getRegionList(countryCode),
  });

  return { dashboard, regionList };
}

interface Props {
  countryInfo: CountriesDataType;
  indicatorMetaData: IndicatorsMetaDataType;
  suffix: string;
}

function ProcurementViz({ countryInfo, indicatorMetaData, suffix }: Props) {
  const { dashboard, regionList } = useDataForCountry(
    countryInfo['Alpha-3 code'],
    indicatorMetaData.mainIndicatorId,
  );

  const isLoading = dashboard.isLoading || regionList.isLoading;
  const isError = dashboard.isError || regionList.isError;

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
  if (dashboard.data && regionList.data)
    return (
      <Viz
        dashboard={dashboard.data}
        regionList={regionList.data}
        indicatorMetaData={indicatorMetaData}
        suffix={suffix}
        countryCode={countryInfo['Alpha-3 code']}
      />
    );
  return;
}

export default ProcurementViz;
