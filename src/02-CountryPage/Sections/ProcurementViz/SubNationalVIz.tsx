import { transformDataForGraph } from '@undp/data-viz/transformData';
import { ChoroplethMap } from '@undp/data-viz/ChoroplethMap';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@undp/design-system-react/Spinner';

import { DataType } from '@/Types';
import { NoData } from '@/Components/NoData';
import { ColorLegend } from '@/Components/ColorLegend';
import { ParagraphText } from '@/Components/Typography';
import { BarChartTable } from '@/Components/BarChartTable';
import { getRegionalDataForCountry } from '@/QueryFn/getRegionalDataForCountry';
import { ErrorState } from '@/Components/ErrorState';

function useRegionalDataForCountry(
  countryCode: string,
  mainIndicatorId: number,
  subIndicatorId: string,
  year: number,
  productMarketId: number | null,
) {
  return useQuery({
    queryKey: [
      'indicator-data',
      countryCode,
      mainIndicatorId,
      subIndicatorId,
      year,
      productMarketId,
    ],
    queryFn: () =>
      getRegionalDataForCountry(
        countryCode,
        mainIndicatorId,
        parseInt(subIndicatorId.split('_')[1], 10),
        year,
        productMarketId,
      ),
    select: data =>
      data.map((d: DataType) => ({
        ...d,
        id: `${d.mainIndicatorId}_${d.subIndicatorId}`,
      })),
  });
}

interface Props {
  mainIndicatorId: number;
  regionList: {
    regionId: number;
    name: string;
  }[];
  countryCode: string;
  productMarketId: number | null;
  year: number;
  subIndicatorId: string;
  colors: string;
  mainColor: string;
  contractValue: string;
  suffix: string;
  maxValue: number;
}

function SubNationalVIz({
  mainIndicatorId,
  regionList,
  countryCode,
  productMarketId,
  year,
  subIndicatorId,
  colors,
  mainColor,
  contractValue,
  suffix,
  maxValue,
}: Props) {
  const { data, isLoading, isError } = useRegionalDataForCountry(
    countryCode,
    mainIndicatorId,
    subIndicatorId,
    year,
    productMarketId,
  );
  if (isLoading) return <Spinner size='lg' className='my-20 m-auto' />;
  if (isError)
    return (
      <div className='px-4 container mx-auto'>
        <ErrorState />
      </div>
    );
  return (
    <div className='flex dark'>
      {data.filter(
        (d: DataType) =>
          d.regionId !== null && d.contractValue === contractValue,
      ).length > 0 ? (
        <div className='flex gap-4 flex-wrap items-stretch'>
          <div className='basis-full lg:basis-[calc(50%-0.5rem)] flex flex-col min-w-0 lg:min-w-[320px]'>
            <ColorLegend
              size='sm'
              showTitle={false}
              colors={colors.split(',')}
            />
            <ChoroplethMap
              mapData={`https://raw.githubusercontent.com/UNDP-Data/dv-country-geojson/refs/heads/main/ADM1/${countryCode}.json`}
              data={transformDataForGraph(
                data
                  .filter((d: DataType) => d.contractValue === contractValue)
                  .map((d: DataType) => ({
                    ...d,
                    region: regionList.find(el => el.regionId === d.regionId),
                    level:
                      d.numericValue === null || d.numericValue === undefined
                        ? undefined
                        : d.numericValue < 0.33
                          ? 'LOW'
                          : d.numericValue < 0.67
                            ? 'MEDIUM'
                            : 'HIGH',
                  })),
                'choroplethMap',
                [
                  { chartConfigId: 'x', columnId: 'level' },
                  { chartConfigId: 'id', columnId: 'region' },
                ],
              )}
              scaleType='categorical'
              zoomInteraction='noZoom'
              colorDomain={['< 0.33', '0.33 - 0.67', '> 0.67']}
              colors={colors.split(',')}
              showColorScale={false}
              footNote={
                <div>
                  <ParagraphText size='xs' className='opacity-50 poppins-light'>
                    The designations employed and the presentation of material
                    on this map do not imply the expression of any opinion
                    whatsoever on the part of the Secretariat of the United
                    Nations or UNDP concerning the legal status of any country,
                    territory, city or area or its authorities, or concerning
                    the delimitation of its frontiers or boundaries.
                  </ParagraphText>
                </div>
              }
            />
          </div>
          <div className='basis-full lg:basis-[calc(50%-0.5rem)] flex flex-col min-w-0 lg:min-w-[320px]'>
            <BarChartTable
              data={data
                .filter(
                  (d: DataType) =>
                    d.contractValue === contractValue &&
                    regionList.find(el => el.regionId === d.regionId)?.name,
                )
                .map((d: DataType) => ({
                  region:
                    regionList.find(el => el.regionId === d.regionId)?.name ||
                    `${d.regionId}`,
                  value: d.numericValue || 0,
                }))}
              color={mainColor}
              suffix={suffix}
              maxValue={maxValue}
            />
          </div>
        </div>
      ) : (
        <NoData />
      )}
    </div>
  );
}

export default SubNationalVIz;
