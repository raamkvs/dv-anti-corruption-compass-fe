import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@undp/design-system-react/Tabs';

import { PagedDataTableWithFilters } from '../../Components/DataTable/PagedDataTableWithFilters';

import { CountriesDataType, IndicatorsMetaDataType } from '@/Types';
import { CountrySelect } from '@/Components/CountrySelect';

interface Props {
  countriesList: CountriesDataType[];
  indicatorsMetaData: IndicatorsMetaDataType[];
}

const CountryLevelInsight = (props: Props) => {
  const { countriesList, indicatorsMetaData } = props;
  return (
    <div className="flex items-start pt-20 lg:pt-50 w-full bg-cover bg-center bg-no-repeat bg-[url('/imgs/sphere.webp')] px-4 lg:px-20 min-h-[calc(100vh-120px)]">
      <div className='gap-4.5 flex flex-col w-full text-white mx-auto'>
        <Tabs color='blue' defaultValue='tab 1'>
          <TabsList className='mx-0 pl-0 sticky top-[var(--app-header-sticky-offset)] lg:static z-20 bg-transparent py-2 lg:py-0 -mx-4 px-4 lg:mx-0 lg:px-0'>
            <TabsTrigger
              value='tab 1'
              className='text-primary-white! normal-case poppins-medium text-[18px] data-[state=active]:border-[#61D4F8] px-1'
            >
              Find a Country
            </TabsTrigger>
            <TabsTrigger
              value='tab 2'
              className='text-primary-white! normal-case poppins-medium text-[18px] data-[state=active]:border-[#61D4F8] px-1'
            >
              See Full List
            </TabsTrigger>
          </TabsList>
          <TabsContent value='tab 1'>
            <CountrySelect
              countriesList={countriesList || []}
              heading='Uncover detailed anti-corruption data for your country'
              description='Choose a country to reveal its complete anti-corruption profile — from key indicators to institutional strategies'
            />
          </TabsContent>
          <TabsContent value='tab 2'>
            <PagedDataTableWithFilters
              indicatorsMetaData={indicatorsMetaData}
              countriesList={countriesList || []}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CountryLevelInsight;
