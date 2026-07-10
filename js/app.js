/* =========================================================================
   Pack-Pass Atlas — APP SHELL
   Tab navigation + rendering of the terminology, areas, global-indicator
   and glossary content. Lazily initialises the globe / calculator when
   their tab is first opened.
   ========================================================================= */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const initialised = {};

  /* ---- Tab navigation ------------------------------------------------- */
  function showTab(id) {
    document.querySelectorAll(".tab-panel").forEach((p) =>
      p.classList.toggle("active", p.id === "tab-" + id)
    );
    document.querySelectorAll(".nav-btn").forEach((b) =>
      b.classList.toggle("active", b.dataset.tab === id)
    );

    if (id === "globe" && !initialised.globe) {
      initialised.globe = true;
      PP.bindGlobeControls();
      PP.initGlobe();
    } else if (id === "globe") {
      PP.initGlobe(); // triggers a resize
    }
    if (id === "fare" && !initialised.fare) {
      initialised.fare = true;
      PP.initCalculator();
    }
    location.hash = id;
  }

  /* ---- Legend + area cards ------------------------------------------- */
  function renderAreas() {
    const legend = $("area-legend");
    if (legend) {
      legend.innerHTML = Object.values(PP.AREAS)
        .map(
          (a) =>
            '<span class="legend-item"><span class="dot" style="background:' +
            a.color + '"></span>' + a.code + "</span>"
        )
        .join("");
    }

    const cards = $("area-cards");
    if (cards) {
      cards.innerHTML = Object.values(PP.AREAS)
        .map(
          (a) =>
            '<div class="area-card" style="border-top:3px solid ' + a.color + '">' +
            '<div class="area-code" style="color:' + a.color + '">' + a.code + "</div>" +
            "<h3>" + a.name + "</h3><p>" + a.blurb + "</p>" +
            "<h4>Sub-areas</h4><ul class='term-list'>" +
            a.subareas.map((s) => "<li>" + s + "</li>").join("") +
            "</ul></div>"
        )
        .join("");
    }

    const gi = $("gi-table");
    if (gi) {
      gi.innerHTML =
        "<table class='calc-table'><thead><tr><th>GI</th><th>Name</th><th>Meaning</th></tr></thead><tbody>" +
        PP.GLOBAL_INDICATORS.map(
          (g) =>
            "<tr><td><b>" + g.gi + "</b></td><td>" + g.name + "</td><td>" + g.desc + "</td></tr>"
        ).join("") +
        "</tbody></table>";
    }
  }

  /* ---- Terminology topic cards --------------------------------------- */
  function renderTopics() {
    const wrap = $("topic-groups");
    if (!wrap) return;
    wrap.innerHTML = PP.TOPICS.map(
      (g) =>
        '<section class="topic-group"><h3 class="topic-title">' + g.group + "</h3>" +
        '<div class="topic-grid">' +
        g.items
          .map(
            (it) =>
              '<div class="topic-card"><h4>' + it.term + "</h4><p>" + it.body + "</p></div>"
          )
          .join("") +
        "</div></section>"
    ).join("");
  }

  /* ---- Glossary (searchable) ----------------------------------------- */
  function renderGlossary(filter) {
    const wrap = $("glossary-list");
    if (!wrap) return;
    const q = (filter || "").trim().toLowerCase();
    const terms = PP.FARE_TERMS.filter(
      (t) =>
        !q ||
        t.abbr.toLowerCase().includes(q) ||
        t.full.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q)
    );
    wrap.innerHTML =
      terms.length === 0
        ? "<div class='hint'>No terms match “" + filter + "”.</div>"
        : terms
            .map(
              (t) =>
                '<div class="gloss-item"><div class="gloss-head"><span class="gloss-abbr">' +
                t.abbr + '</span><span class="gloss-grp">' + t.grp + "</span></div>" +
                '<div class="gloss-full">' + t.full + "</div>" +
                '<div class="gloss-desc">' + t.desc + "</div></div>"
            )
            .join("");
  }

  /* ---- EMS band reference table -------------------------------------- */
  function renderEmsTable() {
    const wrap = $("ems-table");
    if (!wrap) return;
    wrap.innerHTML =
      "<table class='calc-table'><thead><tr><th>Band</th><th>Ratio ΣTPM÷MPM up to</th>" +
      "<th>Surcharge</th><th>Meaning</th></tr></thead><tbody>" +
      PP.EMS_STEPS.map(
        (s) =>
          "<tr><td><b>" + s.code + "</b></td><td class='num'>" + s.maxRatio.toFixed(2) +
          "</td><td class='num'>" + s.pct + "%</td><td>" + s.note + "</td></tr>"
      ).join("") +
      "<tr><td><b>OVER 25M</b></td><td class='num'>&gt; 1.25</td><td class='num warn'>invalid</td>" +
      "<td>Break the fare (add a stopover / fare-break point).</td></tr>" +
      "</tbody></table>";
  }

  /* ---- Boot ----------------------------------------------------------- */
  function boot() {
    renderAreas();
    renderTopics();
    renderGlossary("");
    renderEmsTable();

    document.querySelectorAll(".nav-btn").forEach((b) => {
      b.onclick = () => showTab(b.dataset.tab);
    });

    const search = $("glossary-search");
    if (search) search.oninput = () => renderGlossary(search.value);

    // close the globe info panel when clicking its backdrop button is handled
    // inside globe.js; here we just honour a deep-link hash.
    const start = (location.hash || "#globe").replace("#", "");
    showTab(["globe", "terms", "fare", "glossary"].includes(start) ? start : "globe");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
