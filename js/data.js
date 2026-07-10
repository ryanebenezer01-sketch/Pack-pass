/* =========================================================================
   Pack-Pass Atlas — DATA LAYER
   -------------------------------------------------------------------------
   Everything the app knows about the world of air travel lives here:
     - IATA Traffic Conference Areas (TC1 / TC2 / TC3) and their sub-areas
     - A curated set of major international airports (with terminals)
     - Sample routings (including the AUH -> DEL -> CMB teaching example)
     - A terminology / glossary knowledge base
     - IATA fare-construction reference (NUC, ROE, MPM, TPM, EMS, EMA, HIP...)
   Other files read from the global `PP` object created below.
   ========================================================================= */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     1. IATA TRAFFIC CONFERENCE AREAS
     The world is divided by IATA into THREE areas. Almost every fare rule,
     global indicator and routing concept is anchored to these three zones.
     ---------------------------------------------------------------------- */
  const AREAS = {
    TC1: {
      code: "TC1",
      name: "Area 1 — The Western Hemisphere",
      color: "#00c2a8",
      blurb:
        "North, Central and South America, the Caribbean, Greenland, Hawaii " +
        "and adjacent Atlantic/Pacific islands. Everything in the Americas.",
      subareas: [
        "North America (Canada, USA, Mexico, Greenland, Hawaii)",
        "Central America (Guatemala → Panama)",
        "Caribbean (the islands)",
        "South America (Colombia, Brazil, Argentina …)"
      ]
    },
    TC2: {
      code: "TC2",
      name: "Area 2 — Europe, Middle East & Africa",
      color: "#f5a623",
      blurb:
        "All of Europe (including European Russia to the Ural mountains), the " +
        "whole of Africa, and the Middle East west of and including Iran.",
      subareas: [
        "Europe (incl. European Russia, Turkey)",
        "Middle East (up to and including Iran)",
        "Africa (Northern, Western, Central, Eastern, Southern & Indian-Ocean)"
      ]
    },
    TC3: {
      code: "TC3",
      name: "Area 3 — Asia, Australia & the Pacific",
      color: "#a06bff",
      blurb:
        "Asia east of Iran (the South-Asian subcontinent, South-East Asia, " +
        "Japan/Korea/China), plus Australia, New Zealand and the Pacific.",
      subareas: [
        "South Asian Subcontinent (India, Pakistan, Sri Lanka, Nepal …)",
        "South East Asia (Thailand, Singapore, Indonesia …)",
        "Japan / Korea",
        "South West Pacific (Australia, NZ, Pacific islands)"
      ]
    }
  };

  // Between-area travel is described by a GLOBAL INDICATOR (GI).
  const GLOBAL_INDICATORS = [
    { gi: "AT", name: "Atlantic", desc: "Travel between Area 1 and Area 2/3 crossing the Atlantic Ocean." },
    { gi: "PA", name: "Pacific", desc: "Travel between Area 1 and Area 3 crossing the Pacific Ocean." },
    { gi: "AP", name: "Atlantic & Pacific", desc: "Between Area 1 and Area 3 crossing BOTH oceans (round-the-world style)." },
    { gi: "PO", name: "Polar", desc: "Between Area 1 and Area 2/3 over the North Pole." },
    { gi: "PN", name: "Polar (Pacific)", desc: "Area 1 to Area 3 via the North Pacific/polar routing." },
    { gi: "EH", name: "Eastern Hemisphere", desc: "Travel within/between Area 2 and Area 3 (the Eastern Hemisphere)." },
    { gi: "WH", name: "Western Hemisphere", desc: "Travel wholly within Area 1." },
    { gi: "TS", name: "Trans Siberian", desc: "Area 2 ↔ Area 3 via the Trans-Siberian corridor over Russia." },
    { gi: "RU", name: "Russia", desc: "Routings via the Russian Federation between Europe and Asia." },
    { gi: "FE", name: "Far East", desc: "Area 2 ↔ Area 3 via the Far East (non-Siberian)." }
  ];

  /* ----------------------------------------------------------------------
     2. AIRPORTS
     A curated global set. `area` is the IATA Traffic Conference area.
     `terminals` lists real passenger terminals (T1/T2/T3 …) where known.
     Coordinates are decimal lat/lng of the airport.
     ---------------------------------------------------------------------- */
  const AIRPORTS = [
    // ---- TC1 : THE AMERICAS ----
    { iata: "JFK", city: "New York",       country: "USA",          area: "TC1", sub: "North America", lat: 40.6413, lng: -73.7781, terminals: ["T1 (int'l carriers)", "T4 (Delta / int'l)", "T5 (JetBlue)", "T7", "T8 (American)"] },
    { iata: "LAX", city: "Los Angeles",    country: "USA",          area: "TC1", sub: "North America", lat: 33.9416, lng: -118.4085, terminals: ["Terminals 1–8", "TBIT / Terminal B (int'l)"] },
    { iata: "ORD", city: "Chicago",        country: "USA",          area: "TC1", sub: "North America", lat: 41.9742, lng: -87.9073, terminals: ["T1 (United)", "T2", "T3 (American)", "T5 (int'l)"] },
    { iata: "MIA", city: "Miami",          country: "USA",          area: "TC1", sub: "North America", lat: 25.7959, lng: -80.2870, terminals: ["North / Central / South concourses"] },
    { iata: "SFO", city: "San Francisco",  country: "USA",          area: "TC1", sub: "North America", lat: 37.6213, lng: -122.3790, terminals: ["T1", "T2", "T3", "International Terminal"] },
    { iata: "YYZ", city: "Toronto",        country: "Canada",       area: "TC1", sub: "North America", lat: 43.6777, lng: -79.6248, terminals: ["T1 (Air Canada / Star)", "T3 (int'l / others)"] },
    { iata: "YVR", city: "Vancouver",      country: "Canada",       area: "TC1", sub: "North America", lat: 49.1951, lng: -123.1779, terminals: ["Domestic", "International", "US departures"] },
    { iata: "MEX", city: "Mexico City",    country: "Mexico",       area: "TC1", sub: "Central America", lat: 19.4361, lng: -99.0719, terminals: ["T1", "T2"] },
    { iata: "GRU", city: "São Paulo",      country: "Brazil",       area: "TC1", sub: "South America", lat: -23.4356, lng: -46.4731, terminals: ["T1", "T2", "T3 (int'l)"] },
    { iata: "GIG", city: "Rio de Janeiro", country: "Brazil",       area: "TC1", sub: "South America", lat: -22.8090, lng: -43.2506, terminals: ["T1", "T2"] },
    { iata: "EZE", city: "Buenos Aires",   country: "Argentina",    area: "TC1", sub: "South America", lat: -34.8222, lng: -58.5358, terminals: ["Terminal A", "Terminal C"] },
    { iata: "BOG", city: "Bogotá",         country: "Colombia",     area: "TC1", sub: "South America", lat: 4.7016, lng: -74.1469, terminals: ["T1 (int'l+domestic)", "T2 (Puente Aéreo)"] },
    { iata: "LIM", city: "Lima",           country: "Peru",         area: "TC1", sub: "South America", lat: -12.0219, lng: -77.1143, terminals: ["Main terminal"] },

    // ---- TC2 : EUROPE / MIDDLE EAST / AFRICA ----
    { iata: "LHR", city: "London",         country: "United Kingdom", area: "TC2", sub: "Europe", lat: 51.4700, lng: -0.4543, terminals: ["T2 (Star Alliance)", "T3 (oneworld/others)", "T4 (SkyTeam)", "T5 (British Airways)"] },
    { iata: "CDG", city: "Paris",          country: "France",       area: "TC2", sub: "Europe", lat: 49.0097, lng: 2.5479, terminals: ["T1", "T2 (A–G, Air France hub)", "T3"] },
    { iata: "FRA", city: "Frankfurt",      country: "Germany",      area: "TC2", sub: "Europe", lat: 50.0379, lng: 8.5622, terminals: ["T1 (Lufthansa/Star)", "T2"] },
    { iata: "AMS", city: "Amsterdam",      country: "Netherlands",  area: "TC2", sub: "Europe", lat: 52.3105, lng: 4.7683, terminals: ["Single terminal, Departures 1–3"] },
    { iata: "MAD", city: "Madrid",         country: "Spain",        area: "TC2", sub: "Europe", lat: 40.4983, lng: -3.5676, terminals: ["T1", "T2", "T3", "T4 (Iberia/oneworld)"] },
    { iata: "FCO", city: "Rome",           country: "Italy",        area: "TC2", sub: "Europe", lat: 41.8003, lng: 12.2389, terminals: ["T1", "T3 (int'l)"] },
    { iata: "ZRH", city: "Zurich",         country: "Switzerland",  area: "TC2", sub: "Europe", lat: 47.4647, lng: 8.5492, terminals: ["Docks A / B / E"] },
    { iata: "IST", city: "Istanbul",       country: "Türkiye",      area: "TC2", sub: "Europe", lat: 41.2753, lng: 28.7519, terminals: ["Single mega-terminal"] },
    { iata: "SVO", city: "Moscow",         country: "Russia",       area: "TC2", sub: "Europe", lat: 55.9726, lng: 37.4146, terminals: ["Terminals B / C / D / E / F"] },
    { iata: "DXB", city: "Dubai",          country: "UAE",          area: "TC2", sub: "Middle East", lat: 25.2532, lng: 55.3657, terminals: ["T1 (int'l)", "T2", "T3 (Emirates)"] },
    { iata: "AUH", city: "Abu Dhabi",      country: "UAE",          area: "TC2", sub: "Middle East", lat: 24.4330, lng: 54.6511, terminals: ["Terminal A (Etihad hub; replaced old T1/T3)"] },
    { iata: "DOH", city: "Doha",           country: "Qatar",        area: "TC2", sub: "Middle East", lat: 25.2731, lng: 51.6081, terminals: ["Hamad Int'l — Concourses A–E"] },
    { iata: "JED", city: "Jeddah",         country: "Saudi Arabia", area: "TC2", sub: "Middle East", lat: 21.6796, lng: 39.1565, terminals: ["T1", "North / South / Hajj"] },
    { iata: "THR", city: "Tehran",         country: "Iran",         area: "TC2", sub: "Middle East", lat: 35.4161, lng: 51.1522, terminals: ["IKA Int'l"] },
    { iata: "CAI", city: "Cairo",          country: "Egypt",        area: "TC2", sub: "Africa", lat: 30.1219, lng: 31.4056, terminals: ["T1", "T2", "T3"] },
    { iata: "JNB", city: "Johannesburg",   country: "South Africa", area: "TC2", sub: "Africa", lat: -26.1367, lng: 28.2411, terminals: ["Domestic", "International (A/B)"] },
    { iata: "NBO", city: "Nairobi",        country: "Kenya",        area: "TC2", sub: "Africa", lat: -1.3192, lng: 36.9278, terminals: ["T1 (A–E)", "T2"] },
    { iata: "ADD", city: "Addis Ababa",    country: "Ethiopia",     area: "TC2", sub: "Africa", lat: 8.9779, lng: 38.7993, terminals: ["T1 (domestic)", "T2 (int'l)"] },
    { iata: "LOS", city: "Lagos",          country: "Nigeria",      area: "TC2", sub: "Africa", lat: 6.5774, lng: 3.3212, terminals: ["Int'l (MMIA)", "Domestic"] },
    { iata: "CMN", city: "Casablanca",     country: "Morocco",      area: "TC2", sub: "Africa", lat: 33.3675, lng: -7.5899, terminals: ["T1", "T2"] },

    // ---- TC3 : ASIA / PACIFIC ----
    { iata: "DEL", city: "Delhi",          country: "India",        area: "TC3", sub: "South Asian Subcontinent", lat: 28.5562, lng: 77.1000, terminals: ["T1 (domestic low-cost)", "T2 (domestic)", "T3 (full-service + all int'l)"] },
    { iata: "BOM", city: "Mumbai",         country: "India",        area: "TC3", sub: "South Asian Subcontinent", lat: 19.0896, lng: 72.8656, terminals: ["T1 (domestic)", "T2 (int'l + full-service dom.)"] },
    { iata: "CMB", city: "Colombo",        country: "Sri Lanka",    area: "TC3", sub: "South Asian Subcontinent", lat: 7.1808, lng: 79.8841, terminals: ["Bandaranaike Int'l (single terminal, T2 building expanding)"] },
    { iata: "MLE", city: "Malé",           country: "Maldives",     area: "TC3", sub: "South Asian Subcontinent", lat: 4.1918, lng: 73.5291, terminals: ["Velana Int'l"] },
    { iata: "KTM", city: "Kathmandu",      country: "Nepal",        area: "TC3", sub: "South Asian Subcontinent", lat: 27.6966, lng: 85.3591, terminals: ["Int'l", "Domestic"] },
    { iata: "DAC", city: "Dhaka",          country: "Bangladesh",   area: "TC3", sub: "South Asian Subcontinent", lat: 23.8433, lng: 90.3978, terminals: ["T1", "T2", "T3 (new)"] },
    { iata: "KHI", city: "Karachi",        country: "Pakistan",     area: "TC3", sub: "South Asian Subcontinent", lat: 24.9065, lng: 67.1608, terminals: ["Jinnah Int'l"] },
    { iata: "SIN", city: "Singapore",      country: "Singapore",    area: "TC3", sub: "South East Asia", lat: 1.3644, lng: 103.9915, terminals: ["T1", "T2", "T3", "T4"] },
    { iata: "BKK", city: "Bangkok",        country: "Thailand",     area: "TC3", sub: "South East Asia", lat: 13.6900, lng: 100.7501, terminals: ["Suvarnabhumi (single, concourses A–G)"] },
    { iata: "KUL", city: "Kuala Lumpur",   country: "Malaysia",     area: "TC3", sub: "South East Asia", lat: 2.7456, lng: 101.7099, terminals: ["Main Terminal (KLIA)", "klia2 (low-cost)"] },
    { iata: "CGK", city: "Jakarta",        country: "Indonesia",    area: "TC3", sub: "South East Asia", lat: -6.1256, lng: 106.6559, terminals: ["T1", "T2", "T3 (int'l)"] },
    { iata: "MNL", city: "Manila",         country: "Philippines",  area: "TC3", sub: "South East Asia", lat: 14.5086, lng: 121.0197, terminals: ["T1", "T2", "T3", "T4"] },
    { iata: "HKG", city: "Hong Kong",      country: "Hong Kong",    area: "TC3", sub: "Japan / Korea / China", lat: 22.3080, lng: 113.9185, terminals: ["T1", "Midfield concourse"] },
    { iata: "PEK", city: "Beijing",        country: "China",        area: "TC3", sub: "Japan / Korea / China", lat: 40.0799, lng: 116.6031, terminals: ["T1", "T2", "T3"] },
    { iata: "PVG", city: "Shanghai",       country: "China",        area: "TC3", sub: "Japan / Korea / China", lat: 31.1443, lng: 121.8083, terminals: ["T1", "T2"] },
    { iata: "NRT", city: "Tokyo — Narita", country: "Japan",        area: "TC3", sub: "Japan / Korea / China", lat: 35.7720, lng: 140.3929, terminals: ["T1", "T2", "T3 (low-cost)"] },
    { iata: "HND", city: "Tokyo — Haneda", country: "Japan",        area: "TC3", sub: "Japan / Korea / China", lat: 35.5494, lng: 139.7798, terminals: ["T1", "T2", "T3 (int'l)"] },
    { iata: "ICN", city: "Seoul",          country: "South Korea",  area: "TC3", sub: "Japan / Korea / China", lat: 37.4602, lng: 126.4407, terminals: ["T1", "T2 (Korean Air/SkyTeam)"] },
    { iata: "SYD", city: "Sydney",         country: "Australia",    area: "TC3", sub: "South West Pacific", lat: -33.9399, lng: 151.1753, terminals: ["T1 (int'l)", "T2", "T3 (Qantas dom.)"] },
    { iata: "MEL", city: "Melbourne",      country: "Australia",    area: "TC3", sub: "South West Pacific", lat: -37.6690, lng: 144.8410, terminals: ["T1", "T2 (int'l)", "T3", "T4"] },
    { iata: "AKL", city: "Auckland",       country: "New Zealand",  area: "TC3", sub: "South West Pacific", lat: -37.0082, lng: 174.7850, terminals: ["International", "Domestic"] }
  ];

  /* ----------------------------------------------------------------------
     2b. COUNTRY / AIRPORT SPECIALITY
     Merged onto each airport so clicking round the globe teaches you what
     each country and its main airport is known for. Kept short on purpose.
     ---------------------------------------------------------------------- */
  const AIRPORT_NOTES = {
    // TC1
    JFK: { hub: "JetBlue · Delta · American", specialty: "New York — the USA's busiest trans-Atlantic gateway on the East Coast." },
    LAX: { hub: "American · Delta · United", specialty: "The North-America ⇄ Pacific gateway; huge trans-Pacific traffic to Asia & Oceania." },
    ORD: { hub: "United · American", specialty: "Chicago — a central US mega-hub, among the world's busiest by aircraft movements." },
    MIA: { hub: "American Airlines", specialty: "The gateway to Latin America & the Caribbean, and a giant cargo hub." },
    SFO: { hub: "United Airlines", specialty: "San Francisco — Silicon Valley's trans-Pacific gateway." },
    YYZ: { hub: "Air Canada", specialty: "Canada's largest hub; the Star Alliance gateway to the Americas." },
    YVR: { hub: "Air Canada · WestJet", specialty: "Vancouver — Canada's Pacific-facing gateway to Asia." },
    MEX: { hub: "Aeroméxico", specialty: "A high-altitude Latin-American mega-city hub." },
    GRU: { hub: "LATAM", specialty: "São Paulo — South America's busiest airport and Brazil's main gateway." },
    GIG: { hub: "LATAM · GOL", specialty: "Rio de Janeiro's international gateway." },
    EZE: { hub: "Aerolíneas Argentinas", specialty: "Buenos Aires — Argentina's gateway to Europe and the Americas." },
    BOG: { hub: "Avianca", specialty: "Bogotá — high-altitude Andean hub and Avianca's home in Colombia." },
    LIM: { hub: "LATAM Perú", specialty: "Lima — the west-coast South-American hub linking the Andes and Pacific." },
    // TC2
    LHR: { hub: "British Airways", specialty: "London — the world's busiest international airport and premier trans-Atlantic hub." },
    CDG: { hub: "Air France", specialty: "Paris — continental Europe's largest hub." },
    FRA: { hub: "Lufthansa", specialty: "Frankfurt — Germany's mega-hub and one of Europe's biggest cargo airports." },
    AMS: { hub: "KLM", specialty: "Schiphol — a compact single-terminal Euro-hub famed for easy connections." },
    MAD: { hub: "Iberia", specialty: "Madrid — Europe's gateway to Latin America." },
    FCO: { hub: "ITA Airways", specialty: "Rome Fiumicino — Italy's main intercontinental gateway." },
    ZRH: { hub: "SWISS", specialty: "Zurich — a premium Alpine hub with banking-capital connectivity." },
    IST: { hub: "Turkish Airlines", specialty: "Istanbul — the bridge of Europe/Asia/Africa; Turkish flies to more countries than any airline." },
    SVO: { hub: "Aeroflot", specialty: "Moscow Sheremetyevo — Russia's principal hub and a Trans-Siberian (TS) waypoint." },
    DXB: { hub: "Emirates", specialty: "Dubai — the world's busiest airport for international passengers; the Gulf super-connector." },
    AUH: { hub: "Etihad Airways", specialty: "Abu Dhabi — Etihad's home; a UAE long-haul hub bridging Area 2 and Area 3." },
    DOH: { hub: "Qatar Airways", specialty: "Doha Hamad — an award-winning Gulf super-hub." },
    JED: { hub: "Saudia · flynas", specialty: "Jeddah — the gateway for the Hajj & Umrah pilgrimage to Mecca." },
    THR: { hub: "Iran Air", specialty: "Tehran — Iran is the eastern edge of IATA Area 2 (the Middle East / TC2 boundary)." },
    CAI: { hub: "EgyptAir", specialty: "Cairo — North Africa's historic crossroads hub." },
    JNB: { hub: "South African Airways", specialty: "Johannesburg OR Tambo — southern Africa's largest hub." },
    NBO: { hub: "Kenya Airways", specialty: "Nairobi — East Africa's hub and safari gateway." },
    ADD: { hub: "Ethiopian Airlines", specialty: "Addis Ababa — home of Ethiopian, Africa's largest and fastest-growing airline." },
    LOS: { hub: "Air Peace & others", specialty: "Lagos — West Africa's busiest gateway." },
    CMN: { hub: "Royal Air Maroc", specialty: "Casablanca — Morocco's hub linking Europe, Africa and the Americas." },
    // TC3
    DEL: { hub: "Air India · IndiGo", specialty: "Delhi — India's capital mega-hub; T3 handles all international + full-service flights." },
    BOM: { hub: "Air India · IndiGo", specialty: "Mumbai — India's financial-capital gateway." },
    CMB: { hub: "SriLankan Airlines", specialty: "Colombo — Sri Lanka's island gateway and UL's home, connecting South Asia." },
    MLE: { hub: "Maldivian · seaplanes", specialty: "Malé — a resort-island gateway with seaplane transfers to the atolls." },
    KTM: { hub: "Nepal Airlines", specialty: "Kathmandu — the Himalayan gateway to Everest, with a demanding high-terrain approach." },
    DAC: { hub: "Biman Bangladesh", specialty: "Dhaka — Bangladesh's main gateway." },
    KHI: { hub: "Pakistan International", specialty: "Karachi — Pakistan's port-city gateway (Pakistan is TC3, east of Iran)." },
    SIN: { hub: "Singapore Airlines", specialty: "Changi — perennial 'world's best airport' and South-East Asia's premier hub." },
    BKK: { hub: "Thai Airways", specialty: "Bangkok Suvarnabhumi — South-East Asia's tourism super-hub." },
    KUL: { hub: "Malaysia Airlines · AirAsia", specialty: "Kuala Lumpur — home of AirAsia's low-cost empire and the klia2 mega low-cost terminal." },
    CGK: { hub: "Garuda Indonesia", specialty: "Jakarta — gateway to the world's largest archipelago." },
    MNL: { hub: "Philippine Airlines · Cebu Pacific", specialty: "Manila — the Philippines' island-nation hub." },
    HKG: { hub: "Cathay Pacific", specialty: "Hong Kong — the gateway to mainland China and a top-3 world cargo airport." },
    PEK: { hub: "Air China", specialty: "Beijing Capital — China's flag hub." },
    PVG: { hub: "China Eastern", specialty: "Shanghai Pudong — China's international & cargo gateway." },
    NRT: { hub: "Japan Airlines · ANA", specialty: "Tokyo Narita — Japan's long-haul international gateway." },
    HND: { hub: "Japan Airlines · ANA", specialty: "Tokyo Haneda — the close-in airport, increasingly international." },
    ICN: { hub: "Korean Air · Asiana", specialty: "Seoul Incheon — Korea's award-winning hub." },
    SYD: { hub: "Qantas", specialty: "Sydney — Australia's premier gateway and home of the historic Kangaroo Route." },
    MEL: { hub: "Qantas · Jetstar", specialty: "Melbourne — Australia's second mega-hub." },
    AKL: { hub: "Air New Zealand", specialty: "Auckland — the South Pacific gateway, long-haul to the Americas and Asia." }
  };
  AIRPORTS.forEach((a) => {
    const n = AIRPORT_NOTES[a.iata];
    if (n) { a.hub = n.hub; a.specialty = n.specialty; }
  });

  /* ----------------------------------------------------------------------
     3. CARRIERS referenced in the sample routings
     ---------------------------------------------------------------------- */
  const CARRIERS = {
    AI: "Air India",
    UL: "SriLankan Airlines",
    EY: "Etihad Airways",
    BA: "British Airways",
    AA: "American Airlines",
    AF: "Air France",
    QR: "Qatar Airways",
    SQ: "Singapore Airlines",
    QF: "Qantas",
    LA: "LATAM"
  };

  /* ----------------------------------------------------------------------
     4. SAMPLE ROUTINGS
     Each routing is a list of segments {from,to,carrier,gi}. The globe draws
     these as animated great-circle arcs; the Fare Lab can load them too.
     ---------------------------------------------------------------------- */
  const ROUTES = [
    {
      id: "auh-del-cmb",
      name: "AUH → DEL → CMB  (the teaching example)",
      note: "Abu Dhabi on Air India to Delhi, then SriLankan to Colombo. A within-Area / Eastern-Hemisphere itinerary that crosses the TC2 → TC3 boundary.",
      segments: [
        { from: "AUH", to: "DEL", carrier: "AI", gi: "EH" },
        { from: "DEL", to: "CMB", carrier: "UL", gi: "EH" }
      ]
    },
    {
      id: "atlantic-classic",
      name: "Trans-Atlantic: LHR → JFK → GRU",
      note: "A classic Area 2 → Area 1 Atlantic (AT) crossing, then onward within TC1 to South America.",
      segments: [
        { from: "LHR", to: "JFK", carrier: "BA", gi: "AT" },
        { from: "JFK", to: "GRU", carrier: "AA", gi: "WH" }
      ]
    },
    {
      id: "auh-atlantic-bog",
      name: "AUH → LHR → JFK → BOG  (to Colombia)",
      note: "If you really meant COLOMBIA: Abu Dhabi to Bogotá crossing TC3-boundary/TC2 then the Atlantic (AT) into TC1.",
      segments: [
        { from: "AUH", to: "LHR", carrier: "EY", gi: "EH" },
        { from: "LHR", to: "JFK", carrier: "BA", gi: "AT" },
        { from: "JFK", to: "BOG", carrier: "AA", gi: "WH" }
      ]
    },
    {
      id: "kangaroo",
      name: "Kangaroo route: SYD → SIN → LHR",
      note: "Area 3 to Area 2 via the Eastern Hemisphere (EH) — the historic 'Kangaroo Route'.",
      segments: [
        { from: "SYD", to: "SIN", carrier: "QF", gi: "EH" },
        { from: "SIN", to: "LHR", carrier: "SQ", gi: "EH" }
      ]
    },
    {
      id: "pacific",
      name: "Trans-Pacific: SYD → LAX → JFK",
      note: "Area 3 to Area 1 across the Pacific (PA), then within TC1.",
      segments: [
        { from: "SYD", to: "LAX", carrier: "QF", gi: "PA" },
        { from: "LAX", to: "JFK", carrier: "AA", gi: "WH" }
      ]
    }
  ];

  /* ----------------------------------------------------------------------
     5. TERMINOLOGY KNOWLEDGE BASE (rendered as cards)
     ---------------------------------------------------------------------- */
  const TOPICS = [
    {
      group: "Airport terminals (T1 / T2 / T3)",
      items: [
        { term: "Terminal (T1, T2, T3 …)", body: "A terminal is a physical building where passengers move between the landside (check-in, security) and the airside (gates, aircraft). Big airports split traffic across numbered terminals — e.g. Delhi's <b>T3</b> handles all international + full-service flights, while <b>T1</b> is low-cost domestic. Terminals are grouped by airline alliance at some hubs (London Heathrow <b>T2</b> = Star Alliance, <b>T5</b> = British Airways)." },
        { term: "Concourse / Pier / Satellite", body: "A concourse (or pier / satellite) is a finger of gates attached to a terminal. One terminal can have several concourses (e.g. Doha Hamad concourses A–E). 'Gate' is the specific door you board from." },
        { term: "Landside vs Airside", body: "<b>Landside</b> = before security (anyone can be there). <b>Airside</b> = after security/immigration (ticketed passengers only). An international <b>transit</b> keeps you airside the whole time so you never formally 'enter' the country." },
        { term: "Terminal transfer (MCT)", body: "Changing terminals costs time. The <b>Minimum Connecting Time (MCT)</b> is the shortest legal gap an airport allows between arriving and departing flights — it is longer when you must change terminals or move between domestic and international." }
      ]
    },
    {
      group: "Stops, stopovers & layovers",
      items: [
        { term: "Connection (transfer)", body: "You change planes but keep going, with a gap short enough that it is <b>not</b> a stopover. In IATA terms a connection under the stopover threshold is priced as continuous travel." },
        { term: "Layover", body: "The informal word for the wait between two flights at a connecting point. A <b>short layover</b> is just a connection; a <b>long layover</b> may become a stopover if it exceeds the allowed limit." },
        { term: "Stopover", body: "A deliberate break in the journey at an intermediate city that is <b>longer than the connection limit</b> — internationally usually <b>more than 24 hours</b> (domestically often &gt;4 hours). Stopovers can be free or carry a fee, and they change the fare because they can create a <b>Higher Intermediate Point (HIP)</b>." },
        { term: "Transit", body: "You stay on the same aircraft (or move airside to a follow-on flight) without clearing immigration. A <b>direct flight</b> with the same flight number can still make a transit stop." },
        { term: "Open-jaw", body: "The trip has a 'gap' on the ground — you fly into one city and out of another (or return to a different city). Named because the route map looks like an open jaw." }
      ]
    },
    {
      group: "IATA Traffic Conference Areas (TC1 / TC2 / TC3)",
      items: [
        { term: "Area 1 (TC1)", body: AREAS.TC1.blurb },
        { term: "Area 2 (TC2)", body: AREAS.TC2.blurb },
        { term: "Area 3 (TC3)", body: AREAS.TC3.blurb },
        { term: "Why areas matter", body: "Fares, mileage limits (MPM) and the <b>Global Indicator</b> all depend on which areas your journey touches and how it crosses the oceans. Crossing the <b>Atlantic</b> between Area 2 and Area 1 = GI <b>AT</b>; the <b>Pacific</b> between Area 3 and Area 1 = GI <b>PA</b>; staying inside Area 2↔Area 3 = <b>EH</b> (Eastern Hemisphere)." }
      ]
    },
    {
      group: "Bookings, classes & the PNR",
      items: [
        { term: "PNR (Passenger Name Record)", body: "The booking file in the reservation system holding your itinerary, contact details, fare and ticket. Identified by a 6-character <b>record locator</b> (e.g. <code>X4F2QP</code>)." },
        { term: "RBD / Booking class", body: "A single-letter <b>Reservation Booking Designator</b> that identifies the fare bucket inside a cabin. <code>J/C/D</code> business, <code>Y/B/M</code> full-economy, <code>Q/T/E</code> discounted economy, etc. Your RBD controls price, mileage earning and change rules — not just the cabin." },
        { term: "Fare basis", body: "A short code that fully describes a fare, e.g. <code>QLXOWAE</code>. It encodes booking class, season, weekday/weekend, one-way/round-trip and any special conditions." },
        { term: "Ticket vs Reservation", body: "A reservation holds seats; a <b>ticket</b> (an e-ticket / EMD) is the financial document proving payment and the contract of carriage. The 13-digit ticket number starts with the airline's 3-digit code (e.g. 098 = Air India, 603 = SriLankan)." }
      ]
    }
  ];

  /* ----------------------------------------------------------------------
     6. IATA FARE-CONSTRUCTION GLOSSARY (full forms + explanations)
     Every acronym the user asked about, plus the essential companions.
     ---------------------------------------------------------------------- */
  const FARE_TERMS = [
    { abbr: "IATA", full: "International Air Transport Association", grp: "Body", desc: "The trade body that publishes the fare-construction rules, the mileage manuals (TPM/MPM), the Rate of Exchange (ROE) and the NUC system." },
    { abbr: "NUC", full: "Neutral Unit of Construction", grp: "Currency", desc: "A neutral 'currency' (≈ 1 US dollar) used to build a fare so that carriers in different countries can add up the pieces of an international journey in one common unit." },
    { abbr: "ROE", full: "Rate of Exchange (IATA Rate of Exchange, IROE)", grp: "Currency", desc: "The official factor that converts the total NUC into the Local Currency Fare of the country where the journey begins. Published by IATA and updated periodically." },
    { abbr: "LCF", full: "Local Currency Fare", grp: "Currency", desc: "The fare expressed in the money of the country of commencement. LCF = NUC × ROE, then rounded up to that currency's fare-rounding unit." },
    { abbr: "FCP", full: "Fare Construction Point (Fare Component)", grp: "Routing", desc: "A priced piece of the journey between two fare-break points. A long trip is split into fare components; each component is constructed and checked on its own, then summed." },
    { abbr: "FBP", full: "Fare Break Point", grp: "Routing", desc: "A point where one fare component ends and the next begins (often a stopover). Choosing good break points is the heart of fare construction." },
    { abbr: "TPM", full: "Ticketed Point Mileage", grp: "Mileage", desc: "The published flown distance of ONE flight coupon between two ticketed points, from the IATA TPM manual. Add up the TPMs of every segment in a fare component to get the distance actually flown." },
    { abbr: "MPM", full: "Maximum Permitted Mileage", grp: "Mileage", desc: "The greatest distance you are allowed to fly on a given fare between an origin and destination (per Global Indicator). Published by IATA; it is usually ~15–20% more than the shortest path, giving you room to route via intermediate cities." },
    { abbr: "EMS", full: "Excess Mileage Surcharge", grp: "Mileage", desc: "If the sum of TPMs exceeds the MPM, a surcharge is added in fixed 5% bands (5M, 10M, 15M, 20M, 25M). Ratio = ΣTPM ÷ MPM; round the excess up to the next band. Above 25M the component is invalid and must be re-broken." },
    { abbr: "EMA", full: "Extra Mileage Allowance", grp: "Mileage", desc: "A published mileage DEDUCTION (a bonus) for routing via certain cities/areas. Subtract the EMA from ΣTPM before comparing with MPM — it can wipe out or reduce an excess-mileage surcharge." },
    { abbr: "HIP", full: "Higher Intermediate Point", grp: "Checks", desc: "If any intermediate city (an origin-to-stopover, stopover-to-stopover, or stopover-to-destination pair) has a PUBLISHED fare HIGHER than the through origin–destination fare, that higher fare must be used for the component. Stops you 'hiding' an expensive market inside a cheap end-to-end fare." },
    { abbr: "CTM", full: "Circle Trip Minimum", grp: "Checks", desc: "For a circle trip (you return to origin via a different route), the total must be at least the highest one-way fare from the origin to any turnaround point on the trip. Prevents building a cheap loop past an expensive city." },
    { abbr: "BHC", full: "Backhaul Check (Mileage/ Directional Minimum)", grp: "Checks", desc: "On a one-way component, if an intermediate point's fare is higher than the destination's, the fare may be 'back-hauling' past a dearer market; a check/adjustment ensures you are charged at least that higher intermediate fare." },
    { abbr: "NIC", full: "Non-IATA Carrier (a.k.a. 'not-IATA' fare note)", grp: "Notes", desc: "A flag that a carrier or fare is outside standard IATA multilateral fares, so special construction/prorate rules apply. (In many training decks 'NIC' simply marks that a portion is priced on a carrier's own private fare rather than an IATA through fare.)" },
    { abbr: "GI", full: "Global Indicator", grp: "Routing", desc: "A two-letter code (AT, PA, EH, WH, PO, TS …) describing the geographic way a journey travels between areas. The GI selects which MPM and which fare apply." },
    { abbr: "OW / RT / CT", full: "One-Way / Round-Trip / Circle-Trip", grp: "Routing", desc: "The journey type. RT and CT fares are often built from two half-round-trip (½RT) amounts; OW uses one-way fares. The type drives which minimum checks (CTM, BHC) you run." },
    { abbr: "Q", full: "Q surcharge", grp: "Add-ons", desc: "A fixed surcharge added into the NUC construction for specific markets (fuel/route surcharges historically). Added to the fare before conversion." },
    { abbr: "YQ / YR", full: "Carrier-imposed surcharge / fee", grp: "Add-ons", desc: "Airline-imposed amounts (often called 'fuel surcharge') collected as taxes/fees on the ticket, separate from the constructed fare." },
    { abbr: "EH", full: "Eastern Hemisphere (Global Indicator)", grp: "Global Indicator", desc: "Journeys travelling within/between Area 2 and Area 3 through the Eastern Hemisphere. Our AUH→DEL→CMB example is an EH routing." },
    { abbr: "TS", full: "Trans Siberian (Global Indicator)", grp: "Global Indicator", desc: "Area 2 ⇄ Area 3 routed via the Trans-Siberian corridor over Russia (e.g. Europe to Japan/Korea across Siberia). Selects its own MPM and fares." },
    { abbr: "RU", full: "Russia (Global Indicator)", grp: "Global Indicator", desc: "Routings between Europe and Asia via the Russian Federation. Related to TS but a distinct indicator for fare selection." },
    { abbr: "FE", full: "Far East (Global Indicator)", grp: "Global Indicator", desc: "Area 2 ⇄ Area 3 via the Far East (a non-Siberian easterly path). Chooses the MPM/fare for that geography." },
    { abbr: "AT / PA / WH", full: "Atlantic / Pacific / Western Hemisphere", grp: "Global Indicator", desc: "AT = crosses the Atlantic (Area 1 ⇄ 2/3); PA = crosses the Pacific (Area 1 ⇄ 3); WH = travel wholly within Area 1." },
    { abbr: "TTL", full: "Ticketing Time Limit", grp: "Booking", desc: "The deadline by which a held reservation must be ticketed (paid). Miss the TTL and the booking is auto-cancelled and seats released." },
    { abbr: "IRV", full: "IATA Rate of exchange Value (IROE)", grp: "Currency", desc: "Commonly the IROE / ROE — the rate that turns the NUC total into local money. (IRV is not a standard stand-alone IATA acronym; if your course uses it differently, treat it as the rate applied to the NUC. See ROE.)" },
    { abbr: "TTL fare", full: "Total (ticket total)", grp: "Add-ons", desc: "The grand total the passenger pays = constructed fare (LCF) + taxes, fees and carrier surcharges (YQ/YR). Shown as the 'TTL' on a fare quote." }
  ];

  /* ----------------------------------------------------------------------
     7. EXCESS-MILEAGE-SURCHARGE bands
     ratio = (ΣTPM − EMA) / MPM ; take the first band whose maxRatio it fits.
     ---------------------------------------------------------------------- */
  const EMS_STEPS = [
    { maxRatio: 1.00, pct: 0,  code: "0M",  note: "Within MPM — no surcharge." },
    { maxRatio: 1.05, pct: 5,  code: "5M",  note: "Up to 5% over MPM." },
    { maxRatio: 1.10, pct: 10, code: "10M", note: "Up to 10% over MPM." },
    { maxRatio: 1.15, pct: 15, code: "15M", note: "Up to 15% over MPM." },
    { maxRatio: 1.20, pct: 20, code: "20M", note: "Up to 20% over MPM." },
    { maxRatio: 1.25, pct: 25, code: "25M", note: "Up to 25% over MPM (the maximum)." }
  ];

  /* ----------------------------------------------------------------------
     8. Reference ROE snapshot (illustrative — real values come from IATA)
     Country of commencement -> currency & an approximate NUC->local factor.
     ---------------------------------------------------------------------- */
  const ROE_TABLE = [
    { ccy: "AED", country: "UAE (Abu Dhabi/Dubai)", roe: 3.6725, note: "AED is pegged to USD, so ROE ≈ 3.6725." },
    { ccy: "INR", country: "India (Delhi/Mumbai)",   roe: 83.0,   note: "Illustrative; the IATA ROE floats." },
    { ccy: "LKR", country: "Sri Lanka (Colombo)",    roe: 300.0,  note: "Illustrative." },
    { ccy: "GBP", country: "United Kingdom (London)", roe: 0.79,  note: "Illustrative." },
    { ccy: "USD", country: "United States",           roe: 1.0,   note: "NUC ≈ USD, so ROE = 1.0." },
    { ccy: "EUR", country: "Eurozone",                roe: 0.92,  note: "Illustrative." }
  ];

  /* ----------------------------------------------------------------------
     9. Small geographic utility — great-circle distance (haversine).
     Used as a transparent PROXY for TPM so the calculators are self-
     consistent. Real fares must use the official IATA TPM manual values.
     ---------------------------------------------------------------------- */
  function haversineMiles(a, b) {
    const R = 3958.7613; // Earth mean radius, statute miles
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const la1 = toRad(a.lat);
    const la2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  const byCode = {};
  AIRPORTS.forEach((a) => (byCode[a.iata] = a));
  function airport(code) {
    return byCode[String(code || "").toUpperCase()] || null;
  }

  // Segment miles between two IATA codes (great-circle proxy for TPM).
  function segmentMiles(fromCode, toCode) {
    const a = airport(fromCode);
    const b = airport(toCode);
    if (!a || !b) return null;
    return Math.round(haversineMiles(a, b));
  }

  // Match a GeoJSON country name to the airports we hold there.
  const COUNTRY_ALIAS = {
    "united states of america": "usa",
    "united states": "usa",
    "united arab emirates": "uae",
    "turkey": "türkiye",
    "hong kong s.a.r.": "hong kong",
    "czechia": "czech republic",
    "republic of korea": "south korea"
  };
  function normCountry(n) {
    const k = String(n || "").toLowerCase().trim();
    return COUNTRY_ALIAS[k] || k;
  }
  function airportsInCountry(name) {
    const key = normCountry(name);
    return AIRPORTS.filter((a) => normCountry(a.country) === key);
  }

  /* ----------------------------------------------------------------------
     10. Country (ISO_A2) -> IATA area lookup, for shading the globe.
     Continent is the fallback; a Middle-East override moves Western-Asian
     countries into TC2 where IATA places them.
     ---------------------------------------------------------------------- */
  const MIDDLE_EAST = new Set([
    "AE","SA","QA","OM","YE","KW","BH","IQ","IR","JO","IL","PS","LB","SY","TR",
    "CY","GE","AM","AZ"
  ]);
  // Countries in continent "Asia" that IATA keeps in TC3 explicitly (rest of
  // Asia). We rely on continent+Middle-East override, so no extra list needed.

  function areaForFeature(props) {
    const iso = (props.ISO_A2 || props.iso_a2 || "").toUpperCase();
    const cont = props.CONTINENT || props.continent || "";
    if (MIDDLE_EAST.has(iso)) return "TC2";
    switch (cont) {
      case "North America":
      case "South America":
        return "TC1";
      case "Europe":
      case "Africa":
        return "TC2";
      case "Asia":
        return "TC3";
      case "Oceania":
      case "Seven seas (open ocean)":
        return "TC3";
      default:
        return null; // Antarctica etc.
    }
  }

  /* ----------------------------------------------------------------------
     Expose everything on a single global namespace.
     ---------------------------------------------------------------------- */
  window.PP = {
    AREAS,
    GLOBAL_INDICATORS,
    AIRPORTS,
    CARRIERS,
    ROUTES,
    TOPICS,
    FARE_TERMS,
    EMS_STEPS,
    ROE_TABLE,
    util: {
      haversineMiles,
      airport,
      segmentMiles,
      airportsInCountry,
      areaForFeature,
      areaColor: (code) => (AREAS[code] ? AREAS[code].color : "#8894a8")
    }
  };
})();
