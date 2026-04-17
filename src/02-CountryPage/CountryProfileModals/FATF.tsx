/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@undp/design-system-react/Spinner';
import { ExternalLink } from 'lucide-react';
import { Spacer } from '@undp/design-system-react/Spacer';

import { ErrorState } from '@/Components/ErrorState';
import { HeadingText, ParagraphText } from '@/Components/Typography';
import { NoData } from '@/Components/NoData';
import { getFATF } from '@/QueryFn/CountryProfileData/getFATF';
import { useIsMobileBreakpoint } from '@/Utils/useIsMobileBreakpoint';

interface Props {
  isoCode: string;
}

function useDataForCountry() {
  return useQuery({
    queryKey: ['fatf-data'],
    queryFn: getFATF,
  });
}

function FATF({ isoCode }: Props) {
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
    <div className='flex w-full flex-col'>
      <HeadingText
        type='h2'
        marginBottom='lg'
        className='text-[var(--color-text-black)]'
      >
        Financial Action Task Force
      </HeadingText>
      {countryData.length > 0 ? (
        <>
          {!isMobile && (
            <div className='flex border-b-[#000] pb-2 border-b'>
              <ParagraphText
                weight='semibold'
                size='sm'
                marginBottom='none'
                className='text-[var(--color-text-black)] w-[60%]'
              >
                Country
              </ParagraphText>
              <ParagraphText
                weight='semibold'
                size='sm'
                marginBottom='none'
                className='text-[var(--color-text-black)] w-[20%] pr-4'
              >
                FATF Status
              </ParagraphText>
              <ParagraphText
                weight='semibold'
                size='sm'
                marginBottom='none'
                className='text-[var(--color-text-black)] w-[20%]'
              >
                Updated
              </ParagraphText>
            </div>
          )}
          {countryData.map((d: any, i: number) =>
            isMobile ? (
              <div className='py-3 border-b border-b-[#0000004D]' key={i}>
                <ParagraphText
                  weight='medium'
                  size='sm'
                  marginBottom='none'
                  className='text-[var(--color-text-black)]'
                >
                  {d['Country']}
                </ParagraphText>
                <div className='flex items-center gap-2 mt-1'>
                  <ParagraphText
                    weight='regular'
                    size='xs'
                    marginBottom='none'
                    className='text-[var(--color-text-black)] opacity-60'
                  >
                    {d['Classification (Black list, Grey list)']} · {d.Year}
                  </ParagraphText>
                </div>
              </div>
            ) : (
              <div className='flex border-b-[#0000004D] py-3 border-b' key={i}>
                <ParagraphText
                  weight='regular'
                  size='sm'
                  marginBottom='none'
                  className='text-[var(--color-text-black)] w-[60%] pr-4'
                >
                  {d['Country']}
                </ParagraphText>
                <ParagraphText
                  weight='regular'
                  size='sm'
                  marginBottom='none'
                  className='text-[var(--color-text-black)] w-[20%]'
                >
                  {d['Classification (Black list, Grey list)']}
                </ParagraphText>
                <ParagraphText
                  weight='regular'
                  size='sm'
                  marginBottom='none'
                  className='text-[var(--color-text-black)] w-[20%]'
                >
                  {d.Year}
                </ParagraphText>
              </div>
            ),
          )}
        </>
      ) : (
        <div className='my-8'>
          <NoData isBgWhite />
        </div>
      )}
      <Spacer size='2xl' />
      <div className='p-6 bg-[#4B6E911A] rounded-[8px] border border-[#4B6E9180]'>
        <ParagraphText
          weight='bold'
          marginBottom='none'
          className='text-[var(--color-text-black)]'
        >
          What does it mean?
        </ParagraphText>
        <Spacer size='xl' />
        <ParagraphText
          marginBottom='none'
          className='text-[var(--color-text-black)]'
        >
          ATF publicly flags countries in two ways. The “black list” (formally,
          High-Risk Jurisdictions subject to a Call for Action) names countries
          with significant strategic AML/CFT deficiencies and triggers calls for
          enhanced due diligence and, in the most severe cases,
          counter-measures. The “grey list” (formally, Jurisdictions under
          Increased Monitoring) covers countries that have identified
          deficiencies but are working with FATF on time-bound action plans and
          are therefore subject to closer monitoring. FATF updates these lists
          about three times a year and explains the review process overseen by
          its ICRG.
        </ParagraphText>
        <Spacer size='xl' />
        <a
          href='https://www.fatf-gafi.org/en/countries/black-and-grey-lists.html'
          target='_blank'
          className='text-[var(--color-text-black)] flex gap-2 items-start'
        >
          <ParagraphText
            marginBottom='none'
            weight='bold'
            className='text-[var(--color-text-black)] border-b border-[#4B6E9180] border-b-[2px]'
          >
            Learn more
          </ParagraphText>
          <ExternalLink
            width={20}
            height={20}
            strokeWidth={1.5}
            stroke='#000'
          />
        </a>
      </div>
    </div>
  );
}

export default FATF;
