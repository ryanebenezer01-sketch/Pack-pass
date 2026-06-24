#!/usr/bin/env python3
"""
FIRE Retirement Planning Excel Generator
Generates a comprehensive Financial Independence, Retire Early spreadsheet.
Usage: python fire_planner.py
Output: FIRE_Retirement_Planner.xlsx
"""

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Border, Side, Alignment
from openpyxl.formatting.rule import ColorScaleRule, CellIsRule, DataBarRule
from openpyxl.chart import LineChart, BarChart, Reference
from openpyxl.chart.series import SeriesLabel
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName
import datetime

# ── Palette ────────────────────────────────────────────────────────────────────
C_NAVY   = "1B3A5C"
C_BLUE   = "2471A3"
C_SKY    = "AED6F1"
C_LIGHT  = "EBF5FB"
C_GOLD   = "D4AC0D"
C_AMBER  = "FEF9E7"
C_GREEN  = "1A7A4A"
C_LGREEN = "D5F5E3"
C_RED    = "B03A2E"
C_LRED   = "FADBD8"
C_PURPLE = "6C3483"
C_LPURP  = "E8DAEF"
C_GRAY   = "566573"
C_LGRAY  = "F2F3F4"
C_WHITE  = "FFFFFF"
C_BLACK  = "17202A"

# ── Style Primitives ───────────────────────────────────────────────────────────

def _fill(hex_color):
    return PatternFill("solid", fgColor=hex_color)

def _font(name="Calibri", size=11, bold=False, italic=False, color=C_BLACK):
    return Font(name=name, size=size, bold=bold, italic=italic, color=color)

def _side(style="thin", color="BFBFBF"):
    return Side(style=style, color=color)

def _border(style="thin", color="BFBFBF"):
    s = _side(style, color)
    return Border(left=s, right=s, top=s, bottom=s)

def _align(h="left", v="center", wrap=False):
    return Alignment(horizontal=h, vertical=v, wrap_text=wrap)

def _thick():
    s = _side("medium", "595959")
    return Border(left=s, right=s, top=s, bottom=s)

def col(n):
    return get_column_letter(n)

def set_width(ws, col_num, width):
    ws.column_dimensions[col(col_num)].width = width

def merge(ws, r, c1, c2, value=None, fill_color=None, font_obj=None,
          align_obj=None, num_fmt=None, border_obj=None):
    """Merge c1:c2 in row r, apply style, return the top-left cell."""
    if c1 != c2:
        ws.merge_cells(f"{col(c1)}{r}:{col(c2)}{r}")
    cell = ws[f"{col(c1)}{r}"]
    if value is not None:
        cell.value = value
    if fill_color:
        cell.fill = _fill(fill_color)
    if font_obj:
        cell.font = font_obj
    if align_obj:
        cell.alignment = align_obj
    if num_fmt:
        cell.number_format = num_fmt
    cell.border = border_obj or _border()
    return cell

# ── Compound style helpers ─────────────────────────────────────────────────────

def hdr(ws, r, c1, c2, text, bg=C_NAVY, size=14):
    """Full-width section header."""
    return merge(ws, r, c1, c2, text,
                 fill_color=bg,
                 font_obj=_font(size=size, bold=True, color=C_WHITE),
                 align_obj=_align("center","center"))

def subhdr(ws, r, c, text):
    """Column sub-header."""
    cell = ws[f"{col(c)}{r}"]
    cell.value = text
    cell.font = _font(size=9, bold=True, color=C_NAVY)
    cell.fill = _fill(C_SKY)
    cell.alignment = _align("center","center")
    cell.border = _border()
    return cell

def label(ws, r, c, text, bg=C_LGRAY, bold=False, color=C_BLACK):
    cell = ws[f"{col(c)}{r}"]
    cell.value = text
    cell.font = _font(size=10, bold=bold, color=color)
    cell.fill = _fill(bg)
    cell.alignment = _align("left","center")
    cell.border = _border()
    return cell

def data(ws, r, c, value=None, num_fmt='#,##0.00', bg=C_WHITE,
         bold=False, color=C_BLACK, h_align="right"):
    cell = ws[f"{col(c)}{r}"]
    if value is not None:
        cell.value = value
    cell.font = _font(size=10, bold=bold, color=color)
    cell.fill = _fill(bg)
    cell.alignment = _align(h_align,"center")
    cell.border = _border()
    cell.number_format = num_fmt
    return cell

def formula_cell(ws, r, c, formula, num_fmt='#,##0.00', bg=C_LIGHT,
                 bold=False, color=C_BLUE):
    cell = ws[f"{col(c)}{r}"]
    cell.value = formula
    cell.font = _font(size=10, bold=bold, color=color)
    cell.fill = _fill(bg)
    cell.alignment = _align("right","center")
    cell.border = _border()
    cell.number_format = num_fmt
    return cell

def total_row(ws, r, c1, c2_label, c3_onward_cells, label_text, bg):
    """Write a totals row: merged label in c1:c2_label, then formula cells."""
    merge(ws, r, c1, c2_label, label_text,
          fill_color=bg,
          font_obj=_font(size=10, bold=True, color=C_WHITE),
          align_obj=_align("left","center"))
    for c, val, fmt in c3_onward_cells:
        cell = ws[f"{col(c)}{r}"]
        cell.value = val
        cell.font = _font(size=10, bold=True, color=C_WHITE)
        cell.fill = _fill(bg)
        cell.alignment = _align("right","center")
        cell.border = _border()
        cell.number_format = fmt
    ws.row_dimensions[r].height = 22

# ══════════════════════════════════════════════════════════════════════════════
# SHEET 1 — DASHBOARD
# Row layout: 1=pad, 2=title, 3=subtitle, 4=pad, 5-6=KPI cards,
#             7=pad, 8=milestone hdr, 9=col hdrs, 10-14=milestones,
#             15=pad, 16=assumptions hdr, 17-19=assumptions
# ══════════════════════════════════════════════════════════════════════════════

def build_dashboard(ws):
    ws.sheet_view.showGridLines = False
    for c in range(1, 12):
        set_width(ws, c, 13.5)
    set_width(ws, 1, 2)
    set_width(ws, 11, 2)

    ws.row_dimensions[1].height = 8
    ws.row_dimensions[2].height = 48
    ws.row_dimensions[3].height = 22
    ws.row_dimensions[4].height = 12

    # Title
    hdr(ws, 2, 2, 10, "FIRE RETIREMENT PLANNER", C_NAVY, 22)
    hdr(ws, 3, 2, 10, "Financial Independence · Retire Early · Live Free", C_BLUE, 11)

    # KPI Cards — row 5 (labels) row 6 (values)
    ws.row_dimensions[5].height = 20
    ws.row_dimensions[6].height = 38

    kpis = [
        ("NET WORTH",     "='Net Worth'!C42",                                         C_NAVY,  '$#,##0'),
        ("FIRE NUMBER",   "='Investment Growth'!C14",                                 C_GREEN, '$#,##0'),
        ("FI PROGRESS",   "=IFERROR('Net Worth'!C42/'Investment Growth'!C14,0)",     C_BLUE,  '0.0%'),
        ("YEARS TO FIRE", "='Investment Growth'!C15",                                 C_PURPLE,'0.0'),
        ("MONTHLY SAVINGS","='Budget & Savings'!C55",                                 C_GOLD,  '$#,##0'),
    ]
    card_start_cols = [2, 4, 6, 8, 10]
    for i, ((title, formula, color, fmt), cs) in enumerate(zip(kpis, card_start_cols)):
        # Label
        merge(ws, 5, cs, cs+1, title,
              fill_color=color,
              font_obj=_font(size=9, bold=True, color=C_WHITE),
              align_obj=_align("center","center"))
        # Value
        vc = merge(ws, 6, cs, cs+1, formula,
                   fill_color=C_WHITE,
                   font_obj=_font(size=15, bold=True, color=color),
                   align_obj=_align("center","center"),
                   num_fmt=fmt,
                   border_obj=_thick())

    ws.row_dimensions[7].height = 12

    # Milestone tracker
    hdr(ws, 8, 2, 10, "FIRE MILESTONE TRACKER", C_BLUE, 11)
    ws.row_dimensions[8].height = 22

    for c, txt in zip([2,4,6,8,10], ["Milestone","Target","Current NW","Progress","Status"]):
        merge(ws, 9, c, c+1, txt,
              fill_color=C_SKY,
              font_obj=_font(size=9, bold=True, color=C_NAVY),
              align_obj=_align("center","center"))
    ws.row_dimensions[9].height = 18

    milestones = [
        ("$25K Starter",    25000),
        ("$100K Club",      100000),
        ("25% FI",          "='Investment Growth'!C14*0.25"),
        ("50% FI",          "='Investment Growth'!C14*0.5"),
        ("FIRE — 100%",     "='Investment Growth'!C14"),
    ]
    for i, (name, target) in enumerate(milestones):
        r = 10 + i
        ws.row_dimensions[r].height = 20
        # Name
        merge(ws, r, 2, 3, name,
              fill_color=C_LGRAY,
              font_obj=_font(size=10, bold=True, color=C_NAVY),
              align_obj=_align("center","center"))
        # Target
        merge(ws, r, 4, 5, target,
              fill_color=C_WHITE,
              font_obj=_font(size=10, color=C_BLACK),
              align_obj=_align("right","center"),
              num_fmt='$#,##0')
        # Current NW
        merge(ws, r, 6, 7, "='Net Worth'!C42",
              fill_color=C_LIGHT,
              font_obj=_font(size=10, color=C_BLUE),
              align_obj=_align("right","center"),
              num_fmt='$#,##0')
        # Progress
        prog_ref = col(4) + str(r)
        curr_ref = col(6) + str(r)
        merge(ws, r, 8, 9, f"=MIN({curr_ref}/{prog_ref},1)",
              fill_color=C_WHITE,
              font_obj=_font(size=10, bold=True, color=C_NAVY),
              align_obj=_align("center","center"),
              num_fmt='0%')
        # Status
        pct = col(8) + str(r)
        merge(ws, r, 10, 11,
              f'=IF({pct}>=1,"✅ ACHIEVED",IF({pct}>=0.5,"🔥 Halfway","⏳ Building"))',
              fill_color=C_AMBER,
              font_obj=_font(size=10, bold=True, color=C_GOLD),
              align_obj=_align("center","center"))

    ws.row_dimensions[15].height = 12

    # Assumptions quick-ref
    hdr(ws, 16, 2, 10, "KEY ASSUMPTIONS  (edit values in their own sheets)", C_GRAY, 10)
    ws.row_dimensions[16].height = 20

    assumptions = [
        ("Current Age",           "='Investment Growth'!C6",  "0"),
        ("Annual Return (nominal)","='Investment Growth'!C7",  "0.00%"),
        ("Inflation Rate",         "='Investment Growth'!C8",  "0.00%"),
        ("Retirement Age",         "='Investment Growth'!C12", "0"),
        ("Safe Withdrawal Rate",   "='SWR Calculator'!C10",    "0.00%"),
        ("Real Return Rate",       "='Investment Growth'!C9",  "0.00%"),
    ]
    col_pairs = [(2,3),(4,5),(6,7),(8,9),(10,11)]
    r_assum = 17
    for idx, (lbl, formula, fmt) in enumerate(assumptions):
        r_cur = r_assum + (idx // 2)
        pair = col_pairs[idx % 5] if idx % 5 < len(col_pairs) else col_pairs[-1]
        cs = 2 + (idx % 2) * 5
        # Label
        merge(ws, r_cur, cs, cs+2, lbl,
              fill_color=C_SKY,
              font_obj=_font(size=9, bold=True, color=C_NAVY),
              align_obj=_align("left","center"))
        # Value
        merge(ws, r_cur, cs+3, cs+4, formula,
              fill_color=C_LIGHT,
              font_obj=_font(size=10, bold=True, color=C_GREEN),
              align_obj=_align("center","center"),
              num_fmt=fmt)
        ws.row_dimensions[r_cur].height = 20


# ══════════════════════════════════════════════════════════════════════════════
# SHEET 2 — NET WORTH TRACKER
# Key anchor: C42 = Net Worth total
# ══════════════════════════════════════════════════════════════════════════════

def build_net_worth(ws):
    ws.sheet_view.showGridLines = False
    widths = [2, 30, 16, 14, 16, 20, 2]
    for i, w in enumerate(widths, 1):
        set_width(ws, i, w)

    ws.row_dimensions[1].height = 8
    ws.row_dimensions[2].height = 44
    hdr(ws, 2, 2, 6, "NET WORTH TRACKER", C_NAVY, 18)
    ws.row_dimensions[3].height = 20
    merge(ws, 3, 2, 6,
          f"Last updated: {datetime.date.today().strftime('%B %d, %Y')}  ·  Update monthly for accurate FIRE tracking",
          fill_color=C_LIGHT,
          font_obj=_font(size=10, italic=True, color=C_GRAY),
          align_obj=_align("center","center"))
    ws.row_dimensions[4].height = 10

    # ── ASSETS (rows 5-21) ─────────────────────────────────────────────────────
    hdr(ws, 5, 2, 6, "ASSETS", C_GREEN, 12)
    ws.row_dimensions[5].height = 24
    for c, txt in zip([2,3,4,5,6], ["Asset Category","Current Value ($)","% of Assets","Est. Annual Return","Notes"]):
        subhdr(ws, 6, c, txt)
    ws.row_dimensions[6].height = 20

    assets = [
        ("Cash & Savings Account",          15000,  0.005),
        ("Emergency Fund",                  10000,  0.047),
        ("Checking Account",                 5000,  0.001),
        ("401(k) / 403(b)",                85000,  0.08),
        ("Roth IRA",                        35000,  0.08),
        ("Traditional IRA",                     0,  0.08),
        ("Taxable Brokerage Account",       25000,  0.08),
        ("HSA (Health Savings Account)",     8000,  0.07),
        ("Real Estate — Primary Residence",350000,  0.04),
        ("Real Estate — Investment Property",   0,  0.06),
        ("Vehicles",                        15000, -0.10),
        ("Business Equity",                     0,  0.10),
        ("Crypto / Alternative Assets",      5000,  0.15),
        ("Other Assets",                     2000,  0.02),
    ]

    ASSET_START = 7
    ASSET_END   = ASSET_START + len(assets) - 1
    TOTAL_ASSETS_ROW = ASSET_END + 1  # row 21

    for i, (name, val, ret) in enumerate(assets):
        r = ASSET_START + i
        ws.row_dimensions[r].height = 18
        label(ws, r, 2, name)
        data(ws, r, 3, val, '$#,##0.00')
        formula_cell(ws, r, 4,
                     f"=IF(C{TOTAL_ASSETS_ROW}>0,C{r}/C{TOTAL_ASSETS_ROW},0)",
                     '0.0%', C_LIGHT, color=C_NAVY)
        data(ws, r, 5, ret, '0.0%', C_LGREEN if ret >= 0 else C_LRED,
             color=C_GREEN if ret >= 0 else C_RED)
        ws[f"F{r}"].border = _border()
        ws[f"F{r}"].fill = _fill(C_WHITE)
        ws[f"F{r}"].alignment = _align("left","center", True)

    total_row(ws, TOTAL_ASSETS_ROW, 2, 2,
              [(3, f"=SUM(C{ASSET_START}:C{ASSET_END})", '$#,##0.00'),
               (4, "100.0%", '0.0%'),
               (5, f"=SUMPRODUCT(C{ASSET_START}:C{ASSET_END},E{ASSET_START}:E{ASSET_END})/C{TOTAL_ASSETS_ROW}", '0.0%')],
              "TOTAL ASSETS", C_GREEN)
    ws.row_dimensions[TOTAL_ASSETS_ROW + 1].height = 10

    # ── LIABILITIES (rows 23-37) ───────────────────────────────────────────────
    LIAB_HDR = TOTAL_ASSETS_ROW + 2  # row 23
    hdr(ws, LIAB_HDR, 2, 6, "LIABILITIES", C_RED, 12)
    ws.row_dimensions[LIAB_HDR].height = 24
    for c, txt in zip([2,3,4,5,6], ["Liability Category","Balance Owed ($)","% of Liabilities","Interest Rate","Notes"]):
        subhdr(ws, LIAB_HDR + 1, c, txt)
    ws.row_dimensions[LIAB_HDR + 1].height = 20

    liabilities = [
        ("Mortgage — Primary Residence",   250000, 0.065),
        ("Mortgage — Investment Property",       0, 0.07),
        ("Home Equity Loan / HELOC",             0, 0.085),
        ("Auto Loan 1",                     12000, 0.059),
        ("Auto Loan 2",                         0, 0.00),
        ("Student Loans",                   18000, 0.055),
        ("Credit Card 1",                    3500, 0.22),
        ("Credit Card 2",                       0, 0.22),
        ("Personal Loan",                       0, 0.12),
        ("Medical Debt",                        0, 0.00),
        ("Business Debt",                       0, 0.08),
        ("Other Liabilities",                   0, 0.00),
    ]

    LIAB_START = LIAB_HDR + 2  # row 25
    LIAB_END   = LIAB_START + len(liabilities) - 1  # row 36
    TOTAL_LIAB_ROW = LIAB_END + 1  # row 37

    for i, (name, val, rate) in enumerate(liabilities):
        r = LIAB_START + i
        ws.row_dimensions[r].height = 18
        label(ws, r, 2, name)
        data(ws, r, 3, val, '$#,##0.00')
        formula_cell(ws, r, 4,
                     f"=IF(C{TOTAL_LIAB_ROW}>0,C{r}/C{TOTAL_LIAB_ROW},0)",
                     '0.0%', C_LRED, color=C_RED)
        data(ws, r, 5, rate, '0.0%',
             C_LRED if rate >= 0.10 else (C_AMBER if rate >= 0.05 else C_LGREEN),
             color=C_RED if rate >= 0.10 else C_BLACK)
        ws[f"F{r}"].border = _border()
        ws[f"F{r}"].fill = _fill(C_WHITE)

    total_row(ws, TOTAL_LIAB_ROW, 2, 2,
              [(3, f"=SUM(C{LIAB_START}:C{LIAB_END})", '$#,##0.00'),
               (4, "100.0%", '0.0%'),
               (5, f"=IFERROR(SUMPRODUCT(C{LIAB_START}:C{LIAB_END},E{LIAB_START}:E{LIAB_END})/C{TOTAL_LIAB_ROW},0)", '0.0%')],
              "TOTAL LIABILITIES", C_RED)

    # ── NET WORTH SUMMARY (rows 39-43) ────────────────────────────────────────
    NW_SECTION = TOTAL_LIAB_ROW + 2  # row 39
    hdr(ws, NW_SECTION, 2, 6, "NET WORTH SUMMARY", C_NAVY, 12)
    ws.row_dimensions[NW_SECTION].height = 24
    ws.row_dimensions[NW_SECTION + 1].height = 10

    summary = [
        (NW_SECTION + 1, "Total Assets",            f"=C{TOTAL_ASSETS_ROW}",    '$#,##0.00', C_LGREEN, C_GREEN),
        (NW_SECTION + 2, "Total Liabilities",        f"=C{TOTAL_LIAB_ROW}",     '$#,##0.00', C_LRED,   C_RED),
        (NW_SECTION + 3, "NET WORTH",                f"=C{TOTAL_ASSETS_ROW}-C{TOTAL_LIAB_ROW}", '$#,##0.00', C_LIGHT, C_NAVY),
        (NW_SECTION + 4, "Debt-to-Asset Ratio",     f"=IF(C{TOTAL_ASSETS_ROW}>0,C{TOTAL_LIAB_ROW}/C{TOTAL_ASSETS_ROW},0)", '0.0%', C_AMBER, C_GOLD),
        (NW_SECTION + 5, "Liquid Net Worth",         f"=SUM(C{ASSET_START}:C{ASSET_START+7})-C{TOTAL_LIAB_ROW}", '$#,##0.00', C_LGRAY, C_BLUE),
    ]

    for r, lbl_txt, frm, fmt, bg, fc in summary:
        ws.row_dimensions[r].height = 28
        label(ws, r, 2, lbl_txt, bg, bold=True, color=fc)
        ws[f"B{r}"].border = _thick()
        merge(ws, r, 3, 5, frm,
              fill_color=bg,
              font_obj=_font(size=14, bold=True, color=fc),
              align_obj=_align("right","center"),
              num_fmt=fmt,
              border_obj=_thick())
        ws[f"F{r}"].fill = _fill(bg)
        ws[f"F{r}"].border = _thick()

    # Dashboard anchor — row 42 is NET WORTH row (NW_SECTION + 3)
    # Ensure it lands on row 42
    NW_ROW = NW_SECTION + 3
    # If NW_ROW != 42, the dashboard formula must be updated.
    # With our layout: TOTAL_ASSETS=21, TOTAL_LIAB=37, NW_SECTION=39 → NW_ROW=42 ✓

    # Conditional formatting on net worth
    ws.conditional_formatting.add(
        f"C{NW_ROW}",
        CellIsRule("greaterThan", ["0"],
                   fill=_fill(C_LGREEN), font=Font(bold=True, color=C_GREEN)))
    ws.conditional_formatting.add(
        f"C{NW_ROW}",
        CellIsRule("lessThan", ["0"],
                   fill=_fill(C_LRED), font=Font(bold=True, color=C_RED)))

    # Color scale on asset % column
    ws.conditional_formatting.add(
        f"D{ASSET_START}:D{ASSET_END}",
        ColorScaleRule(start_type="min", start_color=C_WHITE,
                       end_type="max",   end_color=C_BLUE))

    # Color scale on liabilities interest rate
    ws.conditional_formatting.add(
        f"E{LIAB_START}:E{LIAB_END}",
        ColorScaleRule(start_type="min", start_color=C_LGREEN,
                       mid_type="percentile", mid_value=50, mid_color=C_AMBER,
                       end_type="max",   end_color=C_RED))

    return NW_ROW  # should be 42


# ══════════════════════════════════════════════════════════════════════════════
# SHEET 3 — BUDGET & SAVINGS RATE
# Key anchors: C13=total income, C28=fixed total, C45=variable total, C55=savings total
# ══════════════════════════════════════════════════════════════════════════════

def build_budget(ws):
    ws.sheet_view.showGridLines = False
    widths = [2, 30, 14, 14, 14, 13, 14, 2]
    for i, w in enumerate(widths, 1):
        set_width(ws, i, w)

    ws.row_dimensions[1].height = 8
    ws.row_dimensions[2].height = 44
    hdr(ws, 2, 2, 7, "MONTHLY BUDGET & SAVINGS RATE", C_NAVY, 18)
    ws.row_dimensions[3].height = 20
    merge(ws, 3, 2, 7,
          "Savings Rate is the single most important variable for achieving FIRE",
          fill_color=C_LIGHT,
          font_obj=_font(size=10, italic=True, color=C_GRAY),
          align_obj=_align("center","center"))
    ws.row_dimensions[4].height = 10

    # Column headers row 5
    col_hdrs = ["Category", "Budget/Month ($)", "Actual/Month ($)",
                "Variance ($)", "% of Income", "Annual Total ($)"]
    for ci, txt in enumerate(col_hdrs, 2):
        subhdr(ws, 5, ci, txt)
    ws.row_dimensions[5].height = 20

    def income_total(): return "C13"
    def exp_row(ws_local, r, name, budget, actual=None):
        """Write an income or expense data row."""
        ws_local.row_dimensions[r].height = 18
        label(ws_local, r, 2, name)
        data(ws_local, r, 3, budget, '$#,##0.00')
        data(ws_local, r, 4, actual if actual is not None else budget, '$#,##0.00')
        formula_cell(ws_local, r, 5, f"=D{r}-C{r}", '$#,##0.00',
                     bg=C_LGREEN if (actual or budget) >= 0 else C_LRED)
        formula_cell(ws_local, r, 6,
                     f"=IF({income_total()}>0,C{r}/{income_total()},0)",
                     '0.0%', C_LIGHT)
        formula_cell(ws_local, r, 7, f"=C{r}*12", '$#,##0', C_LIGHT, color=C_NAVY)

    # ── INCOME (rows 6-13) ─────────────────────────────────────────────────────
    hdr(ws, 6, 2, 7, "INCOME", C_GREEN, 11)
    ws.row_dimensions[6].height = 22

    incomes = [
        ("Primary Job — Net Take-Home Pay",   6500),
        ("Spouse / Partner Income",            4000),
        ("Side Hustle / Freelance",             500),
        ("Rental Income",                          0),
        ("Dividends, Interest & Capital Gains",  200),
        ("Other Income",                           0),
    ]
    INC_START, INC_END = 7, 7 + len(incomes) - 1  # 7-12
    INC_TOTAL = INC_END + 1  # 13

    for i, (name, amt) in enumerate(incomes):
        exp_row(ws, INC_START + i, name, amt)

    # Total income row — C13
    total_row(ws, INC_TOTAL, 2, 2,
              [(3, f"=SUM(C{INC_START}:C{INC_END})", '$#,##0.00'),
               (4, f"=SUM(D{INC_START}:D{INC_END})", '$#,##0.00'),
               (5, f"=D{INC_TOTAL}-C{INC_TOTAL}",    '$#,##0.00'),
               (6, "100.0%", '0.0%'),
               (7, f"=C{INC_TOTAL}*12", '$#,##0')],
              "TOTAL MONTHLY INCOME", C_GREEN)
    ws.row_dimensions[INC_TOTAL + 1].height = 8

    # ── FIXED EXPENSES (rows 15-28) ────────────────────────────────────────────
    FIXED_HDR = INC_TOTAL + 2  # 15
    hdr(ws, FIXED_HDR, 2, 7, "FIXED EXPENSES", C_BLUE, 11)
    ws.row_dimensions[FIXED_HDR].height = 22

    fixed = [
        ("Rent / Mortgage Payment",        2200),
        ("HOA Fees",                           0),
        ("Homeowner's / Renter's Insurance",  100),
        ("Car Payment 1",                    350),
        ("Car Payment 2",                      0),
        ("Auto Insurance",                   150),
        ("Health Insurance Premium",         400),
        ("Life / Disability Insurance",       50),
        ("Internet",                          80),
        ("Phone",                             85),
        ("Streaming Subscriptions",           50),
        ("Gym / Fitness Membership",          40),
    ]
    FIXED_START = FIXED_HDR + 1   # 16
    FIXED_END   = FIXED_START + len(fixed) - 1  # 27
    FIXED_TOTAL = FIXED_END + 1   # 28

    for i, (name, amt) in enumerate(fixed):
        exp_row(ws, FIXED_START + i, name, amt)

    total_row(ws, FIXED_TOTAL, 2, 2,
              [(3, f"=SUM(C{FIXED_START}:C{FIXED_END})", '$#,##0.00'),
               (4, f"=SUM(D{FIXED_START}:D{FIXED_END})", '$#,##0.00'),
               (5, f"=D{FIXED_TOTAL}-C{FIXED_TOTAL}", '$#,##0.00'),
               (6, f"=IF(C{INC_TOTAL}>0,C{FIXED_TOTAL}/C{INC_TOTAL},0)", '0.0%'),
               (7, f"=C{FIXED_TOTAL}*12", '$#,##0')],
              "TOTAL FIXED EXPENSES", C_BLUE)
    ws.row_dimensions[FIXED_TOTAL + 1].height = 8

    # ── VARIABLE EXPENSES (rows 30-45) ─────────────────────────────────────────
    VAR_HDR = FIXED_TOTAL + 2  # 30
    hdr(ws, VAR_HDR, 2, 7, "VARIABLE EXPENSES", C_PURPLE, 11)
    ws.row_dimensions[VAR_HDR].height = 22

    variable = [
        ("Groceries & Household Supplies",   600),
        ("Dining Out & Takeout",             200),
        ("Gas & Transportation",             150),
        ("Parking, Tolls & Rideshare",        30),
        ("Clothing & Apparel",               100),
        ("Entertainment & Recreation",       100),
        ("Travel & Vacation",                200),
        ("Personal Care & Beauty",            80),
        ("Medical, Dental & Pharmacy",        50),
        ("Home Maintenance & Repairs",       100),
        ("Gifts & Charitable Donations",      75),
        ("Pet Expenses",                       0),
        ("Childcare & Education",              0),
        ("Miscellaneous / Catch-All",        100),
    ]
    VAR_START = VAR_HDR + 1   # 31
    VAR_END   = VAR_START + len(variable) - 1  # 44
    VAR_TOTAL = VAR_END + 1   # 45

    for i, (name, amt) in enumerate(variable):
        exp_row(ws, VAR_START + i, name, amt)

    total_row(ws, VAR_TOTAL, 2, 2,
              [(3, f"=SUM(C{VAR_START}:C{VAR_END})", '$#,##0.00'),
               (4, f"=SUM(D{VAR_START}:D{VAR_END})", '$#,##0.00'),
               (5, f"=D{VAR_TOTAL}-C{VAR_TOTAL}", '$#,##0.00'),
               (6, f"=IF(C{INC_TOTAL}>0,C{VAR_TOTAL}/C{INC_TOTAL},0)", '0.0%'),
               (7, f"=C{VAR_TOTAL}*12", '$#,##0')],
              "TOTAL VARIABLE EXPENSES", C_PURPLE)
    ws.row_dimensions[VAR_TOTAL + 1].height = 8

    # ── SAVINGS & INVESTMENTS (rows 47-55) ─────────────────────────────────────
    SAV_HDR = VAR_TOTAL + 2  # 47
    hdr(ws, SAV_HDR, 2, 7, "SAVINGS & INVESTMENTS", C_GOLD, 11)
    ws.row_dimensions[SAV_HDR].height = 22

    savings = [
        ("401(k) / 403(b) Contribution",     1000),
        ("Roth IRA Contribution",              500),
        ("HSA Contribution",                   300),
        ("Taxable Brokerage Investment",        500),
        ("Emergency Fund Top-Up",              200),
        ("House / Goal Savings Fund",            0),
        ("Other Savings / Sinking Funds",        0),
    ]
    SAV_START = SAV_HDR + 1   # 48
    SAV_END   = SAV_START + len(savings) - 1  # 54
    SAV_TOTAL = SAV_END + 1   # 55

    for i, (name, amt) in enumerate(savings):
        exp_row(ws, SAV_START + i, name, amt)

    total_row(ws, SAV_TOTAL, 2, 2,
              [(3, f"=SUM(C{SAV_START}:C{SAV_END})", '$#,##0.00'),
               (4, f"=SUM(D{SAV_START}:D{SAV_END})", '$#,##0.00'),
               (5, f"=D{SAV_TOTAL}-C{SAV_TOTAL}", '$#,##0.00'),
               (6, f"=IF(C{INC_TOTAL}>0,C{SAV_TOTAL}/C{INC_TOTAL},0)", '0.0%'),
               (7, f"=C{SAV_TOTAL}*12", '$#,##0')],
              "TOTAL SAVINGS & INVESTMENTS", C_GOLD)
    ws.row_dimensions[SAV_TOTAL + 1].height = 12

    # ── SAVINGS RATE SUMMARY (rows 57-63) ─────────────────────────────────────
    SUMM_HDR = SAV_TOTAL + 2  # 57
    hdr(ws, SUMM_HDR, 2, 7, "SAVINGS RATE SUMMARY", C_NAVY, 12)
    ws.row_dimensions[SUMM_HDR].height = 26

    SUMM_ITEMS = [
        (SUMM_HDR+1, "Total Monthly Income",     f"=C{INC_TOTAL}",                           '$#,##0.00', C_LGREEN, C_GREEN),
        (SUMM_HDR+2, "Total Monthly Expenses",   f"=C{FIXED_TOTAL}+C{VAR_TOTAL}",            '$#,##0.00', C_LRED,   C_RED),
        (SUMM_HDR+3, "Total Monthly Savings",    f"=C{SAV_TOTAL}",                            '$#,##0.00', C_AMBER,  C_GOLD),
        (SUMM_HDR+4, "Surplus / Unallocated",    f"=C{INC_TOTAL}-C{FIXED_TOTAL}-C{VAR_TOTAL}-C{SAV_TOTAL}", '$#,##0.00', C_LIGHT, C_BLUE),
        (SUMM_HDR+5, "SAVINGS RATE",             f"=IF(C{INC_TOTAL}>0,C{SAV_TOTAL}/C{INC_TOTAL},0)", '0.0%', C_SKY, C_NAVY),
        (SUMM_HDR+6, "FIRE Projected Savings Rate Target", "50.0%",                           '0.0%', C_LGRAY, C_GRAY),
    ]

    for r, lbl_txt, frm, fmt, bg, fc in SUMM_ITEMS:
        ws.row_dimensions[r].height = 26
        label(ws, r, 2, lbl_txt, bg, bold=True, color=fc)
        ws[f"B{r}"].border = _thick()
        ws[f"B{r}"].font = _font(size=11, bold=True, color=fc)
        merge(ws, r, 3, 5, frm,
              fill_color=bg,
              font_obj=_font(size=14, bold=True, color=fc),
              align_obj=_align("right","center"),
              num_fmt=fmt,
              border_obj=_thick())
        formula_cell(ws, r, 6,
                     f"=IF(C{r}>0,C{r}*100,0)" if fmt == '0.0%' else f"=C{r}*12",
                     "0.0\"%\"" if fmt == '0.0%' else '$#,##0',
                     bg=bg, bold=True, color=fc)
        ws[f"F{r}"].border = _thick()
        formula_cell(ws, r, 7,
                     f'=IF(C{r}>=0.5,"🔥 Excellent!",IF(C{r}>=0.3,"✅ On Track",IF(C{r}>=0.2,"⚠️ Improve","❌ Critical")))' if fmt=='0.0%' else f"=C{r}*12",
                     "@" if fmt=='0.0%' else '$#,##0',
                     bg=bg, bold=True, color=fc)
        ws[f"G{r}"].border = _thick()

    SAVINGS_RATE_ROW = SUMM_HDR + 5  # row 62

    # Conditional formatting — savings rate cell
    ws.conditional_formatting.add(
        f"C{SAVINGS_RATE_ROW}",
        CellIsRule("greaterThanOrEqual", ["0.5"],
                   fill=_fill(C_LGREEN), font=Font(bold=True, color=C_GREEN)))
    ws.conditional_formatting.add(
        f"C{SAVINGS_RATE_ROW}",
        CellIsRule("between", ["0.2","0.499"],
                   fill=_fill(C_AMBER), font=Font(bold=True, color=C_GOLD)))
    ws.conditional_formatting.add(
        f"C{SAVINGS_RATE_ROW}",
        CellIsRule("lessThan", ["0.2"],
                   fill=_fill(C_LRED), font=Font(bold=True, color=C_RED)))

    # Variance color scale
    ws.conditional_formatting.add(
        f"E{FIXED_START}:E{VAR_END}",
        ColorScaleRule(start_type="min", start_color=C_LGREEN,
                       mid_type="num",  mid_value=0, mid_color=C_WHITE,
                       end_type="max",  end_color=C_RED))

    return INC_TOTAL, FIXED_TOTAL, VAR_TOTAL, SAV_TOTAL


# ══════════════════════════════════════════════════════════════════════════════
# SHEET 4 — INVESTMENT GROWTH PROJECTIONS
# Key anchors: C6=age, C7=return, C8=inflation, C9=real return,
#              C10=start portfolio, C11=monthly contrib, C12=retirement age,
#              C13=annual expenses, C14=FIRE number, C15=years to FIRE
# Projection table: rows 19-68 (50 years), cols B-I
# ══════════════════════════════════════════════════════════════════════════════

def build_investment_growth(ws):
    ws.sheet_view.showGridLines = False
    widths = [2, 28, 15, 15, 16, 16, 16, 16, 2]
    for i, w in enumerate(widths, 1):
        set_width(ws, i, w)

    ws.row_dimensions[1].height = 8
    ws.row_dimensions[2].height = 44
    hdr(ws, 2, 2, 8, "INVESTMENT GROWTH PROJECTIONS", C_NAVY, 18)
    ws.row_dimensions[3].height = 20
    merge(ws, 3, 2, 8,
          '"Compound interest is the eighth wonder of the world. He who understands it, earns it." — Einstein',
          fill_color=C_LIGHT,
          font_obj=_font(size=10, italic=True, color=C_GRAY),
          align_obj=_align("center","center"))
    ws.row_dimensions[4].height = 10

    # ── INPUT PARAMETERS (rows 5-15) ──────────────────────────────────────────
    hdr(ws, 5, 2, 5, "INPUT PARAMETERS  (yellow = edit me)", C_NAVY, 11)
    hdr(ws, 5, 6, 8, "FIRE TARGETS", C_GREEN, 11)
    ws.row_dimensions[5].height = 22

    # Left inputs — rows 6-15, cols B-E
    left_params = [
        (6,  "Current Age",                      32,     "0",       True),
        (7,  "Annual Return Rate (nominal)",      0.08,   "0.00%",   True),
        (8,  "Inflation Rate",                    0.03,   "0.00%",   True),
        (9,  "Real Return Rate (nom - inflation)","=C7-C8","0.00%",  False),
        (10, "Starting Portfolio Value ($)",      50000,  '$#,##0',  True),
        (11, "Monthly Contribution ($)",          2000,   '$#,##0',  True),
        (12, "Target Retirement Age",             50,     "0",       True),
        (13, "Annual Retirement Expenses ($)",    "='Budget & Savings'!C28*12+'Budget & Savings'!C45*12", '$#,##0', False),
        (14, "FIRE Number  (25× annual expenses)","=C13*25", '$#,##0', False),
        (15, "Years to FIRE",                     "=C12-C6", "0.0",  False),
    ]

    for r, lbl_txt, val, fmt, editable in left_params:
        ws.row_dimensions[r].height = 22
        label(ws, r, 2, lbl_txt, bg=C_LGRAY, bold=True, color=C_NAVY)
        ws[f"B{r}"].border = _border()
        c_cell = ws[f"C{r}"]
        c_cell.value = val
        c_cell.number_format = fmt
        c_cell.font = _font(size=11, bold=True, color=C_BLUE if not editable else C_BLACK)
        c_cell.fill = _fill(C_AMBER if editable else C_LIGHT)
        c_cell.alignment = _align("right","center")
        c_cell.border = _thick()
        # Descriptive note
        merge(ws, r, 4, 5,
              "← edit" if editable else "← auto-calculated",
              fill_color=C_WHITE,
              font_obj=_font(size=9, italic=True, color=C_GRAY),
              align_obj=_align("left","center"))

    # Right targets — rows 6-15, cols F-H
    right_targets = [
        (6,  "Lean FIRE  (20× expenses)",  "=C13*20", '$#,##0'),
        (7,  "Standard FIRE  (25× expenses)","=C13*25", '$#,##0'),
        (8,  "Fat FIRE  (33× expenses)",    "=C13*33", '$#,##0'),
        (9,  "Barista FIRE  (15× expenses)","=C13*15", '$#,##0'),
        (10, "Annual Expenses  (from Budget)","=C13",  '$#,##0'),
        (11, "Monthly Income Needed (FIRE)", "=C14*0.04/12", '$#,##0'),
        (12, "Projected Value at Retirement",
             "=IFERROR(INDEX(G19:G68,MATCH(C12,C19:C68,0)),0)", '$#,##0'),
        (13, "FI Progress % Today",
             "=IFERROR('Net Worth'!C42/C14,0)", '0.0%'),
        (14, "Savings Rate (from Budget)",  "='Budget & Savings'!C62", '0.0%'),
        (15, "Monthly Contributions × 12",  "=C11*12", '$#,##0'),
    ]

    for r, lbl_txt, val, fmt in right_targets:
        ws.row_dimensions[r].height = 22
        label(ws, r, 6, lbl_txt, bg=C_LGRAY, bold=True, color=C_GREEN)
        ws[f"F{r}"].border = _border()
        merge(ws, r, 7, 8, val,
              fill_color=C_LGREEN,
              font_obj=_font(size=11, bold=True, color=C_GREEN),
              align_obj=_align("right","center"),
              num_fmt=fmt)

    ws.row_dimensions[16].height = 10

    # ── PROJECTION TABLE (rows 17-68) ─────────────────────────────────────────
    hdr(ws, 17, 2, 8, "YEAR-BY-YEAR COMPOUND GROWTH PROJECTION  (50 Years)", C_NAVY, 11)
    ws.row_dimensions[17].height = 22

    tbl_hdrs = ["Year", "Age", "Opening Balance", "Annual Contributions",
                "Investment Return", "Closing Balance", "FIRE Target", "FI %"]
    for ci, txt in enumerate(tbl_hdrs, 2):
        subhdr(ws, 18, ci, txt)
    ws.row_dimensions[18].height = 20

    TABLE_START = 19
    TABLE_END   = TABLE_START + 49  # row 68

    for yr in range(1, 51):
        r = TABLE_START + yr - 1
        ws.row_dimensions[r].height = 16
        alt = C_LGRAY if yr % 2 == 0 else C_WHITE
        highlight = (yr == 1)  # mark year 1

        # Year
        c_cell = ws[f"B{r}"]
        c_cell.value = yr
        c_cell.font = _font(size=9, bold=highlight)
        c_cell.fill = _fill(alt); c_cell.border = _border()
        c_cell.alignment = _align("center","center")
        c_cell.number_format = "0"

        # Age
        ws[f"C{r}"].value = f"=C6+{yr}"
        ws[f"C{r}"].font = _font(size=9)
        ws[f"C{r}"].fill = _fill(alt); ws[f"C{r}"].border = _border()
        ws[f"C{r}"].alignment = _align("center","center")
        ws[f"C{r}"].number_format = "0"

        # Opening balance
        ob = f"=C{TABLE_START-1+yr-1}" if yr > 1 else "=C10"
        if yr == 1:
            ob = "=C10"
        else:
            ob = f"=G{r-1}"
        ws[f"D{r}"].value = ob
        ws[f"D{r}"].font = _font(size=9); ws[f"D{r}"].fill = _fill(alt)
        ws[f"D{r}"].border = _border(); ws[f"D{r}"].alignment = _align("right","center")
        ws[f"D{r}"].number_format = '$#,##0'

        # Annual contributions
        ws[f"E{r}"].value = "=C11*12"
        ws[f"E{r}"].font = _font(size=9); ws[f"E{r}"].fill = _fill(alt)
        ws[f"E{r}"].border = _border(); ws[f"E{r}"].alignment = _align("right","center")
        ws[f"E{r}"].number_format = '$#,##0'

        # Investment return (on opening balance + half contributions for mid-year approx)
        ws[f"F{r}"].value = f"=(D{r}+E{r}/2)*C7"
        ws[f"F{r}"].font = _font(size=9, color=C_GREEN); ws[f"F{r}"].fill = _fill(alt)
        ws[f"F{r}"].border = _border(); ws[f"F{r}"].alignment = _align("right","center")
        ws[f"F{r}"].number_format = '$#,##0'

        # Closing balance
        ws[f"G{r}"].value = f"=D{r}+E{r}+F{r}"
        ws[f"G{r}"].font = _font(size=10, bold=True, color=C_NAVY)
        ws[f"G{r}"].fill = _fill(alt); ws[f"G{r}"].border = _border()
        ws[f"G{r}"].alignment = _align("right","center")
        ws[f"G{r}"].number_format = '$#,##0'

        # FIRE Target
        ws[f"H{r}"].value = "=C14"
        ws[f"H{r}"].font = _font(size=9, italic=True, color=C_RED)
        ws[f"H{r}"].fill = _fill(alt); ws[f"H{r}"].border = _border()
        ws[f"H{r}"].alignment = _align("right","center")
        ws[f"H{r}"].number_format = '$#,##0'

        # FI %
        ws[f"I{r}"].value = f"=IF(H{r}>0,G{r}/H{r},0)"
        ws[f"I{r}"].font = _font(size=9, bold=True)
        ws[f"I{r}"].fill = _fill(alt); ws[f"I{r}"].border = _border()
        ws[f"I{r}"].alignment = _align("center","center")
        ws[f"I{r}"].number_format = '0%'

    # Conditional formatting on closing balance vs FIRE target
    ws.conditional_formatting.add(
        f"G{TABLE_START}:G{TABLE_END}",
        CellIsRule("greaterThanOrEqual", [f"=H{TABLE_START}"],
                   fill=_fill(C_LGREEN), font=Font(bold=True, color=C_GREEN)))

    # Color scale on FI %
    ws.conditional_formatting.add(
        f"I{TABLE_START}:I{TABLE_END}",
        ColorScaleRule(start_type="num", start_value=0,   start_color=C_LRED,
                       mid_type="num",   mid_value=0.5,   mid_color=C_AMBER,
                       end_type="num",   end_value=1.0,   end_color=C_LGREEN))

    # Highlight FIRE year (when FI >= 100%)
    ws.conditional_formatting.add(
        f"B{TABLE_START}:I{TABLE_END}",
        CellIsRule("greaterThanOrEqual",
                   [f"=IF(I{TABLE_START}>=1,1,2)"],
                   fill=_fill(C_LGREEN)))

    ws.freeze_panes = "C19"

    # Chart
    try:
        chart = LineChart()
        chart.title = "Portfolio Growth vs FIRE Target"
        chart.style = 10
        chart.y_axis.title = "Value ($)"
        chart.x_axis.title = "Year"
        chart.height = 16
        chart.width = 26

        # Closing balance (col G = index 6)
        d1 = Reference(ws, min_col=7, max_col=7,
                        min_row=TABLE_START - 1, max_row=TABLE_END)
        # FIRE target (col H = index 8)
        d2 = Reference(ws, min_col=8, max_col=8,
                        min_row=TABLE_START - 1, max_row=TABLE_END)
        chart.add_data(d1, titles_from_data=True)
        chart.add_data(d2, titles_from_data=True)

        cats = Reference(ws, min_col=2, min_row=TABLE_START, max_row=TABLE_END)
        chart.set_categories(cats)

        chart.series[0].graphicalProperties.line.solidFill = C_BLUE
        chart.series[0].graphicalProperties.line.width = 25000
        chart.series[1].graphicalProperties.line.solidFill = C_RED
        chart.series[1].graphicalProperties.line.width = 18000
        chart.series[1].graphicalProperties.line.dashDot = "dash"

        ws.add_chart(chart, f"B{TABLE_END + 3}")
    except Exception:
        pass  # chart is a bonus

    return TABLE_START, TABLE_END


# ══════════════════════════════════════════════════════════════════════════════
# SHEET 5 — SWR / POST-RETIREMENT CALCULATOR
# Key anchor: C9 = Safe Withdrawal Rate
# ══════════════════════════════════════════════════════════════════════════════

def build_swr(ws):
    ws.sheet_view.showGridLines = False
    widths = [2, 30, 15, 15, 15, 15, 15, 2]
    for i, w in enumerate(widths, 1):
        set_width(ws, i, w)

    ws.row_dimensions[1].height = 8
    ws.row_dimensions[2].height = 44
    hdr(ws, 2, 2, 7, "SAFE WITHDRAWAL RATE & POST-RETIREMENT PLANNER", C_NAVY, 15)
    ws.row_dimensions[3].height = 20
    merge(ws, 3, 2, 7,
          "The 4% Rule: withdraw 4% of portfolio annually — historically survived 95%+ of 30-year retirements (Trinity Study)",
          fill_color=C_LIGHT,
          font_obj=_font(size=10, italic=True, color=C_GRAY),
          align_obj=_align("center","center"))
    ws.row_dimensions[4].height = 10

    # ── INPUTS (rows 5-12) ─────────────────────────────────────────────────────
    # Section headers on row 5 (merged), column sub-headers on row 6
    hdr(ws, 5, 2, 4, "RETIREMENT INPUTS", C_NAVY, 11)
    hdr(ws, 5, 5, 7, "SWR SCENARIO COMPARISON", C_BLUE, 11)
    ws.row_dimensions[5].height = 22

    # Sub-headers row 6
    for c, txt in zip([2,3,5,6,7], ["Parameter","Value","SWR Rate","Annual Withdrawal","FIRE # Required"]):
        subhdr(ws, 6, c, txt)
    merge(ws, 6, 3, 4, "Value",
          fill_color=C_SKY,
          font_obj=_font(size=9, bold=True, color=C_NAVY),
          align_obj=_align("center","center"))
    ws.row_dimensions[6].height = 20

    inputs = [
        (7,  "Portfolio at Retirement ($)",
             "=IFERROR(INDEX('Investment Growth'!G19:G68,MATCH('Investment Growth'!C12,'Investment Growth'!C19:C68,0)),0)",
             '$#,##0', False),
        (8,  "Annual Expenses in Retirement ($)",
             "='Budget & Savings'!C28*12+'Budget & Savings'!C45*12",
             '$#,##0', False),
        (9,  "Inflation Rate",                    0.03,   '0.00%', True),
        (10, "Safe Withdrawal Rate (SWR)",         0.04,   '0.00%', True),
        (11, "Expected Portfolio Return Post-FIRE", 0.07,  '0.00%', True),
        (12, "Retirement Duration (years)",         35,    "0",     True),
        (13, "Retirement Age",                     "='Investment Growth'!C12", "0", False),
    ]

    for r, lbl_txt, val, fmt, editable in inputs:
        ws.row_dimensions[r].height = 22
        label(ws, r, 2, lbl_txt, bold=True, color=C_NAVY)
        ws[f"B{r}"].border = _border()
        merge(ws, r, 3, 4, val,
              fill_color=C_AMBER if editable else C_LIGHT,
              font_obj=_font(size=11, bold=True, color=C_BLACK if editable else C_BLUE),
              align_obj=_align("right","center"),
              num_fmt=fmt,
              border_obj=_thick())

    PORT_ROW  = 7
    EXP_ROW   = 8
    INF_ROW   = 9
    SWR_ROW   = 10  # Dashboard anchor C10
    RET_ROW   = 11
    DUR_ROW   = 12
    AGE_ROW   = 13

    # SWR scenario table — rows 7-13, cols E-G
    scenarios = [
        (7,  "Ultra-Conservative 2.5%", 0.025, C_BLUE),
        (8,  "Conservative 3%",         0.030, "5DADE2"),
        (9,  "Moderate 3.5%",           0.035, C_NAVY),
        (10, "Classic 4% Rule ★",       0.040, C_GREEN),
        (11, "Aggressive 4.5%",         0.045, C_GOLD),
        (12, "Very Aggressive 5%",      0.050, C_RED),
        (13, "YOLO 6%",                 0.060, C_PURPLE),
    ]
    for r, name, rate, color in scenarios:
        ws[f"E{r}"].value = name
        ws[f"E{r}"].font = _font(size=9, bold=True, color=C_WHITE)
        ws[f"E{r}"].fill = _fill(color); ws[f"E{r}"].border = _border()
        ws[f"E{r}"].alignment = _align("left","center")

        ws[f"F{r}"].value = f"=C{PORT_ROW}*{rate}"
        ws[f"F{r}"].number_format = '$#,##0'; ws[f"F{r}"].border = _border()
        ws[f"F{r}"].font = _font(size=10, bold=True); ws[f"F{r}"].fill = _fill(C_WHITE)
        ws[f"F{r}"].alignment = _align("right","center")

        ws[f"G{r}"].value = f"=C{EXP_ROW}/{rate}"
        ws[f"G{r}"].number_format = '$#,##0'; ws[f"G{r}"].border = _border()
        ws[f"G{r}"].font = _font(size=10, bold=True, color=color)
        ws[f"G{r}"].fill = _fill(C_LIGHT); ws[f"G{r}"].alignment = _align("right","center")

    ws.row_dimensions[14].height = 10

    # ── VIABILITY ANALYSIS (rows 15-21) ────────────────────────────────────────
    hdr(ws, 15, 2, 7, "RETIREMENT VIABILITY ANALYSIS", C_GREEN, 11)
    ws.row_dimensions[15].height = 22

    viability = [
        (16, "Your Annual Withdrawal (at chosen SWR)", f"=C{PORT_ROW}*C{SWR_ROW}", '$#,##0', C_LGREEN, C_GREEN),
        (17, "Monthly Retirement Income",  f"=C{PORT_ROW}*C{SWR_ROW}/12", '$#,##0.00', C_LGREEN, C_GREEN),
        (18, "FIRE Number Needed (your expenses÷SWR)", f"=C{EXP_ROW}/C{SWR_ROW}", '$#,##0', C_AMBER, C_GOLD),
        (19, "Portfolio Surplus / Deficit vs FIRE#", f"=C{PORT_ROW}-C{EXP_ROW}/C{SWR_ROW}", '$#,##0', C_LIGHT, C_BLUE),
        (20, "FIRE READY?",
             f'=IF(C{PORT_ROW}>=C{EXP_ROW}/C{SWR_ROW},"✅ YES — You Have Achieved FIRE!","⏳ Not Yet — Keep Going!")',
             "@", C_LIGHT, C_NAVY),
        (21, "Years Portfolio Lasts (no returns)", f"=C{PORT_ROW}/C{EXP_ROW}", '0.0 "yrs"', C_LGREEN, C_GREEN),
        (22, "Breakeven Return Rate Needed",
             f"=IFERROR(C{SWR_ROW}-C{INF_ROW},0)", '0.00%', C_LGRAY, C_GRAY),
    ]

    for r, lbl_txt, frm, fmt, bg, fc in viability:
        ws.row_dimensions[r].height = 26
        label(ws, r, 2, lbl_txt, bg, bold=True, color=fc)
        ws[f"B{r}"].border = _thick()
        ws[f"B{r}"].font = _font(size=10, bold=True, color=fc)
        merge(ws, r, 3, 7, frm,
              fill_color=bg,
              font_obj=_font(size=13, bold=True, color=fc),
              align_obj=_align("center","center"),
              num_fmt=fmt,
              border_obj=_thick())

    # Conditional: portfolio surplus
    ws.conditional_formatting.add(
        f"C19",
        CellIsRule("greaterThan", ["0"],
                   fill=_fill(C_LGREEN), font=Font(bold=True, color=C_GREEN)))
    ws.conditional_formatting.add(
        f"C19",
        CellIsRule("lessThan", ["0"],
                   fill=_fill(C_LRED), font=Font(bold=True, color=C_RED)))

    ws.row_dimensions[23].height = 12

    # ── PORTFOLIO LONGEVITY TABLE (rows 24-74) ─────────────────────────────────
    hdr(ws, 24, 2, 7, "PORTFOLIO LONGEVITY SIMULATION — Year-by-Year Post-Retirement", C_NAVY, 11)
    ws.row_dimensions[24].height = 22

    lon_hdrs = ["Year", "Age", "Start Balance ($)", "Withdrawal (infl-adj) ($)",
                "Return on Portfolio ($)", "End Balance ($)", "Status"]
    for ci, txt in enumerate(lon_hdrs, 2):
        subhdr(ws, 25, ci, txt)
    ws.row_dimensions[25].height = 20

    LON_START = 26
    LON_END   = LON_START + 49  # row 75

    for yr in range(1, 51):
        r = LON_START + yr - 1
        ws.row_dimensions[r].height = 16
        alt = C_LGRAY if yr % 2 == 0 else C_WHITE

        # Year
        ws[f"B{r}"].value = yr
        ws[f"B{r}"].font = _font(size=9); ws[f"B{r}"].fill = _fill(alt)
        ws[f"B{r}"].border = _border(); ws[f"B{r}"].alignment = _align("center","center")
        ws[f"B{r}"].number_format = "0"

        # Age
        ws[f"C{r}"].value = f"=C{AGE_ROW}+{yr}"
        ws[f"C{r}"].font = _font(size=9); ws[f"C{r}"].fill = _fill(alt)
        ws[f"C{r}"].border = _border(); ws[f"C{r}"].alignment = _align("center","center")
        ws[f"C{r}"].number_format = "0"

        # Start balance
        sb = f"=C{PORT_ROW}" if yr == 1 else f"=G{r-1}"
        ws[f"D{r}"].value = sb
        ws[f"D{r}"].font = _font(size=9); ws[f"D{r}"].fill = _fill(alt)
        ws[f"D{r}"].border = _border(); ws[f"D{r}"].alignment = _align("right","center")
        ws[f"D{r}"].number_format = '$#,##0'

        # Inflation-adjusted withdrawal
        ws[f"E{r}"].value = f"=C{EXP_ROW}*(1+C{INF_ROW})^{yr-1}"
        ws[f"E{r}"].font = _font(size=9, color=C_RED); ws[f"E{r}"].fill = _fill(alt)
        ws[f"E{r}"].border = _border(); ws[f"E{r}"].alignment = _align("right","center")
        ws[f"E{r}"].number_format = '$#,##0'

        # Return (on end-of-period balance after withdrawal)
        ws[f"F{r}"].value = f"=MAX(D{r}-E{r},0)*C{RET_ROW}"
        ws[f"F{r}"].font = _font(size=9, color=C_GREEN); ws[f"F{r}"].fill = _fill(alt)
        ws[f"F{r}"].border = _border(); ws[f"F{r}"].alignment = _align("right","center")
        ws[f"F{r}"].number_format = '$#,##0'

        # End balance
        ws[f"G{r}"].value = f"=MAX(D{r}-E{r}+F{r},0)"
        ws[f"G{r}"].font = _font(size=10, bold=True); ws[f"G{r}"].fill = _fill(alt)
        ws[f"G{r}"].border = _border(); ws[f"G{r}"].alignment = _align("right","center")
        ws[f"G{r}"].number_format = '$#,##0'

        # Status
        ws[f"H{r}"].value = (
            f'=IF(D{r}<=0,"💀 Depleted",'
            f'IF(G{r}<=0,"💀 Depleted",'
            f'IF(G{r}<C{EXP_ROW},"⚠️ Warning","✅ Healthy")))'
        )
        ws[f"H{r}"].font = _font(size=9, bold=True); ws[f"H{r}"].fill = _fill(alt)
        ws[f"H{r}"].border = _border(); ws[f"H{r}"].alignment = _align("center","center")

    # Conditional formatting on end balance
    ws.conditional_formatting.add(
        f"G{LON_START}:G{LON_END}",
        CellIsRule("equal", ["0"],
                   fill=_fill(C_LRED), font=Font(bold=True, color=C_RED)))
    ws.conditional_formatting.add(
        f"G{LON_START}:G{LON_END}",
        ColorScaleRule(start_type="num", start_value=1,       start_color=C_RED,
                       mid_type="num",   mid_value=250000,    mid_color=C_AMBER,
                       end_type="num",   end_value=2000000,   end_color=C_GREEN))

    ws.freeze_panes = "C25"


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def create_fire_workbook(output_path="FIRE_Retirement_Planner.xlsx"):
    wb = Workbook()

    ws_dash = wb.active
    ws_dash.title = "Dashboard"
    ws_nw   = wb.create_sheet("Net Worth")
    ws_bud  = wb.create_sheet("Budget & Savings")
    ws_inv  = wb.create_sheet("Investment Growth")
    ws_swr  = wb.create_sheet("SWR Calculator")

    # Tab colors
    ws_dash.sheet_properties.tabColor = "1B3A5C"
    ws_nw.sheet_properties.tabColor   = "1A7A4A"
    ws_bud.sheet_properties.tabColor  = "2471A3"
    ws_inv.sheet_properties.tabColor  = "D4AC0D"
    ws_swr.sheet_properties.tabColor  = "B03A2E"

    print("  Building Dashboard...")
    build_dashboard(ws_dash)

    print("  Building Net Worth Tracker...")
    build_net_worth(ws_nw)

    print("  Building Budget & Savings Rate...")
    build_budget(ws_bud)

    print("  Building Investment Growth Projections...")
    build_investment_growth(ws_inv)

    print("  Building SWR / Post-Retirement Calculator...")
    build_swr(ws_swr)

    # Print area and zoom
    for ws in [ws_dash, ws_nw, ws_bud, ws_inv, ws_swr]:
        ws.sheet_view.zoomScale = 95

    # Freeze panes
    ws_nw.freeze_panes  = "C7"
    ws_bud.freeze_panes = "C6"

    print(f"  Saving to {output_path}...")
    wb.save(output_path)
    print(f"\n✅  Saved: {output_path}")
    print("    Sheets: Dashboard | Net Worth | Budget & Savings | Investment Growth | SWR Calculator")
    return output_path


if __name__ == "__main__":
    create_fire_workbook()
