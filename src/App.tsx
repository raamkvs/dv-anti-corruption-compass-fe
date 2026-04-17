import '@/styles/fonts.css';
import '@/styles/style.css';
import {
  Outlet,
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
  Link,
} from '@tanstack/react-router';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { Spinner } from '@undp/design-system-react/Spinner';
import { getCountryDetailsFromISO3 } from '@undp-data/data-utils';
import { createContext, useContext } from 'react';
import { Spacer } from '@undp/design-system-react/Spacer';

import Homepage from './01-Homepage';
import MethodologyPage from './04-Methodology';
import AboutUsPage from './05-AboutUs';
import { Header } from './Components/Header';
import { Footer } from './Components/Footer';
import CountryPageEl from './02-CountryPage';
import { ScrollToTop } from './Utils/ScrollToTop';
import {
  CountriesDataType,
  CountriesFromApiDataType,
  IndicatorsMetaDataType,
} from './Types';
import { ErrorState } from './Components/ErrorState';
import MainIndicatorPageEl from './03-MainIndicator';
import { getIndicatorsMetaData } from './QueryFn/getIndicatorsMetaData';
import { getCountriesList } from './QueryFn/getCountriesList';
import { HeadingText, ParagraphText } from './Components/Typography';
import { Button } from './Components/Button';
import { startTimeline, logTimelinePhase } from './logging/loadTimeLogger';
import { useIsMobileBreakpoint } from './Utils/useIsMobileBreakpoint';
import { MobileHomepage } from './01-Homepage/MobileHomepage';
import { MobileMainIndicatorPage } from './03-MainIndicator/MobileMainIndicatorPage';
import { MobileCountryPage } from './02-CountryPage/MobileCountryPage';
import { MobileCountriesListing } from './02-CountryPage/MobileCountriesListing';
import { MobileMethodologyPage } from './04-Methodology/MobileMethodologyPage';
import { MobileAboutUsPage } from './05-AboutUs/MobileAboutUsPage';
import { DataSourcesDebugPage } from './Debug/DataSourcesDebugPage';

import staticCountriesList from '@/static/countriesList.json';
import staticIndicatorsMetaData from '@/static/indicatorsMetaData.json';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

function useGlobalData() {
  const indicatorsMetaData = useQuery({
    queryKey: ['indicatorsMetaData'],
    queryFn: getIndicatorsMetaData,
    initialData: staticIndicatorsMetaData,
    // Force React Query to treat the bundled data as stale so it refetches
    // and swaps in the latest `/api/Indicators` response immediately.
    initialDataUpdatedAt: 0,
    select: data =>
      data.map((c: IndicatorsMetaDataType) => ({
        ...c,
        subIndicators: c.subIndicators.map(d => ({
          ...d,
          id: `${d.mainIndicatorId}_${d.subIndicatorId}`,
        })),
      })),
  });
  const countriesList = useQuery({
    queryKey: ['countriesList'],
    queryFn: getCountriesList,
    // Seed immediately from bundled JSON to avoid showing a long loading
    // state on the country insights section (country selector + table).
    initialData: staticCountriesList as unknown as CountriesFromApiDataType[],
    initialDataUpdatedAt: 0,
    select: countries =>
      countries
        .map((c: CountriesFromApiDataType) =>
          getCountryDetailsFromISO3(c.countryCode),
        )
        .filter((c?: CountriesDataType) => c !== undefined),
  });
  return { indicatorsMetaData, countriesList };
}

type GlobalDataContextType = {
  indicatorsMetaData: IndicatorsMetaDataType[];
  countriesListData: CountriesDataType[];
  countriesListLoading: boolean;
  countriesListError: boolean;
};

const GlobalDataContext = createContext<GlobalDataContextType | null>(null);

export function useGlobalDataContext() {
  const ctx = useContext(GlobalDataContext);
  if (!ctx)
    throw new Error('useGlobalDataContext must be used inside provider');
  return ctx;
}

function RootComponent() {
  startTimeline('Homepage route render');
  logTimelinePhase('RootComponent render start');
  const { indicatorsMetaData, countriesList } = useGlobalData();
  const isMobile = useIsMobileBreakpoint();

  const isLoading = indicatorsMetaData.isLoading;
  const isError = indicatorsMetaData.isError;

  if (isLoading) {
    logTimelinePhase('RootComponent loading global data');
    return <Spinner size='lg' className='my-20 m-auto' />;
  }
  if (isError) {
    logTimelinePhase('RootComponent error state');
    return (
      <div className='px-4 container mx-auto'>
        <ErrorState />
      </div>
    );
  }

  return (
    <GlobalDataContext.Provider
      value={{
        indicatorsMetaData: indicatorsMetaData.data || [],
        countriesListData: countriesList.data || [],
        countriesListLoading: countriesList.isLoading,
        countriesListError: countriesList.isError,
      }}
    >
      <div
        className={`min-h-screen flex flex-col background-inherit ${
          isMobile ? 'mobileApp' : ''
        }`}
      >
        <Header
          indicatorsMetaData={indicatorsMetaData.data || []}
          countriesListData={countriesList.data || []}
          countriesListDataLoading={countriesList.isLoading}
          countriesListDataError={countriesList.isError}
        />
        <main className='flex-1'>
          <ScrollToTop />
          <Outlet />
        </main>
        <div className='print-hide relative z-10 px-4 lg:px-20'>
          <div
            style={{
              background:
                'linear-gradient(97.48deg, #17232B -5.56%, #4E7691 156.23%)',
              boxShadow:
                '0 5px 60px 0 var(--tw-shadow-color, rgba(0,0,0,0.20))',
            }}
            className='px-8 !py-[80px] rounded-[8px] flex items-center justify-center flex-col gap-8 w-full mt-16'
          >
            <HeadingText type='h2'>Have feedback for us?</HeadingText>
            <ParagraphText>
              Send us an email at anti-corruption@undp.org
            </ParagraphText>
            <a href='mailto:anti-corruption@undp.org'>
              <Button variant='secondary'>Send email</Button>
            </a>
          </div>
        </div>
        <div className='print-hide'>
          <Spacer size='7xl' />
        </div>
        <div className='print-hide'>
          <Footer
            indicatorsMetaData={indicatorsMetaData.data}
            indicatorsMetaDataLoading={indicatorsMetaData.isLoading}
          />
        </div>
      </div>
    </GlobalDataContext.Provider>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    const {
      indicatorsMetaData,
      countriesListData,
      countriesListLoading,
      countriesListError,
    } = useGlobalDataContext();
    const isMobile = useIsMobileBreakpoint();
    const pageProps = {
      indicatorsMetaData: indicatorsMetaData.filter(d => !d.comingSoon),
      countriesList: countriesListData || [],
      countriesListLoading,
      countriesListError,
    };
    return isMobile ? (
      <MobileHomepage {...pageProps} />
    ) : (
      <Homepage {...pageProps} />
    );
  },
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: function About() {
    const isMobile = useIsMobileBreakpoint();
    return isMobile ? <MobileAboutUsPage /> : <AboutUsPage />;
  },
});

const methodologyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/methodology',
  component: function Methodology() {
    const isMobile = useIsMobileBreakpoint();
    return isMobile ? <MobileMethodologyPage /> : <MethodologyPage />;
  },
});

function MainIndicator() {
  const {
    indicatorsMetaData,
    countriesListData,
    countriesListLoading,
    countriesListError,
  } = useGlobalDataContext();
  const isMobile = useIsMobileBreakpoint();
  const { indicator } = mainIndicatorRoute.useParams();

  const indicatorMetaData = indicatorsMetaData.find(
    d => d.name.replaceAll(' ', '-').toLowerCase() === indicator,
  );
  if (!indicatorMetaData && indicator)
    return (
      <div className='px-4 container mx-auto'>
        The indicator you are trying to search does not exist
      </div>
    );

  const pageProps = {
    indicatorMetaData: indicatorMetaData || indicatorsMetaData[0],
    countriesListDataLoading: countriesListLoading,
    countriesListDataError: countriesListError,
    countriesList: countriesListData || [],
  };

  return isMobile ? (
    <MobileMainIndicatorPage {...pageProps} />
  ) : (
    <MainIndicatorPageEl {...pageProps} />
  );
}

const mainIndicatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/main-indicators/{-$indicator}',
  component: MainIndicator,
});

function Country() {
  const { isoCode, indicator } = countryRoute.useParams();
  const {
    indicatorsMetaData,
    countriesListData,
    countriesListLoading,
    countriesListError,
  } = useGlobalDataContext();
  const isMobile = useIsMobileBreakpoint();

  const indicatorMetaData = indicatorsMetaData.find(
    d => d.name.replaceAll(' ', '-').toLowerCase() === indicator,
  );
  if (countriesListLoading)
    return <Spinner size='lg' className='my-20 m-auto' />;
  if (countriesListError)
    return (
      <div className='px-4 container mx-auto'>
        <ErrorState />
      </div>
    );
  const pageProps = {
    isoCode,
    countriesList: countriesListData || [],
    indicatorsMetaData,
    selectedIndicator: (indicatorMetaData || 'country-profile') as
      | IndicatorsMetaDataType
      | 'country-profile',
  };

  return isMobile ? (
    <MobileCountryPage {...pageProps} />
  ) : (
    <CountryPageEl {...pageProps} />
  );
}

function CountriesListing() {
  const { countriesListData, countriesListLoading, countriesListError } =
    useGlobalDataContext();
  const isMobile = useIsMobileBreakpoint();
  if (countriesListLoading)
    return <Spinner size='lg' className='my-20 m-auto' />;
  if (countriesListError)
    return (
      <div className='px-4 container mx-auto'>
        <ErrorState />
      </div>
    );

  const alphabets = [
    ...new Set(
      countriesListData.map(d =>
        d['Country or Area (official name)'][0].toUpperCase(),
      ),
    ),
  ];
  if (isMobile) {
    return (
      <MobileCountriesListing
        countriesListData={countriesListData}
        alphabets={alphabets}
      />
    );
  }

  return (
    <div className='container mx-auto'>
      <Spacer size='7xl' />
      <HeadingText type='h2'>Country profile</HeadingText>
      <Spacer size='6xl' />
      {alphabets.map((d, i) => (
        <div key={i}>
          <HeadingText type='h2'>{d}</HeadingText>
          <Spacer size='2xl' />
          <div className='flex flex-wrap gap-4'>
            {countriesListData
              .filter(
                el =>
                  el['Country or Area (official name)'][0].toUpperCase() === d,
              )
              .map((el, j) => (
                <Link
                  to='/countries/$isoCode/{-$indicator}'
                  params={{ isoCode: el['Alpha-3 code'] }}
                  className='poppins-medium w-[calc(25%-0.75rem)] !text-[16px] text-[#fff]'
                  key={j}
                >
                  {el['Country or Area (official name)']}
                </Link>
              ))}
          </div>
          <Spacer size='6xl' />
        </div>
      ))}
    </div>
  );
}
const countriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/countries',
  component: CountriesListing,
});

const dataSourcesDebugRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/debug/data-sources',
  component: DataSourcesDebugPage,
});

const countryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/countries/$isoCode/{-$indicator}',
  component: Country,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  methodologyRoute,
  mainIndicatorRoute,
  countryRoute,
  countriesRoute,
  dataSourcesDebugRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
