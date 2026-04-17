"""
Fetch IndicatorSummary for each mainIndicatorId (default year, no filters).
Writes src/static/cache/indicatorSummary_{mainIndicatorId}.json

Usage:
    python3 scripts/fetch_indicator_summary.py         # fetches all indicator ids from indicatorsMetaData.json
    python3 scripts/fetch_indicator_summary.py 1 2     # fetches specific ids

Rules:
    - Sequential, DELAY between requests
    - Retry once on error
"""

import json
import sys
import time
import urllib.request
from pathlib import Path

BASE = "https://app.anti-corruption.org/api"
DELAY = 0.3


def fetch(url: str):
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f"  ERROR {url}: {e}")
        return None


def main():
    # Determine which indicator IDs to fetch
    if len(sys.argv) > 1:
        indicator_ids = [int(x) for x in sys.argv[1:]]
    else:
        meta_path = Path("src/static/indicatorsMetaData.json")
        with open(meta_path) as f:
            meta = json.load(f)
        indicator_ids = [m["mainIndicatorId"] for m in meta if not m.get("comingSoon")]

    print(f"Fetching IndicatorSummary for mainIndicatorIds: {indicator_ids}")

    for main_id in indicator_ids:
        url = f"{BASE}/IndicatorSummary/{main_id}"
        print(f"  GET {url}")
        data = fetch(url)

        if data is None:
            print(f"  Retry {main_id}...")
            time.sleep(1.0)
            data = fetch(url)

        if data is not None:
            out_path = Path(f"src/static/cache/indicatorSummary_{main_id}.json")
            with open(out_path, "w") as f:
                json.dump(data, f)
            print(f"  ✓ Written {out_path}")
        else:
            print(f"  ✗ FAILED for mainIndicatorId={main_id}")

        time.sleep(DELAY)

    print("\nDone.")


if __name__ == "__main__":
    main()
