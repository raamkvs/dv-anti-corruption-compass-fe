# Data loading and payload size

## Summary

Slow initial load is likely caused by **large Facts API payloads**. All Facts requests use `pageSize=10000`, and one call fetches **all countries and all indicators** with no filters.

## Where the size comes from

| Call                       | File                           | Filters                                                   | Risk                                                       |
| -------------------------- | ------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------- |
| **getAllCountriesAllData** | `getAllCountriesAllData.ts`    | None (`regionId=null`, `productMarketId=null` only)       | **Highest** – used on homepage; one request for all facts. |
| getIndicatorData           | `getIndicatorData.ts`          | `mainIndicatorId`                                         | High – up to 10k rows per indicator.                       |
| getCountryData             | `getCountryData.ts`            | `countryCode`, `mainIndicatorId`                          | Medium.                                                    |
| getRegionalDataForCountry  | `getRegionalDataForCountry.ts` | country, subIndicator, year, productMarket, mainIndicator | Lower – now uses smaller page size (1000).                 |

## How to confirm

1. **Dev logging**  
   In development, the app logs each Facts response size to the console, e.g.  
   `[Facts API] getAllCountriesAllData (homepage): 8500 items, ~2.10 MB`

2. **Network tab**  
   In DevTools → Network, filter by “Facts” or the API host and check:
   - Size of the Facts responses
   - Which request (e.g. homepage) is largest and slowest

## Tunables

- **`FACTS_API_PAGE_SIZE`** in `src/Constants.ts` – used for “all data”, indicator, and country Facts (default 10000). Reducing it shrinks payloads but may truncate data if the API returns more rows than this.
- **`FACTS_API_PAGE_SIZE_SMALL`** – used for regional Facts (default 1000).

## Recommended next steps

1. Run the app in dev and note the `[Facts API]` log sizes to confirm which call is biggest.
2. **Backend**: Ask if the Facts API supports:
   - **Pagination** (e.g. `pageNumber` + `pageSize`) so the frontend can request pages and merge.
   - A **summary/aggregate** endpoint for the homepage (e.g. one row per country/indicator/year) to avoid loading full fact rows.
   - **Field selection** (e.g. `?fields=countryCode,year,mainIndicatorId,...`) to return only needed fields.
3. If the backend supports pagination, implement multi-page fetching in the query functions and keep a single `pageSize` (e.g. 1000–2000) per request.
