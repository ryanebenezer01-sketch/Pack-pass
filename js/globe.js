/* =========================================================================
   Pack-Pass Atlas — 3D GLOBE
   -------------------------------------------------------------------------
   Uses globe.gl (a ThreeJS/WebGL wrapper) to render an interactive Earth:
     - countries shaded by IATA Traffic Conference area (TC1/TC2/TC3)
     - airports as clickable labelled markers, coloured by area
     - the selected routing drawn as animated great-circle arcs
   All state lives in a closure; PP.initGlobe() is called once when the
   Globe tab is first shown.
   ========================================================================= */
(function () {
  "use strict";

  const state = {
    globe: null,
    built: false,
    countries: [],
    routeId: "auh-del-cmb",
    filterArea: "ALL",
    showAirports: true,
    showCountries: true,
    autoRotate: true
  };

  const COUNTRIES_URLS = [
    // Local vendored copy first (works offline); CDN mirrors as a fallback.
    "assets/countries.geojson",
    "https://cdn.jsdelivr.net/npm/three-globe/example/datasets/ne_110m_admin_0_countries.geojson",
    "https://unpkg.com/three-globe/example/datasets/ne_110m_admin_0_countries.geojson"
  ];

  function el(id) { return document.getElementById(id); }

  /* ---- Build the arc list for the currently-selected routing ---------- */
  function currentSegments() {
    if (state.routeId === "none") return [];
    const route = PP.ROUTES.find((r) => r.id === state.routeId);
    if (!route) return [];
    const A = PP.util.airport;
    return route.segments
      .map((s) => {
        const from = A(s.from), to = A(s.to);
        if (!from || !to) return null;
        return {
          startLat: from.lat, startLng: from.lng,
          endLat: to.lat, endLng: to.lng,
          from: s.from, to: s.to, carrier: s.carrier, gi: s.gi,
          color: [PP.util.areaColor(from.area), PP.util.areaColor(to.area)]
        };
      })
      .filter(Boolean);
  }

  /* ---- Airports honouring the area filter ----------------------------- */
  function visibleAirports() {
    if (!state.showAirports) return [];
    if (state.filterArea === "ALL") return PP.AIRPORTS;
    return PP.AIRPORTS.filter((a) => a.area === state.filterArea);
  }

  function applyLayers() {
    const g = state.globe;
    if (!g) return;

    g.polygonsData(state.showCountries ? state.countries : []);

    g.labelsData(visibleAirports());

    g.arcsData(currentSegments());
    g.controls().autoRotate = state.autoRotate;
  }

  /* ---- Side info panel ------------------------------------------------ */
  function showAirportInfo(a) {
    const panel = el("globe-info");
    if (!panel) return;
    const area = PP.AREAS[a.area];
    const usedIn = PP.ROUTES.filter((r) =>
      r.segments.some((s) => s.from === a.iata || s.to === a.iata)
    ).map((r) => r.name);

    panel.innerHTML =
      '<button class="info-close" aria-label="Close">×</button>' +
      '<div class="info-code" style="color:' + area.color + '">' + a.iata + "</div>" +
      "<h3>" + a.city + "</h3>" +
      '<div class="info-sub">' + a.country + "</div>" +
      '<div class="chip" style="border-color:' + area.color + ';color:' + area.color + '">' +
        a.area + " · " + area.name.split("—")[0].trim() + "</div>" +
      '<div class="chip subchip">' + a.sub + "</div>" +
      "<h4>Terminals</h4><ul class='term-list'>" +
        a.terminals.map((t) => "<li>" + t + "</li>").join("") +
      "</ul>" +
      "<h4>Coordinates</h4><div class='info-mono'>" +
        a.lat.toFixed(4) + "°, " + a.lng.toFixed(4) + "°</div>" +
      (usedIn.length
        ? "<h4>Featured in routings</h4><ul class='term-list'>" +
          usedIn.map((n) => "<li>" + n + "</li>").join("") + "</ul>"
        : "");
    panel.classList.add("open");
    panel.querySelector(".info-close").onclick = () => panel.classList.remove("open");
  }

  /* ---- Fetch country polygons (best-effort; globe still works without) - */
  async function loadCountries() {
    for (const url of COUNTRIES_URLS) {
      try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) continue;
        const geo = await res.json();
        const feats = (geo.features || []).filter((f) => {
          f.__area = PP.util.areaForFeature(f.properties || {});
          return f.__area;
        });
        if (feats.length) return feats;
      } catch (e) {
        /* try next mirror */
      }
    }
    return [];
  }

  /* ---- Public initialiser -------------------------------------------- */
  async function initGlobe() {
    if (state.built) { onResize(); return; }
    const holder = el("globe-canvas");
    if (!holder) return;

    if (typeof Globe !== "function") {
      holder.innerHTML =
        '<div class="globe-fallback">🌐 The 3D globe library could not load.<br>' +
        "This page needs an internet connection the first time so it can fetch " +
        "the WebGL globe engine from a CDN. Reconnect and reload.</div>";
      return;
    }
    state.built = true;

    const g = Globe()(holder)
      .backgroundColor("rgba(0,0,0,0)")
      .showGlobe(true)
      .showGraticules(true)
      .showAtmosphere(true)
      .atmosphereColor("#4fd1ff")
      .atmosphereAltitude(0.16)
      // countries
      .polygonCapColor((f) => hexA(PP.util.areaColor(f.__area), 0.55))
      .polygonSideColor(() => "rgba(6,12,24,0.35)")
      .polygonStrokeColor(() => "rgba(3,7,16,0.9)")
      .polygonAltitude(0.008)
      .polygonLabel((f) => {
        const p = f.properties || {};
        const name = p.ADMIN || p.NAME || p.name || "";
        const area = PP.AREAS[f.__area];
        return '<div class="poly-tip"><b>' + name + "</b><br>" +
               area.code + " · " + area.name.split("—")[0].trim() + "</div>";
      })
      // airports
      .labelsData(PP.AIRPORTS)
      .labelLat("lat").labelLng("lng")
      .labelText("iata")
      .labelSize(0.62)
      .labelDotRadius(0.34)
      .labelColor((a) => PP.util.areaColor(a.area))
      .labelResolution(2)
      .labelLabel((a) =>
        '<div class="poly-tip"><b>' + a.iata + "</b> — " + a.city +
        "<br>" + a.country + " · " + a.area + "</div>")
      .onLabelClick((a) => showAirportInfo(a))
      // arcs
      .arcStartLat("startLat").arcStartLng("startLng")
      .arcEndLat("endLat").arcEndLng("endLng")
      .arcColor("color")
      .arcAltitudeAutoScale(0.45)
      .arcStroke(0.6)
      .arcDashLength(0.45)
      .arcDashGap(0.25)
      .arcDashAnimateTime(2600)
      .arcLabel((s) =>
        '<div class="poly-tip"><b>' + s.from + " → " + s.to + "</b><br>" +
        (PP.CARRIERS[s.carrier] || s.carrier) + " · GI " + s.gi + "<br>" +
        "≈ " + PP.util.segmentMiles(s.from, s.to).toLocaleString() + " mi (GC)</div>");

    // solid dark ocean instead of a photo texture (works fully offline once
    // the engine is cached, and keeps the thematic area colours readable)
    try { g.globeMaterial().color.set("#0a1626"); } catch (e) {}

    g.controls().autoRotate = state.autoRotate;
    g.controls().autoRotateSpeed = 0.42;
    g.pointOfView({ lat: 24, lng: 55, altitude: 2.4 }, 0); // centre on the Gulf

    state.globe = g;
    onResize();

    // Fetch country shading in the background.
    loadCountries().then((feats) => {
      state.countries = feats;
      if (!feats.length) {
        const n = el("globe-countries-note");
        if (n) n.textContent = "Country shading offline — airports & routes still work.";
      }
      applyLayers();
    });

    applyLayers();
  }

  function onResize() {
    const holder = el("globe-canvas");
    if (!holder || !state.globe) return;
    const w = holder.clientWidth || holder.offsetWidth;
    const h = holder.clientHeight || 520;
    state.globe.width(w).height(h);
  }

  /* ---- helpers -------------------------------------------------------- */
  function hexA(hex, a) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  /* ---- Wire up the control widgets (called from app.js) --------------- */
  function bindControls() {
    const routeSel = el("globe-route");
    if (routeSel) {
      routeSel.innerHTML =
        '<option value="none">— none —</option>' +
        PP.ROUTES.map((r) => '<option value="' + r.id + '">' + r.name + "</option>").join("");
      routeSel.value = state.routeId;
      routeSel.onchange = () => {
        state.routeId = routeSel.value;
        const note = el("globe-route-note");
        const r = PP.ROUTES.find((x) => x.id === state.routeId);
        if (note) note.textContent = r ? r.note : "";
        applyLayers();
      };
      routeSel.onchange();
    }

    const areaSel = el("globe-area");
    if (areaSel) {
      areaSel.onchange = () => { state.filterArea = areaSel.value; applyLayers(); };
    }

    bindToggle("toggle-countries", state.showCountries, (v) => { state.showCountries = v; applyLayers(); });
    bindToggle("toggle-airports", state.showAirports, (v) => { state.showAirports = v; applyLayers(); });
    bindToggle("toggle-rotate", state.autoRotate, (v) => { state.autoRotate = v; applyLayers(); });
  }

  function bindToggle(id, initial, cb) {
    const t = el(id);
    if (!t) return;
    t.checked = initial;
    t.onchange = () => cb(t.checked);
  }

  window.addEventListener("resize", onResize);

  PP.initGlobe = initGlobe;
  PP.bindGlobeControls = bindControls;
})();
