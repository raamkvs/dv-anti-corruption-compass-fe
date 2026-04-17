/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@undp/design-system-react/Spinner';
import { ExternalLink } from 'lucide-react';

import { ErrorState } from '@/Components/ErrorState';
import { HeadingText, ParagraphText } from '@/Components/Typography';
import { getAntiCorruptionStrategies } from '@/QueryFn/CountryProfileData/getAntiCorruptionStrategies';
import { NoData } from '@/Components/NoData';
import { useIsMobileBreakpoint } from '@/Utils/useIsMobileBreakpoint';

interface Props {
  isoCode: string;
}

function useDataForCountry() {
  return useQuery({
    queryKey: ['anti-corruption-strategies-data'],
    queryFn: getAntiCorruptionStrategies,
  });
}

function AntiCorruptionStrategies({ isoCode }: Props) {
  const isMobile = useIsMobileBreakpoint();
  const { data, isError, isLoading } = useDataForCountry();
  if (isLoading) return <Spinner size='lg' className='my-20 m-auto' />;
  if (isError)
    return (
      <div className='px-4 container mx-auto'>
        <ErrorState />
      </div>
    );
  const countryData = (data as any).filter((d: any) => d.ISO3_Code === isoCode);
  return (
    <div className='flex w-full flex-col gap-0'>
      <HeadingText
        type='h2'
        marginBottom='lg'
        className='text-[var(--color-text-black)]'
      >
        Anti-corruption strategies
      </HeadingText>

      {countryData.length > 0 ? (
        <>
          {!isMobile && (
            <div className='flex border-b-[#000] pb-2 border-b'>
              <ParagraphText
                weight='semibold'
                size='sm'
                marginBottom='none'
                className='text-[var(--color-text-black)] w-[50%]'
              >
                Name
              </ParagraphText>
              <ParagraphText
                weight='semibold'
                size='sm'
                marginBottom='none'
                className='text-[var(--color-text-black)] w-[20%] pr-4'
              >
                Coverage period
              </ParagraphText>
              <ParagraphText
                weight='semibold'
                size='sm'
                marginBottom='none'
                className='text-[var(--color-text-black)] w-[20%]'
              >
                Availability
              </ParagraphText>
              <ParagraphText
                weight='semibold'
                size='sm'
                marginBottom='none'
                className='text-[var(--color-text-black)] w-[10%]'
              >
                Link
              </ParagraphText>
            </div>
          )}
          {countryData.map((d: any, i: number) =>
            isMobile ? (
              <div className='py-3 border-b border-b-[#0000004D]' key={i}>
                <div className='flex items-start justify-between gap-2'>
                  <ParagraphText
                    weight='medium'
                    size='sm'
                    marginBottom='none'
                    className='text-[var(--color-text-black)]'
                  >
                    {d['Name of Strategy']}
                  </ParagraphText>
                  <a href={d.Link} target='_blank' className='shrink-0'>
                    <ExternalLink
                      width={18}
                      height={18}
                      strokeWidth={1.5}
                      stroke='#000'
                    />
                  </a>
                </div>
                <div className='flex items-center gap-2 mt-2 flex-wrap'>
                  <ParagraphText
                    weight='regular'
                    size='xs'
                    marginBottom='none'
                    className='text-[var(--color-text-black)] opacity-60'
                  >
                    {d['Coverage period'] || '-'} ·{' '}
                    {d['Is strategy available (Yes, No)']}
                  </ParagraphText>
                </div>
              </div>
            ) : (
              <div className='flex border-b-[#0000004D] py-3 border-b' key={i}>
                <ParagraphText
                  weight='regular'
                  size='sm'
                  marginBottom='none'
                  className='text-[var(--color-text-black)] w-[50%] pr-4'
                >
                  {d['Name of Strategy']}
                </ParagraphText>
                <ParagraphText
                  weight='regular'
                  size='sm'
                  marginBottom='none'
                  className='text-[var(--color-text-black)] w-[20%]'
                >
                  {d['Coverage period'] || '-'}
                </ParagraphText>
                <ParagraphText
                  weight='regular'
                  size='sm'
                  marginBottom='none'
                  className='text-[var(--color-text-black)] w-[20%]'
                >
                  {d['Is strategy available (Yes, No)']}
                </ParagraphText>
                <a
                  href={d.Link}
                  target='_blank'
                  className='text-[var(--color-text-black)] w-[10%]'
                >
                  <ExternalLink
                    width={20}
                    height={20}
                    strokeWidth={1.5}
                    stroke='#000'
                  />
                </a>
              </div>
            ),
          )}
        </>
      ) : (
        <div className='my-8'>
          <NoData isBgWhite />
        </div>
      )}
    </div>
  );
}

export default AntiCorruptionStrategies;
