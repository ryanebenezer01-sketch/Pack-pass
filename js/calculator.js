/* =========================================================================
   Pack-Pass Atlas — FARE LAB
   -------------------------------------------------------------------------
   A teaching calculator for IATA fare construction. It computes, from a
   routing you type:
     - per-segment TPM (great-circle proxy) and their sum
     - the Excess Mileage Surcharge (EMS) band against an MPM
     - the surcharged NUC and its conversion to a Local Currency Fare (ROE)
   plus a Higher-Intermediate-Point (HIP) check and the fully worked
   AUH -> DEL -> CMB example.
   ========================================================================= */
(function () {
  "use strict";

  const U = () => PP.util;
  const $ = (id) => document.getElementById(id);
  const money = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const miles = (n) => Math.round(n).toLocaleString();

  /* ---------- Core engine ---------------------------------------------- */

  // Parse "AUH-DEL-CMB" or "AUH DEL CMB" into an array of airport codes.
  function parseRoute(str) {
    return String(str || "")
      .toUpperCase()
      .split(/[^A-Z]+/)
      .filter((c) => c.length === 3);
  }

  // Build the segment table with TPM proxies.
  function buildSegments(codes) {
    const segs = [];
    for (let i = 0; i < codes.length - 1; i++) {
      const from = U().airport(codes[i]);
      const to = U().airport(codes[i + 1]);
      const tpm = from && to ? U().segmentMiles(codes[i], codes[i + 1]) : null;
      segs.push({ from: codes[i], to: codes[i + 1], fromA: from, toA: to, tpm });
    }
    return segs;
  }

  // Excess-mileage-surcharge band from Σ(TPM), MPM and EMA.
  function emsBand(sumTPM, mpm, ema) {
    const eff = Math.max(0, sumTPM - (ema || 0));
    const ratio = mpm > 0 ? eff / mpm : Infinity;
    for (const step of PP.EMS_STEPS) {
      if (ratio <= step.maxRatio + 1e-9) {
        return { ...step, ratio, eff, invalid: false };
      }
    }
    return {
      code: "OVER 25M",
      pct: null,
      ratio,
      eff,
      invalid: true,
      note: "Exceeds 25% over MPM — the component is INVALID and the fare must be re-broken (add a fare-break point / stopover)."
    };
  }

  /* ---------- Mileage + EMS calculator UI ------------------------------ */
  function runMileage() {
    const codes = parseRoute($("mlg-route").value);
    const mpmInput = parseFloat($("mlg-mpm").value);
    const ema = parseFloat($("mlg-ema").value) || 0;
    const baseNUC = parseFloat($("mlg-nuc").value) || 0;

    const segs = buildSegments(codes);
    const known = segs.filter((s) => s.tpm != null);
    const sumTPM = known.reduce((a, s) => a + s.tpm, 0);

    const out = $("mlg-out");
    if (codes.length < 2) {
      out.innerHTML = '<div class="hint">Enter at least two airport codes, e.g. <code>AUH-DEL-CMB</code>.</div>';
      return;
    }

    const unknown = segs.filter((s) => s.tpm == null);
    // If MPM left blank, suggest an illustrative O&D × 1.20.
    const od = U().segmentMiles(codes[0], codes[codes.length - 1]);
    const mpm = !isNaN(mpmInput) && mpmInput > 0 ? mpmInput : od ? Math.round(od * 1.2) : 0;
    const usedSuggestedMPM = isNaN(mpmInput) || mpmInput <= 0;

    const band = emsBand(sumTPM, mpm, ema);

    const segRows = segs
      .map((s) => {
        const label =
          (s.fromA ? s.fromA.city : s.from) + " → " + (s.toA ? s.toA.city : s.to);
        return (
          "<tr><td>" + s.from + "–" + s.to + "</td><td>" + label + "</td><td class='num'>" +
          (s.tpm != null ? miles(s.tpm) : "<span class='warn'>unknown</span>") + "</td></tr>"
        );
      })
      .join("");

    const bandBadge = band.invalid
      ? '<span class="badge badge-bad">' + band.code + "</span>"
      : '<span class="badge" style="background:' +
        (band.pct === 0 ? "#0f7a4d" : "#8a5a00") + '">' + band.code +
        " · " + band.pct + "%</span>";

    const surchargedNUC = baseNUC && !band.invalid ? baseNUC * (1 + band.pct / 100) : null;

    out.innerHTML =
      "<table class='calc-table'><thead><tr><th>Coupon</th><th>Sector</th>" +
      "<th class='num'>TPM (GC mi)</th></tr></thead><tbody>" + segRows +
      "<tr class='sum'><td colspan='2'>Σ TPM (sum of ticketed-point mileages)</td>" +
      "<td class='num'>" + miles(sumTPM) + "</td></tr>" +
      (ema ? "<tr><td colspan='2'>− EMA (extra mileage allowance)</td><td class='num'>−" + miles(ema) + "</td></tr>" : "") +
      "<tr class='sum'><td colspan='2'>Effective mileage flown</td><td class='num'>" + miles(band.eff) + "</td></tr>" +
      "<tr><td colspan='2'>MPM (maximum permitted mileage)" +
        (usedSuggestedMPM ? " <span class='hint-inline'>≈ O&amp;D×1.20, illustrative</span>" : "") +
        "</td><td class='num'>" + miles(mpm) + "</td></tr>" +
      "<tr><td colspan='2'>Ratio = effective ÷ MPM</td><td class='num'>" + band.ratio.toFixed(4) + "</td></tr>" +
      "</tbody></table>" +
      "<div class='result-line'>Excess Mileage Surcharge: " + bandBadge + "</div>" +
      (band.note ? "<div class='hint " + (band.invalid ? "warn" : "") + "'>" + band.note + "</div>" : "") +
      (unknown.length
        ? "<div class='hint warn'>No coordinates for: " +
          unknown.map((s) => s.from + "/" + s.to).join(", ") +
          " — those coupons were skipped.</div>"
        : "") +
      (baseNUC
        ? "<div class='result-line'>Base fare " + money(baseNUC) + " NUC × (1 + " +
          (band.invalid ? "—" : band.pct) + "%) = <b>" +
          (surchargedNUC != null ? money(surchargedNUC) + " NUC" : "n/a (re-break the fare)") +
          "</b></div>"
        : "<div class='hint'>Tip: add a base NUC fare above to see the surcharge applied.</div>") +
      "<div class='hint'>TPM here is a great-circle proxy so the tool is self-consistent. " +
      "Real tickets use the exact published values from the IATA <b>TPM</b> and <b>MPM</b> manuals.</div>";

    // hand the surcharged NUC to the currency box if present
    if (surchargedNUC != null) {
      const nucField = $("cur-nuc");
      if (nucField && !nucField.dataset.touched) nucField.value = surchargedNUC.toFixed(2);
      updateCurrency();
    }
  }

  /* ---------- NUC -> Local Currency converter -------------------------- */
  function fillRoeOptions() {
    const sel = $("cur-roe-pick");
    if (!sel) return;
    sel.innerHTML = PP.ROE_TABLE.map(
      (r, i) =>
        '<option value="' + r.roe + '" data-ccy="' + r.ccy + '">' +
        r.ccy + " — " + r.country + " (ROE " + r.roe + ")</option>"
    ).join("");
  }

  function updateCurrency() {
    const nuc = parseFloat($("cur-nuc").value) || 0;
    const roe = parseFloat($("cur-roe").value) || 0;
    const pick = $("cur-roe-pick");
    const ccy = pick && pick.selectedOptions[0] ? pick.selectedOptions[0].dataset.ccy : "";
    const raw = nuc * roe;
    // Fare-rounding: round UP to nearest whole unit (illustrative).
    const lcf = Math.ceil(raw);
    $("cur-out").innerHTML =
      "<div class='result-line'>LCF = NUC × ROE = " + money(nuc) + " × " + roe +
      " = <b>" + money(raw) + "</b></div>" +
      "<div class='result-line'>Rounded up to the fare unit: <b>" +
      lcf.toLocaleString() + " " + ccy + "</b></div>" +
      "<div class='hint'>The ROE (IATA Rate of Exchange) of the <b>country where the journey starts</b> " +
      "converts the neutral NUC total into money the passenger actually pays.</div>";
  }

  /* ---------- HIP check ------------------------------------------------ */
  function runHIP() {
    const through = parseFloat($("hip-through").value) || 0;
    const rows = Array.from(document.querySelectorAll("#hip-rows .hip-row"));
    const inters = rows
      .map((r) => ({
        label: r.querySelector(".hip-label").value || "intermediate pair",
        fare: parseFloat(r.querySelector(".hip-fare").value) || 0
      }))
      .filter((x) => x.fare > 0);

    const highest = inters.reduce(
      (best, x) => (x.fare > best.fare ? x : best),
      { label: "Origin → Destination (through)", fare: through }
    );
    const applies = highest.fare > through;

    $("hip-out").innerHTML =
      "<div class='result-line'>Through O&amp;D fare: <b>" + money(through) + " NUC</b></div>" +
      (inters.length
        ? "<ul class='term-list'>" +
          inters
            .map(
              (x) =>
                "<li>" + x.label + ": " + money(x.fare) + " NUC" +
                (x.fare > through ? " <span class='warn'>← higher!</span>" : "") + "</li>"
            )
            .join("") +
          "</ul>"
        : "<div class='hint'>Add the published fares of the intermediate city-pairs to test them.</div>") +
      "<div class='result-line'>" +
      (applies
        ? "HIP found — use <b>" + money(highest.fare) + " NUC</b> (from “" + highest.label +
          "”) instead of the through fare."
        : "No higher intermediate point — the through fare <b>" + money(through) + " NUC</b> stands.") +
      "</div>" +
      "<div class='hint'>The HIP rule stops a passenger from hiding an expensive market inside a cheaper end-to-end fare.</div>";
  }

  function addHipRow(label, fare) {
    const wrap = $("hip-rows");
    const div = document.createElement("div");
    div.className = "hip-row";
    div.innerHTML =
      '<input class="hip-label" placeholder="e.g. AUH → DEL" value="' + (label || "") + '">' +
      '<input class="hip-fare" type="number" placeholder="NUC" value="' + (fare || "") + '">' +
      '<button class="hip-del" title="remove">×</button>';
    div.querySelector(".hip-del").onclick = () => { div.remove(); runHIP(); };
    div.querySelectorAll("input").forEach((i) => (i.oninput = runHIP));
    wrap.appendChild(div);
  }

  /* ---------- Worked example: AUH -> DEL -> CMB ------------------------ */
  function renderWorkedExample() {
    const box = $("worked-example");
    if (!box) return;
    const t1 = U().segmentMiles("AUH", "DEL");
    const t2 = U().segmentMiles("DEL", "CMB");
    const sum = t1 + t2;
    const od = U().segmentMiles("AUH", "CMB");
    const mpm = Math.round(od * 1.2);
    const band = emsBand(sum, mpm, 0);
    const baseNUC = 430; // illustrative published AUH–CMB fare
    const surcharged = band.invalid ? null : baseNUC * (1 + band.pct / 100);
    const roe = 3.6725; // AED (journey starts in Abu Dhabi)
    const lcf = surcharged != null ? Math.ceil(surcharged * roe) : null;

    box.innerHTML =
      "<ol class='steps'>" +
      "<li><b>Read the routing.</b> AUH –(Air India)→ DEL –(SriLankan/UL)→ CMB. " +
        "Origin Abu Dhabi is in <b>TC2</b> (Middle East); Delhi and Colombo are in <b>TC3</b> " +
        "(South-Asian subcontinent). The journey stays in the Eastern Hemisphere → Global Indicator <b>EH</b>.</li>" +
      "<li><b>Add the TPMs</b> (ticketed-point mileages) of each coupon:" +
        "<div class='mono-block'>AUH–DEL = " + miles(t1) + " mi<br>DEL–CMB = " + miles(t2) +
        " mi<br>Σ TPM  = <b>" + miles(sum) + " mi</b></div></li>" +
      "<li><b>Find the MPM</b> for AUH→CMB (GI EH). Illustrative MPM ≈ " + miles(mpm) +
        " mi (real value is in the MPM manual).</li>" +
      "<li><b>Compare & find the EMS.</b> Ratio = ΣTPM ÷ MPM = " + miles(sum) + " ÷ " +
        miles(mpm) + " = <b>" + band.ratio.toFixed(3) + "</b> → band <b>" + band.code +
        (band.invalid ? "" : " (" + band.pct + "% surcharge)") + "</b>. " +
        (band.pct === 0
          ? "The detour via Delhi still fits inside the MPM, so <b>no</b> excess-mileage surcharge."
          : "So the fare is loaded by " + band.pct + "%.") + "</li>" +
      "<li><b>HIP check.</b> Compare the AUH–CMB through fare with AUH–DEL and DEL–CMB published fares; " +
        "use the highest. (Here we assume AUH–CMB is highest, so it stands.)</li>" +
      "<li><b>Build the NUC.</b> Base fare " + money(baseNUC) + " NUC" +
        (band.pct ? " × " + (1 + band.pct / 100).toFixed(2) : "") + " = <b>" +
        (surcharged != null ? money(surcharged) + " NUC" : "re-break needed") + "</b>.</li>" +
      "<li><b>Convert to local money.</b> Journey starts in the UAE, so use the AED ROE (" + roe +
        "): LCF = " + (surcharged != null ? money(surcharged) + " × " + roe + " = <b>" +
        (lcf ? lcf.toLocaleString() + " AED</b>" : "—") : "—") + " (rounded up).</li>" +
      "</ol>" +
      "<div class='hint'>Change the numbers in the calculators above to see every step recompute. " +
      "For real tickets, swap the great-circle TPMs and the illustrative MPM/fares for the official IATA values.</div>";
  }

  /* ---------- Wiring --------------------------------------------------- */
  let wired = false;
  function initCalculator() {
    if (wired) return;
    wired = true;

    // Mileage calc defaults — prefilled so every box shows live numbers.
    $("mlg-route").value = "AUH-DEL-CMB";
    $("mlg-nuc").value = "430";
    ["mlg-route", "mlg-mpm", "mlg-ema", "mlg-nuc"].forEach((id) => {
      const e = $(id);
      if (e) e.oninput = runMileage;
    });
    document.querySelectorAll(".mlg-preset").forEach((btn) => {
      btn.onclick = () => { $("mlg-route").value = btn.dataset.route; runMileage(); };
    });

    // Currency
    fillRoeOptions();
    const pick = $("cur-roe-pick");
    if (pick) {
      pick.onchange = () => { $("cur-roe").value = pick.value; updateCurrency(); };
      $("cur-roe").value = pick.value;
    }
    ["cur-nuc", "cur-roe"].forEach((id) => {
      const e = $(id);
      if (e) e.oninput = () => { e.dataset.touched = "1"; updateCurrency(); };
    });

    // HIP
    addHipRow("AUH → DEL", 300);
    addHipRow("DEL → CMB", 180);
    $("hip-add").onclick = () => addHipRow("", "");
    $("hip-through").oninput = runHIP;

    runMileage();
    updateCurrency();
    runHIP();
    renderWorkedExample();
  }

  PP.initCalculator = initCalculator;
})();
