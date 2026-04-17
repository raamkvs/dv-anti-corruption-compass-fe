/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@undp/design-system-react/Spinner';
import { Spacer } from '@undp/design-system-react';
import { BulletChart } from '@undp/data-viz/BulletChart';
import { SimpleLineChart } from '@undp/data-viz/SimpleLineChart';

import { ErrorState } from '@/Components/ErrorState';
import { HeadingText, ParagraphText } from '@/Components/Typography';
import { NoData } from '@/Components/NoData';
import { getGloballyAvailableIndicators } from '@/QueryFn/CountryProfileData/getGloballyAvailableIndicators';
import { getSdg16Data } from '@/QueryFn/CountryProfileData/getSdg16Data';

interface Props {
  isoCode: string;
}

function useDataForCountry() {
  const globallyAvailableData = useQuery({
    queryKey: ['globally-available-indicators'],
    queryFn: getGloballyAvailableIndicators,
  });
  const sdg16Data = useQuery({
    queryKey: ['sdg16-data'],
    queryFn: getSdg16Data,
  });
  return { globallyAvailableData, sdg16Data };
}

function GloballyAvailableData({ isoCode }: Props) {
  const { globallyAvailableData, sdg16Data } = useDataForCountry();
  if (globallyAvailableData.isLoading || sdg16Data.isLoading)
    return <Spinner size='lg' className='my-20 m-auto' />;
  if (sdg16Data.isError || globallyAvailableData.isError)
    return (
      <div className='px-4 container mx-auto'>
        <ErrorState />
      </div>
    );
  const globallyAvailableCountryData = (
    globallyAvailableData.data as any
  ).filter((d: any) => d.ISO3_code === isoCode);
  const cggiData = globallyAvailableCountryData
    .filter(
      (d: any) => d['Name of Indicator'] === 'Chandler Good Government Index',
    )
    .sort((a: any, b: any) => a.Year - b.Year);
  const cpiData = globallyAvailableCountryData
    .filter(
      (d: any) =>
        d['Name of Indicator'] === 'Corruption Perception Index (CPI)',
    )
    .sort((a: any, b: any) => a.Year - b.Year);
  const iiagData = globallyAvailableCountryData
    .filter(
      (d: any) =>
        d['Name of Indicator'] === 'Ibrahim Index of African Governance',
    )
    .sort((a: any, b: any) => a.Year - b.Year);
  const wgiComponents = [
    ...new Set(
      globallyAvailableCountryData
        .filter(
          (d: any) => d['Name of Indicator'] === 'World Governance Indicator',
        )
        .map((d: any) => d['Sub indicator']),
    ),
  ];
  const wgiData = wgiComponents.map((d: any) => ({
    component: d as string,
    data: globallyAvailableCountryData
      .filter(
        (el: any) =>
          el['Sub indicator'] === d &&
          el['Name of Indicator'] === 'World Governance Indicator',
      )
      .sort((a: any, b: any) => a.Year - b.Year),
  }));

  const sdg16CountryData = (sdg16Data.data as any).filter(
    (d: any) => d.ISO3_code === isoCode,
  );
  const sdg16Components = [
    ...new Set(sdg16CountryData.map((d: any) => d.Indicator)),
  ];
  const sdg16CountryDataFormatted = sdg16Components
    .map((d: any) => ({
      component: d as string,
      data: sdg16CountryData
        .filter((el: any) => el.Indicator === d)
        .sort((a: any, b: any) => a.Year - b.Year),
    }))
    .filter(d => d.data.length > 0);
  return (
    <div className='flex w-full flex-col'>
      <HeadingText
        type='h2'
        marginBottom='lg'
        className='text-[var(--color-text-black)]'
      >
        Globally Available Indicators
      </HeadingText>
      {globallyAvailableCountryData.length > 0 &&
      sdg16CountryData.length > 0 ? (
        <>
          <div className='flex gap-4 flex-wrap'>
            <div className='w-full lg:w-[calc(50%-0.5rem)] border-1 border-[#4373904D] p-4 lg:p-5 rounded-[8px]!'>
              <BulletChart
                showValues={false}
                maxBarThickness={64}
                leftMargin={40}
                graphTitle={
                  <>
                    <ParagraphText
                      weight='regular'
                      className='text-[var(--color-text-black)]'
                    >
                      Chandler Good Government Index
                    </ParagraphText>
                    <Spacer size='sm' />
                    <div className='flex gap-2 items-center'>
                      <ParagraphText
                        marginBottom='none'
                        className='text-[36px] text-[var(--color-text-black)]'
                      >
                        {cggiData[cggiData.length - 1]?.Ranking}
                      </ParagraphText>
                      <ParagraphText
                        marginBottom='none'
                        size='xs'
                        className='poppins-regular py-1 px-2 rounded-[4px] text-[var(--color-text-black)] bg-[#4373901A]'
                      >
                        {cggiData[cggiData.length - 1]?.Year}
                      </ParagraphText>
                    </div>
                  </>
                }
                targetLineThickness={4}
                targetColor='#437390'
                qualitativeRangeColors={['#9FBCCE4D']}
                data={cggiData
                  .filter((d: any) => d.Ranking)
                  .map((d: any) => ({
                    label: d.Year,
                    size: 0,
                    target: parseInt(d.Ranking.split('/')[0], 10),
                    qualitativeRange: [parseInt(d.Ranking.split('/')[1], 10)],
                  }))}
                height={420}
                footNote={`Source: ${cggiData[0]?.['Organization']}`}
                classNames={{
                  xAxis: { labels: 'text-[var(--color-text-black)]' },
                }}
              />
            </div>
            <div className='w-full lg:w-[calc(50%-0.5rem)] border-1 border-[#4373904D] p-4 rounded-[8px]!'>
              <BulletChart
                graphTitle={
                  <>
                    <ParagraphText
                      weight='regular'
                      className='text-[var(--color-text-black)]'
                    >
                      Corruption Perception Index (CPI)
                    </ParagraphText>
                    <Spacer size='sm' />
                    <div className='flex gap-2 items-center'>
                      <ParagraphText
                        marginBottom='none'
                        className='text-[36px] text-[var(--color-text-black)]'
                      >
                        {cpiData[cpiData.length - 1]?.Ranking}
                      </ParagraphText>
                      <ParagraphText
                        marginBottom='none'
                        size='xs'
                        className='poppins-regular py-1 px-2 rounded-[4px] text-[var(--color-text-black)] bg-[#4373901A]'
                      >
                        {cpiData[cpiData.length - 1]?.Year}
                      </ParagraphText>
                    </div>
                  </>
                }
                showValues={false}
                maxBarThickness={64}
                leftMargin={40}
                targetLineThickness={4}
                targetColor='#437390'
                qualitativeRangeColors={['#9FBCCE4D']}
                height={420}
                classNames={{
                  xAxis: { labels: 'text-[var(--color-text-black)]' },
                }}
                data={cpiData
                  .filter((d: any) => d.Ranking)
                  .map((d: any) => ({
                    label: d.Year,
                    size: 0,
                    target: parseInt(d.Ranking.split('/')[0], 10),
                    qualitativeRange: [parseInt(d.Ranking.split('/')[1], 10)],
                  }))}
                footNote={`Source: ${cpiData[0]?.['Organization']}`}
              />
            </div>
            {iiagData.length > 0 && (
              <div className='w-full lg:w-[calc(50%-0.5rem)] border-1 border-[#4373904D] p-4 lg:p-5 rounded-[8px]!'>
                <SimpleLineChart
                  showValues={false}
                  graphTitle={
                    <>
                      <ParagraphText
                        weight='regular'
                        className='text-[var(--color-text-black)]'
                      >
                        Ibrahim Index of African Governance
                      </ParagraphText>
                      <Spacer size='sm' />
                      <div className='flex gap-2 items-center'>
                        <ParagraphText
                          marginBottom='none'
                          className='text-[36px] text-[var(--color-text-black)]'
                        >
                          {iiagData[iiagData.length - 1]?.Score}
                        </ParagraphText>
                        <ParagraphText
                          marginBottom='none'
                          size='xs'
                          className='poppins-regular py-1 px-2 rounded-[4px] text-[var(--color-text-black)] bg-[#4373901A]'
                        >
                          {iiagData[iiagData.length - 1]?.Year}
                        </ParagraphText>
                      </div>
                    </>
                  }
                  lineColor='#437390'
                  showDots
                  noOfXTicks={5}
                  height={420}
                  data={iiagData
                    .filter((d: any) => d.Score)
                    .map((d: any) => ({
                      date: d.Year,
                      y: d.Score,
                    }))}
                  footNote={`Source: ${iiagData[0]?.['Organization']}`}
                />
              </div>
            )}
            {wgiData.length > 0 && (
              <div className='w-full border-1 border-[#4373904D] p-5 rounded-[8px]!'>
                <ParagraphText
                  weight='semibold'
                  marginBottom='sm'
                  className='text-[var(--color-text-black)] w-full'
                >
                  World Governance Indicator
                </ParagraphText>
                <div className='w-full gap-6 gap-y-8 flex flex-wrap'>
                  {wgiData.map((componentData, i: number) => (
                    <div className='w-full lg:w-[calc(50%-12px)]' key={i}>
                      <SimpleLineChart
                        graphTitle={
                          <>
                            <ParagraphText className='text-[var(--color-text-black)]'>
                              {componentData.component}
                            </ParagraphText>
                            <Spacer size='sm' />

                            <div className='flex gap-2 items-center'>
                              <ParagraphText
                                marginBottom='none'
                                className='text-[36px] text-[var(--color-text-black)]'
                              >
                                {componentData.data[
                                  componentData.data.length - 1
                                ]?.['Sub-componentValue'].toFixed(2)}
                              </ParagraphText>
                              <ParagraphText
                                marginBottom='none'
                                size='xs'
                                className='poppins-regular py-1 px-2 rounded-[4px] text-[var(--color-text-black)] bg-[#4373901A]'
                              >
                                {
                                  componentData.data[
                                    componentData.data.length - 1
                                  ]?.Year
                                }
                              </ParagraphText>
                            </div>
                          </>
                        }
                        showValues={false}
                        lineColor='#437390'
                        showDots
                        noOfXTicks={5}
                        height={420}
                        data={componentData.data.map((d: any) => ({
                          date: d.Year,
                          y: d['Sub-componentValue'],
                        }))}
                      />
                    </div>
                  ))}
                  <ParagraphText size='sm' className='text-primary-gray-550'>
                    {wgiData[0].data[0].Organization}
                  </ParagraphText>
                </div>
              </div>
            )}
            {sdg16CountryDataFormatted.length > 0 && (
              <div className='w-full border-1 border-[#4373904D] p-5 rounded-[8px]!'>
                <ParagraphText
                  weight='semibold'
                  marginBottom='sm'
                  className='text-[var(--color-text-black)] w-full'
                >
                  SDG 16 Indicator
                </ParagraphText>
                <div className='w-full gap-6 gap-y-8 flex flex-wrap'>
                  {sdg16CountryDataFormatted.map((componentData, i: number) => (
                    <div className='w-full lg:w-[calc(50%-12px)]' key={i}>
                      <SimpleLineChart
                        showValues={false}
                        lineColor='#437390'
                        showDots
                        noOfXTicks={5}
                        height={420}
                        data={componentData.data.map((d: any) => ({
                          date: d.Year,
                          y: d.Value,
                        }))}
                        suffix={
                          componentData.data[0].Unit === 'PERCENT' ? '%' : ''
                        }
                        graphTitle={
                          <>
                            <ParagraphText className='text-[var(--color-text-black)]'>
                              {componentData.component}
                            </ParagraphText>
                            <Spacer size='sm' />
                            <div className='flex gap-2 items-center'>
                              <ParagraphText
                                marginBottom='none'
                                className='text-[36px] text-[var(--color-text-black)]'
                              >
                                {
                                  componentData.data[
                                    componentData.data.length - 1
                                  ]?.Value
                                }
                                {componentData.data[0].Unit === 'PERCENT'
                                  ? '%'
                                  : ''}
                              </ParagraphText>
                              <ParagraphText
                                marginBottom='none'
                                size='xs'
                                className='poppins-regular py-1 px-2 rounded-[4px] text-[var(--color-text-black)] bg-[#4373901A]'
                              >
                                {
                                  componentData.data[
                                    componentData.data.length - 1
                                  ]?.Year
                                }
                              </ParagraphText>
                            </div>
                          </>
                        }
                        footNote={`Source: ${componentData.data[0].Source}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className='my-8'>
          <NoData isBgWhite />
        </div>
      )}
    </div>
  );
}

export default GloballyAvailableData;
