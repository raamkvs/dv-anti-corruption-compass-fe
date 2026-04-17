import { Spacer } from '@undp/design-system-react/Spacer';
import { Spinner } from '@undp/design-system-react/Spinner';

import Overview from './Overview';
import { CountrySelectionSection } from './Components/CountrySelectionSection';
import Viz from './Viz';

import { CountriesDataType, IndicatorsMetaDataType } from '@/Types';
import { ErrorState } from '@/Components/ErrorState';
import { ParagraphText } from '@/Components/Typography';

interface Props {
  indicatorMetaData: IndicatorsMetaDataType;
  countriesList: CountriesDataType[];
  countriesListDataError: boolean;
  countriesListDataLoading: boolean;
}

function MainIndicatorPageEl({
  indicatorMetaData,
  countriesList,
  countriesListDataLoading,
  countriesListDataError,
}: Props) {
  // Loading/error states are managed inside Viz via its own useQuery hooks.
  // This component's role is only layout + overview header.
  if (indicatorMetaData.comingSoon) {
    return (
      <div className='w-full mb-0 flex flex-col gap-4 justify-center items-center'>
        <Overview
          title={indicatorMetaData.name}
          description={indicatorMetaData.description}
          hideDownArrow
        />
        <ParagraphText size='xl' alignment='center' className='w-full mt-6'>
          Data coming soon
        </ParagraphText>
      </div>
    );
  }
  return (
    <>
      <div className='w-full mb-0'>
        <Overview
          title={indicatorMetaData.name}
          description={indicatorMetaData.description}
        />
        <Viz
          indicatorMetaData={indicatorMetaData}
          countriesList={countriesList}
        />
        <Spacer size='6xl' />
        {!countriesListDataError && (
          <CountrySelectionSection
            indicator={indicatorMetaData.name.toLowerCase()}
            countriesList={countriesList || []}
            loading={countriesListDataLoading}
          />
        )}
      </div>
    </>
  );
}

export default MainIndicatorPageEl;
