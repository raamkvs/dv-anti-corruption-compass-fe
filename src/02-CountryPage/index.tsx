import { Spacer } from '@undp/design-system-react/Spacer';
import { Link } from '@tanstack/react-router';

import CountryProfile from './Sections/CountryProfile';
import ProcurementViz from './Sections/ProcurementViz';
import DefaultViz from './Sections/DefaultViz';
import ComingSoon from './Sections/ComingSoon';

import { CountrySelect } from '@/Components/CountrySelect';
import { CountriesDataType, IndicatorsMetaDataType } from '@/Types';
import { HeadingText, ParagraphText } from '@/Components/Typography';
import { Card } from '@/Components/Card';

interface Props {
  isoCode: string;
  indicatorsMetaData: IndicatorsMetaDataType[];
  countriesList: CountriesDataType[];
  selectedIndicator: IndicatorsMetaDataType | 'country-profile';
}

function CountryPageEl({
  isoCode,
  indicatorsMetaData,
  countriesList,
  selectedIndicator,
}: Props) {
  const countryInfo = countriesList.find(d => d['Alpha-3 code'] === isoCode);
  if (!countryInfo) {
    return (
      <div className='px-4 container mx-auto'>
        <CountrySelect
          countriesList={countriesList}
          heading="We don't have the data for the selected country"
          description='Please select a country from the dropdown below'
        />
      </div>
    );
  }
  return (
    <div className='flex flex-col container mx-auto px-4 lg:px-0'>
      <div className='flex items-center justify-center gap-1 flex-col mt-8 lg:mt-16 mb-0 w-full'>
        <img
          alt='Country flag'
          className='w-11 mb-2'
          src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${countryInfo?.['Alpha-2 code']}.svg`}
        />
        <HeadingText type='h1' alignment='center' className='break-words max-w-full px-2 lg:px-0'>
          {countryInfo['Country or Area (official name)']}
        </HeadingText>
        <ParagraphText size='sm' alignment='center' className='w-full px-2 lg:px-0 mt-1'>
          {countryInfo?.['Group 1']} | {countryInfo?.['Group 2']}
        </ParagraphText>
        <Spacer size='2xl' />
        {selectedIndicator !== 'country-profile' ? (
          <>
            <HeadingText type='h2'>{selectedIndicator.name}</HeadingText>
            {selectedIndicator.comingSoon === true ? (
              <ComingSoon />
            ) : selectedIndicator.mainIndicatorId === 1 ? (
              <ProcurementViz
                countryInfo={countryInfo}
                indicatorMetaData={selectedIndicator}
                suffix={selectedIndicator.suffix || ''}
              />
            ) : (
              <DefaultViz
                countryInfo={countryInfo}
                indicatorMetaData={selectedIndicator}
                suffix={selectedIndicator.suffix || ''}
              />
            )}
          </>
        ) : (
          <div className='mx-auto'>
            <HeadingText type='h2' alignment='center'>
              Country profile
            </HeadingText>
            <Spacer size='6xl' />
            <CountryProfile isoCode={isoCode} />
          </div>
        )}
        <div className='w-full mx-auto'>
          <Spacer size='6xl' />
          <div className='w-full'>
            <HeadingText type='h2'>Learn more</HeadingText>
            <Spacer size='2xl' />
            <div className='flex flex-wrap gap-4'>
              {selectedIndicator !== 'country-profile' && (
                <div className='w-full lg:w-[calc(33.33%-0.67rem)] grow-1 min-w-0 lg:min-w-[320px]'>
                  <Link
                    to='/countries/$isoCode/{-$indicator}'
                    params={{
                      isoCode,
                      indicator: 'country-profile',
                    }}
                  >
                    <Card className='pr-4 lg:pr-16 pl-4 lg:pl-6 py-6 lg:py-8 cursor-pointer'>
                      <HeadingText type='h3'>Country profile</HeadingText>
                      <Spacer size='2xl' />
                      <ParagraphText weight='semibold'>
                        Learn More →
                      </ParagraphText>
                    </Card>
                  </Link>
                </div>
              )}
              {indicatorsMetaData
                .filter(d =>
                  selectedIndicator === 'country-profile'
                    ? true
                    : d.mainIndicatorId !== selectedIndicator.mainIndicatorId,
                )
                .map((d, i) => (
                  <div
                    key={i}
                    className='w-full lg:w-[calc(33.33%-0.67rem)] grow-1 min-w-0 lg:min-w-[320px]'
                  >
                    <Link
                      to='/countries/$isoCode/{-$indicator}'
                      params={{
                        isoCode,
                        indicator: d.name.replaceAll(' ', '-').toLowerCase(),
                      }}
                    >
                      <Card className='pr-4 lg:pr-16 pl-4 lg:pl-6 py-6 lg:py-8 cursor-pointer'>
                        <HeadingText type='h3'>{d.name}</HeadingText>
                        <Spacer size='2xl' />
                        <ParagraphText weight='semibold'>
                          Learn More →
                        </ParagraphText>
                      </Card>
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountryPageEl;
