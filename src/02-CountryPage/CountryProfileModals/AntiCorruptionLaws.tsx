/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@undp/design-system-react/Spinner';
import { ExternalLink } from 'lucide-react';

import { ErrorState } from '@/Components/ErrorState';
import { HeadingText, ParagraphText } from '@/Components/Typography';
import { getAntiCorruptionLaws } from '@/QueryFn/CountryProfileData/getAntiCorruptionLaws';
import { NoData } from '@/Components/NoData';
import { useIsMobileBreakpoint } from '@/Utils/useIsMobileBreakpoint';

interface Props {
  isoCode: string;
}

function useDataForCountry() {
  return useQuery({
    queryKey: ['anti-corruption-laws-data'],
    queryFn: getAntiCorruptionLaws,
  });
}

function AntiCorruptionLaws({ isoCode }: Props) {
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
        Anti-corruption laws
      </HeadingText>
      {countryData.length > 0 ? (
        <>
          {!isMobile && (
            <div className='flex border-b-[#000] pb-2 border-b'>
              <ParagraphText
                weight='semibold'
                size='sm'
                marginBottom='none'
                className='text-[var(--color-text-black)] w-[40%]'
              >
                Name
              </ParagraphText>
              <ParagraphText
                weight='semibold'
                size='sm'
                marginBottom='none'
                className='text-[var(--color-text-black)] w-[25%] pr-4'
              >
                Category
              </ParagraphText>
              <ParagraphText
                weight='semibold'
                size='sm'
                marginBottom='none'
                className='text-[var(--color-text-black)] w-[10%]'
              >
                Year
              </ParagraphText>
              <ParagraphText
                weight='semibold'
                size='sm'
                marginBottom='none'
                className='text-[var(--color-text-black)] w-[15%]'
              >
                Revision years
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
                    {d.Law}
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
                    className='text-[#4B6E91] p-1 px-2 border-[#4B6E9180] rounded-[4px] bg-[#4B6E911A] border w-fit'
                  >
                    {d.Category}
                  </ParagraphText>
                  <ParagraphText
                    weight='regular'
                    size='xs'
                    marginBottom='none'
                    className='text-[var(--color-text-black)] opacity-60'
                  >
                    {d.Year || '-'} · Rev: {d['Revision Year'] || '-'}
                  </ParagraphText>
                </div>
              </div>
            ) : (
              <div className='flex border-b-[#0000004D] py-3 border-b' key={i}>
                <ParagraphText
                  weight='regular'
                  size='sm'
                  marginBottom='none'
                  className='text-[var(--color-text-black)] w-[40%] pr-4'
                >
                  {d.Law}
                </ParagraphText>
                <div className='w-[25%]'>
                  <ParagraphText
                    weight='regular'
                    size='xs'
                    marginBottom='none'
                    className='text-[#4B6E91] p-1 px-2 border-[#4B6E9180] rounded-[4px] bg-[#4B6E911A] border w-fit'
                  >
                    {d.Category}
                  </ParagraphText>
                </div>
                <ParagraphText
                  weight='regular'
                  size='sm'
                  marginBottom='none'
                  className='text-[var(--color-text-black)] w-[10%]'
                >
                  {d.Year || '-'}
                </ParagraphText>
                <ParagraphText
                  weight='regular'
                  size='sm'
                  marginBottom='none'
                  className='text-[var(--color-text-black)] w-[15%]'
                >
                  {d['Revision Year'] || '-'}
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

export default AntiCorruptionLaws;
