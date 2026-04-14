#!/usr/bin/env python3
"""
Extract the KldB 2010 (Fassung 2020) systematic directory and the KldB↔ISCO-08
crosswalk from the Bundesagentur xlsx sources, emit a plain JSON snapshot the
Node build pipeline can consume.

Input files (manually downloaded to data-raw/kldb/):
  - systematisches-verzeichnis.xlsx  (KldB 2010 hierarchy, 1-5 digits, DE names)
  - umsteigeschluessel-kldb-isco.xlsx (KldB-5d ↔ ISCO-08-4d crosswalk)

Run whenever the xlsx files are refreshed. One-off.
Requires Python 3 stdlib only (zipfile, xml.etree, json).

Usage:
  python3 scripts/extract-kldb.py
"""
import json
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SYSTEMATIK = ROOT / "data-raw/kldb/systematisches-verzeichnis.xlsx"
CROSSWALK = ROOT / "data-raw/kldb/umsteigeschluessel-kldb-isco.xlsx"
OUTPUT = ROOT / "scripts/input/kldb-data.json"

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def _read_shared_strings(zf):
    with zf.open("xl/sharedStrings.xml") as f:
        tree = ET.parse(f)
    strings = []
    for si in tree.getroot().findall("m:si", NS):
        strings.append("".join(t.text or "" for t in si.findall(".//m:t", NS)))
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


def extract_systematik():
    """Pull 5-digit Berufsgattungen + DE Langbezeichnungen from sheet4."""
    with zipfile.ZipFile(SYSTEMATIK) as zf:
        strings = _read_shared_strings(zf)
        rows = _read_sheet_rows(zf, "sheet4.xml", strings)
    classes = []
    for row in rows:
        if len(row) < 2:
            continue
        code = (row[0] or "").strip()
        name = (row[1] or "").strip()
        if len(code) != 5 or not code.isdigit() or not name:
            continue
        anf = int(code[4])
        classes.append({
            "code": code,
            "name": name,
            "anforderungsniveau": anf,  # 1=Helfer, 2=Fachkraft, 3=Spezialist, 4=Experte, 9=n/a
        })
    return classes


def extract_crosswalk():
    """Pull KldB-5d ↔ ISCO-4d pairs with Schwerpunkt flag from sheet2."""
    with zipfile.ZipFile(CROSSWALK) as zf:
        strings = _read_shared_strings(zf)
        rows = _read_sheet_rows(zf, "sheet2.xml", strings)
    pairs = []
    for row in rows:
        if len(row) < 8:
            continue
        kldb = (row[0] or "").strip()
        isco = (row[3] or "").strip()
        if len(kldb) != 5 or not kldb.isdigit() or len(isco) != 4 or not isco.isdigit():
            continue
        eindeutig = (row[6] or "").strip() == "1"
        # Column H format: "1" for primary (Schwerpunkt), or a number (alt count)
        schwerpunkt = (row[7] or "").strip() == "1"
        pairs.append({
            "kldb5d": kldb,
            "isco4d": isco,
            "schwerpunkt": schwerpunkt,
            "eindeutig": eindeutig,
        })
    return pairs


def main():
    for p in (SYSTEMATIK, CROSSWALK):
        if not p.exists():
            raise SystemExit(f"Missing {p.relative_to(ROOT)} — see header docstring for download URLs.")

    classes = extract_systematik()
    crosswalk = extract_crosswalk()

    print(f"KldB-5d classes: {len(classes)}")
    anf_counts = {}
    for c in classes:
        anf_counts[c["anforderungsniveau"]] = anf_counts.get(c["anforderungsniveau"], 0) + 1
    print(f"  by Anforderungsniveau: {dict(sorted(anf_counts.items()))}")
    print(f"Crosswalk pairs: {len(crosswalk)}")
    print(f"  Schwerpunkt pairs: {sum(1 for p in crosswalk if p['schwerpunkt'])}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "source": {
            "publisher": "Bundesagentur für Arbeit — Statistik",
            "classification": "Klassifikation der Berufe 2010 (KldB 2010) — überarbeitete Fassung 2020",
            "systematik_url": "https://statistik.arbeitsagentur.de/.../Systematisches-Verzeichnis-KldB-2020.xlsx",
            "crosswalk_url": "https://statistik.arbeitsagentur.de/.../Umsteigeschluessel-KLDB2020-ISCO08.xlsx",
            "license": "Public sector information (Bundesagentur für Arbeit), free use",
        },
        "kldbClasses": classes,
        "kldbToIsco": crosswalk,
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
