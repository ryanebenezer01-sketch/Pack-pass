# Pack-Pass Atlas — Flight Geography & the IATA Fare Lab

An interactive study tool for learning how the world of airline travel actually
works: a **3D globe** of the planet coloured by IATA Traffic Conference area,
every major airport and its **terminals**, and a hands-on **fare-construction
laboratory** (NUC, ROE, MPM, TPM, EMS, EMA, HIP …).

Built as the "learn everything about flights" companion inside the Pack-Pass
travel brand. Open it, spin the Earth, click an airport, then go build a fare.

## What's inside

### 🌐 3D Globe
- A real WebGL globe (ThreeJS via `globe.gl`) you can drag, zoom and auto-rotate.
- Every country shaded by its **IATA Traffic Conference area**:
  - **TC1 (Area 1)** — the Americas (teal)
  - **TC2 (Area 2)** — Europe, Middle East & Africa (amber)
  - **TC3 (Area 3)** — Asia, Australia & the Pacific (violet)
- ~50 major international airports as clickable markers. Click any 3-letter
  **IATA code** to see its city, country, area/sub-area, **terminals (T1/T2/T3…)**
  and coordinates.
- Sample **routings** drawn as animated great-circle arcs, including the
  teaching example **AUH → DEL → CMB** (Abu Dhabi → Delhi on Air India, then
  Colombo on SriLankan), plus Atlantic, Pacific and Kangaroo-route examples.

### 🛫 Terminology
Plain-English cards for everything you need to answer questions on:
- **Airport terminals** (T1/T2/T3), concourses, landside vs airside, MCT.
- **Stops** — connection vs **layover** vs **stopover** vs transit vs open-jaw.
- The three **IATA areas (TC1/TC2/TC3)** and their sub-areas.
- **Global Indicators** (AT, PA, EH, WH, PO, TS …) — how a journey crosses oceans.
- **Bookings** — PNR, RBD/booking class, fare basis, ticket vs reservation.

### 💱 Fare Lab
Three linked calculators plus a fully worked example:
1. **Mileage & EMS** — type a routing, sum the **TPM**, compare with the **MPM**,
   apply an **EMA** deduction, and read off the **Excess Mileage Surcharge** band
   (0M / 5M / 10M / 15M / 20M / 25M).
2. **NUC → Local Currency** — convert a fare with the **ROE** (rate of exchange)
   of the country of commencement.
3. **HIP check** — test intermediate city-pair fares for a **Higher Intermediate
   Point**.

The worked **AUH → DEL → CMB** example runs the whole pipeline live — and shows
that the detour up to Delhi and back down to Colombo actually triggers a **20%
excess-mileage surcharge**.

### 📚 Glossary
Every acronym in full — NUC, ROE, LCF, FCP, FBP, TPM, MPM, EMS, EMA, HIP, CTM,
BHC, GI, NIC and more — with a searchable definition for each.

## Running it

It's a static site — no build step.

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from disk also works for everything except the
country shading (browsers block `fetch()` of local files under `file://`); the
included `python3 -m http.server` avoids that. The 3D engine and the country
dataset are **vendored** into the repo (`js/vendor/`, `assets/`), so the app runs
fully **offline** — no CDN required.

## Project layout

```
index.html            # app shell + tabs
css/styles.css        # dark "mission-control" theme
js/data.js            # airports, IATA areas, routes, glossary, fare reference
js/globe.js           # 3D globe (globe.gl) + interactions
js/calculator.js      # fare-construction engine (TPM/MPM/EMS, NUC/ROE, HIP)
js/app.js             # navigation + content rendering
js/vendor/            # globe.gl (bundles ThreeJS) — vendored
assets/countries.geojson  # Natural Earth country polygons — vendored
```

## A note on accuracy

This is a **learning** tool. Mileages are computed as great-circle distances so
every calculator stays self-consistent and you can see exactly how the arithmetic
flows. **Real tickets** use the exact published values from the official IATA
**TPM** and **MPM** manuals, the live **ROE**, and filed fares — swap those in and
the same method applies.

## Credits

- 3D globe: [`globe.gl`](https://github.com/vasturiano/globe.gl) (MIT), which
  wraps [ThreeJS](https://threejs.org/).
- Country boundaries: [Natural Earth](https://www.naturalearthdata.com/)
  (public domain), 1:110m admin-0 dataset.
