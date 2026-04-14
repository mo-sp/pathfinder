#!/usr/bin/env python3
"""
Extract the ISCO-indexed Big Five profile table from Anni et al. (2024)
supplementary materials and emit a plain JSON snapshot the Node build
pipeline can consume.

Pipeline:
  1. Unzip data-raw/osf-anni/supplementary-tables.xlsx (OSF node m9sw3).
  2. Read sheet S2 (ISCO-08 4d code ↔ occupation name index).
  3. Read sheet S6 (Big Five profiles weighted n=50, keyed by name).
  4. Join S6 profiles onto S2 by name, preserving ISCO codes.
  5. Write scripts/input/anni-bigfive-profiles.json (committed).

Run whenever supplementary-tables.xlsx is refreshed from OSF. One-off.
Requires Python 3 stdlib only (zipfile, xml.etree, json).

Usage:
  python3 scripts/extract-anni-s6.py
"""
import json
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "data-raw/osf-anni/supplementary-tables.xlsx"
OUTPUT = ROOT / "scripts/input/anni-bigfive-profiles.json"

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
DIMENSIONS = ["neuroticism", "extraversion", "openness", "agreeableness", "conscientiousness"]


def _read_shared_strings(zf):
    with zf.open("xl/sharedStrings.xml") as f:
        tree = ET.parse(f)
    strings = []
    for si in tree.getroot().findall("m:si", NS):
        t = si.find("m:t", NS)
        if t is not None:
            strings.append(t.text or "")
        else:
            # rich text: concatenate all <t> children
            strings.append("".join(tt.text or "" for tt in si.findall(".//m:t", NS)))
    return strings


def _read_sheet_rows(zf, sheet_name, strings):
    with zf.open(f"xl/worksheets/{sheet_name}") as f:
        tree = ET.parse(f)
    rows = []
    for r in tree.getroot().find("m:sheetData", NS).findall("m:row", NS):
        cells = []
        for c in r.findall("m:c", NS):
            t = c.get("t", "n")
            v = c.find("m:v", NS)
            val = v.text if v is not None else ""
            if t == "s" and val != "":
                val = strings[int(val)]
            elif t == "inlineStr":
                is_el = c.find("m:is", NS)
                val = is_el.find("m:t", NS).text if is_el is not None else ""
            cells.append(val)
        rows.append(cells)
    return rows


def main():
    if not XLSX.exists():
        raise SystemExit(
            f"Missing {XLSX}. Download from OSF node m9sw3:\n"
            "  curl -sL -o data-raw/osf-anni/supplementary-tables.xlsx https://osf.io/download/y735x/"
        )

    with zipfile.ZipFile(XLSX) as zf:
        strings = _read_shared_strings(zf)
        s2_rows = _read_sheet_rows(zf, "sheet2.xml", strings)  # S2
        s6_rows = _read_sheet_rows(zf, "sheet6.xml", strings)  # S6

    # S2: row 0 = table title, row 1 = header (4d_code, 4d_name, Shortened name, N)
    # S6: row 0 = table title, row 1 = header (ISCO_4d_name, N, E, O, A, C, N)
    s2_header = s2_rows[1]
    assert s2_header[:2] == ["4d_code", "4d_name"], f"unexpected S2 header: {s2_header}"
    name_to_code = {}
    for row in s2_rows[2:]:
        if len(row) < 2 or not row[1]:
            continue
        name_to_code[row[1].strip()] = row[0].strip()

    s6_header = s6_rows[1]
    assert s6_header[:6] == [
        "ISCO_4d_name",
        "Neuroticism",
        "Extraversion",
        "Openness",
        "Agreeableness",
        "Conscientiousness",
    ], f"unexpected S6 header: {s6_header}"

    profiles = []
    missing = []
    for row in s6_rows[2:]:
        if len(row) < 7 or not row[0]:
            continue
        name = row[0].strip()
        code = name_to_code.get(name)
        if code is None:
            missing.append(name)
            continue
        profiles.append(
            {
                "iscoCode": code,
                "name": name,
                "sampleSize": int(row[6]) if row[6] else None,
                "scores": {
                    "neuroticism": float(row[1]),
                    "extraversion": float(row[2]),
                    "openness": float(row[3]),
                    "agreeableness": float(row[4]),
                    "conscientiousness": float(row[5]),
                },
            }
        )

    if missing:
        print(f"WARN: {len(missing)} S6 rows could not be joined to S2 by name:")
        for n in missing[:10]:
            print(f"  - {n}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "source": {
            "citation": "Anni, K., Vainik, U., & Mõttus, R. (2024). Personality Profiles of 263 Occupations. Journal of Applied Psychology.",
            "doi": "10.1037/apl0001249",
            "osf": "https://osf.io/m9sw3/",
            "table": "S6 — Big Five personality profiles, weighted n=50",
            "scale": "T-scores (mean=50, SD=10) across all jobs",
        },
        "dimensions": DIMENSIONS,
        "profiles": profiles,
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(profiles)} profiles to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
