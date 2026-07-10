/* =========================================================================
   Pack-Pass Atlas — 3D GLOBE
   -------------------------------------------------------------------------
   A cinematic, interactive Earth (globe.gl / ThreeJS) with three "looks":
     - Night   : satellite Earth with glowing city lights + neon flight arcs
     - Day     : blue-marble Earth with clouds
     - Areas   : the flat thematic map shaded by IATA area (TC1/TC2/TC3)
   Click an AIRPORT code to learn its hub, terminals and speciality.
   Click a COUNTRY to see its IATA area and the airports it holds.
   Everything is vendored locally (js/vendor + assets), so it runs offline.
   ========================================================================= */
(function () {
  "use strict";

  const TEX = {
    day: "assets/textures/earth-blue-marble.jpg",
    night: "assets/textures/earth-night.jpg",
    bump: "assets/textures/earth-topology.png",
    stars: "assets/textures/night-sky.jpg"
  };

  const COUNTRIES_URLS = [
    "assets/countries.geojson",
    "https://cdn.jsdelivr.net/npm/three-globe/example/datasets/ne_110m_admin_0_countries.geojson"
  ];

  const state = {
    globe: null,
    built: false,
    countries: [],
    routeId: "auh-del-cmb",
    filterArea: "ALL",
    look: "night", // night | day | areas
    showAirports: true,
    showCountries: true,
    showBorders: true,
    autoRotate: true
  };

  const el = (id) => document.getElementById(id);

  /* ---- route arcs ----------------------------------------------------- */
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
          color: ["#7dfcff", "#4f8bff"]
        };
      })
      .filter(Boolean);
  }

  // airports that should pulse (the ones on the shown routing)
  function routeAirports() {
    const segs = currentSegments();
    const codes = new Set();
    segs.forEach((s) => { codes.add(s.from); codes.add(s.to); });
    return PP.AIRPORTS.filter((a) => codes.has(a.iata));
  }

  function visibleAirports() {
    if (!state.showAirports) return [];
    if (state.filterArea === "ALL") return PP.AIRPORTS;
    return PP.AIRPORTS.filter((a) => a.area === state.filterArea);
  }

  /* ---- per-look styling ---------------------------------------------- */
  function polyCap(f) {
    // In realistic looks the countries are invisible but still clickable;
    // in "areas" look they are shaded by IATA area.
    if (state.look === "areas" && state.showCountries) {
      return hexA(PP.util.areaColor(f.__area), 0.6);
    }
    return "rgba(0,0,0,0)";
  }
  function polyStroke() {
    if (state.look === "areas") return "rgba(3,7,16,0.9)";
    return state.showBorders ? "rgba(190,220,255,0.16)" : "rgba(0,0,0,0)";
  }

  function applyLook() {
    const g = state.globe;
    if (!g) return;
    if (state.look === "night") g.globeImageUrl(TEX.night);
    else if (state.look === "day") g.globeImageUrl(TEX.day);
    else {
      g.globeImageUrl(null);
      try { g.globeMaterial().color.set("#0a1626"); } catch (e) {}
    }
    g.atmosphereColor(state.look === "day" ? "#8ec5ff" : "#5aa9ff");
    applyLayers();
  }

  function applyLayers() {
    const g = state.globe;
    if (!g) return;
    g.polygonsData(state.countries);           // always present (for clicks)
    g.polygonCapColor(polyCap).polygonStrokeColor(polyStroke);
    g.labelsData(visibleAirports());
    g.arcsData(currentSegments());
    g.ringsData(state.showAirports ? routeAirports() : []);
    g.controls().autoRotate = state.autoRotate;
  }

  /* ---- info panels ---------------------------------------------------- */
  function panel() { return el("globe-info"); }
  function openPanel(html) {
    const p = panel();
    if (!p) return;
    p.innerHTML = '<button class="info-close" aria-label="Close">×</button>' + html;
    p.classList.add("open");
    p.querySelector(".info-close").onclick = () => p.classList.remove("open");
  }

  function showAirportInfo(a) {
    const area = PP.AREAS[a.area];
    const usedIn = PP.ROUTES.filter((r) =>
      r.segments.some((s) => s.from === a.iata || s.to === a.iata)
    ).map((r) => r.name);

    openPanel(
      '<div class="info-code" style="color:' + area.color + '">' + a.iata + "</div>" +
      "<h3>" + a.city + "</h3>" +
      '<div class="info-sub">' + a.country + "</div>" +
      '<div class="chip" style="border-color:' + area.color + ';color:' + area.color + '">' +
        a.area + " · " + area.name.split("—")[0].trim() + "</div>" +
      '<div class="chip subchip">' + a.sub + "</div>" +
      (a.specialty ? '<h4>Speciality</h4><p class="info-p">' + a.specialty + "</p>" : "") +
      (a.hub ? '<h4>Home / hub carrier</h4><p class="info-p">' + a.hub + "</p>" : "") +
      "<h4>Terminals</h4><ul class='term-list'>" +
        a.terminals.map((t) => "<li>" + t + "</li>").join("") + "</ul>" +
      "<h4>Coordinates</h4><div class='info-mono'>" +
        a.lat.toFixed(4) + "°, " + a.lng.toFixed(4) + "°</div>" +
      (usedIn.length
        ? "<h4>Featured in routings</h4><ul class='term-list'>" +
          usedIn.map((n) => "<li>" + n + "</li>").join("") + "</ul>"
        : "")
    );
  }

  function showCountryInfo(f) {
    const p = f.properties || {};
    const name = p.ADMIN || p.NAME || p.name || "This country";
    const area = PP.AREAS[f.__area];
    const airports = PP.util.airportsInCountry(name);
    openPanel(
      '<div class="info-kicker">Country</div>' +
      "<h3>" + name + "</h3>" +
      (p.SUBREGION ? '<div class="info-sub">' + p.SUBREGION + "</div>" : "") +
      (area
        ? '<div class="chip" style="border-color:' + area.color + ';color:' + area.color +
          '">' + area.code + " · " + area.name + "</div>" +
          '<p class="info-p">' + area.blurb + "</p>"
        : '<p class="info-p">Outside the three IATA traffic areas.</p>') +
      "<h4>Airports in this atlas</h4>" +
      (airports.length
        ? '<div class="country-airports">' +
          airports
            .map(
              (a) =>
                '<button class="ap-pill" data-iata="' + a.iata + '">' +
                "<b>" + a.iata + "</b> " + a.city +
                (a.specialty ? '<span>' + a.specialty + "</span>" : "") + "</button>"
            )
            .join("") +
          "</div>"
        : "<p class='info-p muted'>No major airport for this country in the atlas yet — " +
          "but you now know its IATA area.</p>")
    );
    panel()
      .querySelectorAll(".ap-pill")
      .forEach((b) => (b.onclick = () => {
        const a = PP.util.airport(b.dataset.iata);
        if (a) { showAirportInfo(a); flyTo(a); }
      }));
  }

  function flyTo(a) {
    if (state.globe) state.globe.pointOfView({ lat: a.lat, lng: a.lng, altitude: 1.6 }, 900);
  }

  /* ---- countries ------------------------------------------------------ */
  async function loadCountries() {
    for (const url of COUNTRIES_URLS) {
      try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) continue;
        const geo = await res.json();
        const feats = (geo.features || []).filter((f) => {
          f.__area = PP.util.areaForFeature(f.properties || {});
          return true; // keep all for clicking; __area may be null (poles)
        });
        if (feats.length) return feats;
      } catch (e) { /* next mirror */ }
    }
    return [];
  }

  /* ---- init ----------------------------------------------------------- */
  async function initGlobe() {
    if (state.built) { onResize(); return; }
    const holder = el("globe-canvas");
    if (!holder) return;
    if (typeof Globe !== "function") {
      holder.innerHTML =
        '<div class="globe-fallback">🌐 The 3D globe engine failed to load.<br>' +
        "Make sure <code>js/vendor/globe.gl.min.js</code> is present, then reload.</div>";
      return;
    }
    state.built = true;

    const g = Globe()(holder)
      .backgroundImageUrl(TEX.stars)
      .backgroundColor("#05070f")
      .showGlobe(true)
      .showGraticules(false)
      .bumpImageUrl(TEX.bump)
      .showAtmosphere(true)
      .atmosphereColor("#5aa9ff")
      .atmosphereAltitude(0.2)
      // countries (clickable everywhere; shaded only in "areas" look)
      .polygonCapColor(polyCap)
      .polygonSideColor(() => "rgba(6,12,24,0.15)")
      .polygonStrokeColor(polyStroke)
      .polygonAltitude(0.006)
      .polygonLabel((f) => {
        const p = f.properties || {};
        const name = p.ADMIN || p.NAME || "";
        const area = PP.AREAS[f.__area];
        return '<div class="poly-tip"><b>' + name + "</b>" +
          (area ? "<br>" + area.code + " · click to explore" : "") + "</div>";
      })
      .onPolygonClick((f) => showCountryInfo(f))
      // airports
      .labelsData(PP.AIRPORTS)
      .labelLat("lat").labelLng("lng")
      .labelText("iata")
      .labelSize(0.6)
      .labelDotRadius(0.32)
      .labelColor((a) => PP.util.areaColor(a.area))
      .labelResolution(2)
      .labelLabel((a) =>
        '<div class="poly-tip"><b>' + a.iata + "</b> — " + a.city +
        "<br>" + a.country + " · " + a.area +
        (a.hub ? "<br>Hub: " + a.hub : "") + "</div>")
      .onLabelClick((a) => { showAirportInfo(a); flyTo(a); })
      // glowing flight arcs
      .arcStartLat("startLat").arcStartLng("startLng")
      .arcEndLat("endLat").arcEndLng("endLng")
      .arcColor("color")
      .arcAltitudeAutoScale(0.5)
      .arcStroke(0.7)
      .arcDashLength(0.4).arcDashGap(0.18).arcDashAnimateTime(2200)
      .arcsTransitionDuration(0)
      .arcLabel((s) =>
        '<div class="poly-tip"><b>' + s.from + " → " + s.to + "</b><br>" +
        (PP.CARRIERS[s.carrier] || s.carrier) + " · GI " + s.gi + "<br>≈ " +
        PP.util.segmentMiles(s.from, s.to).toLocaleString() + " mi (GC)</div>")
      // pulsing rings on the route's airports
      .ringLat("lat").ringLng("lng")
      .ringColor((a) => { const c = hexRGB(PP.util.areaColor(a.area)); return (t) => "rgba(" + c + "," + (1 - t) + ")"; })
      .ringMaxRadius(3.2)
      .ringPropagationSpeed(1.6)
      .ringRepeatPeriod(1500);

    g.controls().autoRotate = state.autoRotate;
    g.controls().autoRotateSpeed = 0.4;
    g.pointOfView({ lat: 22, lng: 60, altitude: 2.5 }, 0);

    state.globe = g;
    applyLook();
    onResize();

    loadCountries().then((feats) => {
      state.countries = feats;
      if (!feats.length) {
        const n = el("globe-countries-note");
        if (n) n.textContent = "Country data offline — airports & routes still work.";
      }
      applyLayers();
    });
  }

  function onResize() {
    const holder = el("globe-canvas");
    if (!holder || !state.globe) return;
    state.globe.width(holder.clientWidth || 800).height(holder.clientHeight || 520);
  }

  /* ---- helpers -------------------------------------------------------- */
  function hexRGB(hex) {
    const h = hex.replace("#", "");
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)].join(",");
  }
  function hexA(hex, a) { return "rgba(" + hexRGB(hex) + "," + a + ")"; }

  /* ---- controls ------------------------------------------------------- */
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

    const lookSel = el("globe-look");
    if (lookSel) {
      lookSel.value = state.look;
      lookSel.onchange = () => { state.look = lookSel.value; applyLook(); };
    }

    const areaSel = el("globe-area");
    if (areaSel) areaSel.onchange = () => { state.filterArea = areaSel.value; applyLayers(); };

    bindToggle("toggle-borders", state.showBorders, (v) => { state.showBorders = v; applyLayers(); });
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
