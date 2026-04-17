"""
Fetch CountryIndicatorDashboard for all countries and a given mainIndicatorId.
Writes results to src/static/cache/countryDashboard_{mainIndicatorId}.json

Usage:
    python3 scripts/fetch_country_dashboard.py 1
    python3 scripts/fetch_country_dashboard.py 2

Rules:
    - DELAY between requests to avoid rate limiting
    - Sequential (no parallelism) — parallel requests cause API timeouts
    - Retry once on error before skipping
"""

import json
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

BASE = "https://app.anti-corruption.org/api"
DELAY = 0.3  # seconds between requests


def fetch(url: str):
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f"  ERROR {url}: {e}")
        return None


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/fetch_country_dashboard.py <mainIndicatorId>")
        sys.exit(1)

    main_indicator_id = int(sys.argv[1])

    # Load countries list from static cache
    countries_path = Path("src/static/countriesList.json")
    with open(countries_path) as f:
        countries_raw = json.load(f)

    countries = [c["countryCode"] for c in countries_raw]
    print(f"Fetching {len(countries)} countries for mainIndicatorId={main_indicator_id}")

    out_path = Path(f"src/static/cache/countryDashboard_{main_indicator_id}.json")
    # Load existing results to allow resuming
    results = {}
    if out_path.exists():
        with open(out_path) as f:
            try:
                results = json.load(f)
            except json.JSONDecodeError:
                results = {}

    skipped = 0
    fetched = 0
    errors = 0

    for i, country in enumerate(countries):
        if country in results:
            print(f"  {i+1}/{len(countries)} {country} (cached, skipping)")
            continue

        url = f"{BASE}/CountryIndicatorDashboard/{country}/{main_indicator_id}"
        data = fetch(url)

        if data is None:
            print(f"  {i+1}/{len(countries)} {country} → retry...")
            time.sleep(1.0)
            data = fetch(url)

        if data is not None:
            results[country] = data
            fetched += 1
            print(f"  {i+1}/{len(countries)} {country} ✓")
        else:
            skipped += 1
            print(f"  {i+1}/{len(countries)} {country} ✗ SKIPPED")

        # Save incrementally every 10 countries
        if fetched % 10 == 0 and fetched > 0:
            with open(out_path, "w") as f:
                json.dump(results, f)

        time.sleep(DELAY)

    with open(out_path, "w") as f:
        json.dump(results, f)

    print(f"\nDone. fetched={fetched}, skipped={skipped}, errors={errors}")
    print(f"Output: {out_path} ({len(results)} countries)")


if __name__ == "__main__":
    main()
