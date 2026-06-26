#!/usr/bin/env python3
"""
FIRE Example: 25-year-old earning ₹5 Lakh per year
Run: python fire_example_5lac.py
Output: FIRE_Example_5Lac.xlsx
"""

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Border, Side, Alignment
from openpyxl.formatting.rule import ColorScaleRule, CellIsRule
from openpyxl.chart import LineChart, Reference
from openpyxl.utils import get_column_letter

# ── Palette ────────────────────────────────────────────────────────────────────
NAVY   = "1B3A5C"
BLUE   = "2471A3"
SKY    = "AED6F1"
LIGHT  = "EBF5FB"
GOLD   = "D4AC0D"
AMBER  = "FEF9E7"
GREEN  = "1A7A4A"
LGREEN = "D5F5E3"
RED    = "B03A2E"
LRED   = "FADBD8"
PURPLE = "6C3483"
LGRAY  = "F2F3F4"
WHITE  = "FFFFFF"
BLACK  = "17202A"
GRAY   = "566573"

def F(h): return PatternFill("solid", fgColor=h)
def Fn(size=10, bold=False, color=BLACK, italic=False):
    return Font(name="Calibri", size=size, bold=bold, color=color, italic=italic)
def Al(h="left", v="center", wrap=False):
    return Alignment(horizontal=h, vertical=v, wrap_text=wrap)
def Bd(style="thin", color="BFBFBF"):
    s = Side(style=style, color=color)
    return Border(left=s, right=s, top=s, bottom=s)
def ThickBd():
    s = Side(style="medium", color="404040")
    return Border(left=s, right=s, top=s, bottom=s)
def W(ws, c, w): ws.column_dimensions[get_column_letter(c)].width = w

def banner(ws, r, c1, c2, text, bg=NAVY, size=13, color=WHITE):
    if c1 != c2:
        ws.merge_cells(f"{get_column_letter(c1)}{r}:{get_column_letter(c2)}{r}")
    cell = ws[f"{get_column_letter(c1)}{r}"]
    cell.value = text
    cell.font = Fn(size, bold=True, color=color)
    cell.fill = F(bg); cell.border = Bd(); cell.alignment = Al("center","center")
    ws.row_dimensions[r].height = 24
    return cell

def section(ws, r, c1, c2, text, bg=BLUE):
    banner(ws, r, c1, c2, text, bg=bg, size=11)

def row_lv(ws, r, c_lbl, c_val, label, value, fmt="@", editable=False, note=None):
    """Label-value pair row."""
    ws.row_dimensions[r].height = 20
    lc = ws[f"{get_column_letter(c_lbl)}{r}"]
    lc.value = label; lc.font = Fn(10, bold=True, color=NAVY)
    lc.fill = F(LGRAY); lc.border = Bd(); lc.alignment = Al("left","center")

    vc = ws[f"{get_column_letter(c_val)}{r}"]
    vc.value = value; vc.number_format = fmt
    vc.font = Fn(11, bold=True, color=BLUE if not editable else BLACK)
    vc.fill = F(AMBER if editable else LIGHT)
    vc.border = ThickBd(); vc.alignment = Al("right","center")

    if note:
        nc = ws[f"{get_column_letter(c_val+1)}{r}"]
        nc.value = note; nc.font = Fn(9, italic=True, color=GRAY)
        nc.fill = F(WHITE); nc.border = Bd(); nc.alignment = Al("left","center")

def result_row(ws, r, c1, c2, c3, label, formula, fmt, bg, fc, height=28):
    ws.row_dimensions[r].height = height
    if c1 != c2:
        ws.merge_cells(f"{get_column_letter(c1)}{r}:{get_column_letter(c2)}{r}")
    lc = ws[f"{get_column_letter(c1)}{r}"]
    lc.value = label; lc.font = Fn(11, bold=True, color=fc)
    lc.fill = F(bg); lc.border = ThickBd(); lc.alignment = Al("left","center")

    if c2+1 != c3:
        ws.merge_cells(f"{get_column_letter(c2+1)}{r}:{get_column_letter(c3)}{r}")
    vc = ws[f"{get_column_letter(c2+1)}{r}"]
    vc.value = formula; vc.number_format = fmt
    vc.font = Fn(14, bold=True, color=fc)
    vc.fill = F(bg); vc.border = ThickBd(); vc.alignment = Al("right","center")


# ══════════════════════════════════════════════════════════════════════════════
# SHEET 1: PROFILE & FIRE PLAN
# ══════════════════════════════════════════════════════════════════════════════

def build_profile(ws):
    ws.sheet_view.showGridLines = False
    for c, w in [(1,2),(2,28),(3,18),(4,22),(5,22),(6,16),(7,2)]:
        W(ws, c, w)

    ws.row_dimensions[1].height = 8
    ws.row_dimensions[2].height = 50
    banner(ws, 2, 2, 6,
           "FIRE PLAN — 25-Year-Old  ·  ₹5 Lakh Annual Salary  🇮🇳",
           NAVY, 18)
    ws.row_dimensions[3].height = 22
    ws.merge_cells("B3:F3")
    c = ws["B3"]
    c.value = ("Yellow cells = your inputs  ·  Blue cells = auto-calculated  ·  "
               "Change yellow cells and everything recalculates automatically")
    c.font = Fn(10, italic=True, color=GRAY); c.fill = F(LIGHT)
    c.alignment = Al("center","center"); c.border = Bd()
    ws.row_dimensions[4].height = 8

    # ── A: INCOME BREAKDOWN ────────────────────────────────────────────────────
    section(ws, 5, 2, 6, "A.  YOUR INCOME BREAKDOWN")
    ws.row_dimensions[6].height = 18
    for c, t in zip([2,3,4,5,6], ["Item","Amount (₹)","Calculation","Note",""]):
        ws[f"{get_column_letter(c)}6"].value = t
        ws[f"{get_column_letter(c)}6"].font = Fn(9, bold=True, color=NAVY)
        ws[f"{get_column_letter(c)}6"].fill = F(SKY)
        ws[f"{get_column_letter(c)}6"].border = Bd()
        ws[f"{get_column_letter(c)}6"].alignment = Al("center","center")

    income_rows = [
        (7,  "Annual CTC (Cost to Company)",     500000,  '₹#,##0', True,
              "=C7",         "Your total annual package"),
        (8,  "Annual EPF — Employee 12%",         "=C7*0.12/12*12", '₹#,##0', False,
              "=C7×12%",     "Auto-deducted; goes to your EPF account"),
        (9,  "Estimated Annual Tax (old regime)", "=MAX(C7-250000,0)*0.05", '₹#,##0', False,
              "5% on ₹2.5L+",  "₹0–2.5L nil, ₹2.5L–5L at 5%"),
        (10, "Annual Take-Home (Net)",           "=C7-C8-C9", '₹#,##0', False,
              "=CTC−EPF−Tax",  "Actual money hitting your bank"),
        (11, "Monthly Take-Home",                "=C10/12", '₹#,##0', False,
              "=C10÷12",      "What you work with each month"),
    ]

    for r, label, val, fmt, editable, calc, note in income_rows:
        ws.row_dimensions[r].height = 20
        ws[f"B{r}"].value = label; ws[f"B{r}"].font = Fn(10, bold=True, color=NAVY)
        ws[f"B{r}"].fill = F(LGRAY); ws[f"B{r}"].border = Bd(); ws[f"B{r}"].alignment = Al("left","center")
        ws[f"C{r}"].value = val; ws[f"C{r}"].number_format = fmt
        ws[f"C{r}"].font = Fn(11, bold=True, color=BLACK if editable else BLUE)
        ws[f"C{r}"].fill = F(AMBER if editable else LIGHT)
        ws[f"C{r}"].border = ThickBd(); ws[f"C{r}"].alignment = Al("right","center")
        ws[f"D{r}"].value = calc; ws[f"D{r}"].font = Fn(9, italic=True, color=PURPLE)
        ws[f"D{r}"].fill = F(WHITE); ws[f"D{r}"].border = Bd(); ws[f"D{r}"].alignment = Al("center","center")
        ws[f"E{r}"].value = note; ws[f"E{r}"].font = Fn(9, italic=True, color=GRAY)
        ws[f"E{r}"].fill = F(WHITE); ws[f"E{r}"].border = Bd()
        ws[f"E{r}"].alignment = Al("left","center",True)
        ws[f"F{r}"].fill = F(WHITE); ws[f"F{r}"].border = Bd()

    ws.row_dimensions[12].height = 8

    # ── B: MONTHLY BUDGET ──────────────────────────────────────────────────────
    section(ws, 13, 2, 6, "B.  MONTHLY BUDGET ALLOCATION  (out of ₹ in-hand)")
    for c, t in zip([2,3,4,5,6],
                    ["Category","Budget (₹/mo)","% of Income","Annual (₹)","Remarks"]):
        ws[f"{get_column_letter(c)}14"].value = t
        ws[f"{get_column_letter(c)}14"].font = Fn(9, bold=True, color=NAVY)
        ws[f"{get_column_letter(c)}14"].fill = F(SKY)
        ws[f"{get_column_letter(c)}14"].border = Bd()
        ws[f"{get_column_letter(c)}14"].alignment = Al("center","center")
    ws.row_dimensions[14].height = 18

    budget_rows = [
        # Fixed expenses
        (15, "Rent (shared / PG)",                 8000,  "Shared accommodation saves big"),
        (16, "Electricity, Water & Gas",             800,  ""),
        (17, "Mobile + Internet",                   1000,  "₹400 SIM + ₹600 broadband"),
        (18, "Health Insurance Premium",             1500,  "₹5L cover ~ ₹1500/mo"),
        (19, "Term Life Insurance",                   500,  "₹1Cr cover ~ ₹6000/yr at 25"),
        (20, "OTT / Subscriptions",                  500,  "Netflix, Spotify etc."),
    ]
    variable_rows = [
        (22, "Groceries & Kirana",                  3000,  ""),
        (23, "Dining Out / Zomato / Swiggy",         2000,  "Limit this — huge savings lever"),
        (24, "Petrol / Auto / Metro",                2000,  ""),
        (25, "Clothing & Shopping",                  1500,  ""),
        (26, "Medical / Pharmacy",                   1000,  ""),
        (27, "Entertainment & Outings",              1500,  ""),
        (28, "Miscellaneous",                        1200,  ""),
    ]
    savings_rows = [
        (30, "SIP — Equity Mutual Fund (Nifty 50)", 5000, "Core FIRE investment"),
        (31, "PPF Contribution",                     1000, "Tax-free, 7.1% guaranteed"),
        (32, "Emergency Fund / Liquid FD",            500, "Build 3–6 months expenses first"),
    ]

    INCOME_MONTHLY_ROW = 11  # =C11

    def budget_row(ws_local, r, label, amount, note, bg=WHITE):
        ws_local.row_dimensions[r].height = 19
        ws_local[f"B{r}"].value = label; ws_local[f"B{r}"].font = Fn(10, color=BLACK)
        ws_local[f"B{r}"].fill = F(LGRAY); ws_local[f"B{r}"].border = Bd()
        ws_local[f"B{r}"].alignment = Al("left","center")
        ws_local[f"C{r}"].value = amount; ws_local[f"C{r}"].number_format = '₹#,##0'
        ws_local[f"C{r}"].font = Fn(10, color=BLACK)
        ws_local[f"C{r}"].fill = F(AMBER); ws_local[f"C{r}"].border = Bd()
        ws_local[f"C{r}"].alignment = Al("right","center")
        ws_local[f"D{r}"].value = f"=IF(C{INCOME_MONTHLY_ROW}>0,C{r}/C{INCOME_MONTHLY_ROW},0)"
        ws_local[f"D{r}"].number_format = '0.0%'; ws_local[f"D{r}"].font = Fn(9, color=BLUE)
        ws_local[f"D{r}"].fill = F(LIGHT); ws_local[f"D{r}"].border = Bd()
        ws_local[f"D{r}"].alignment = Al("center","center")
        ws_local[f"E{r}"].value = f"=C{r}*12"; ws_local[f"E{r}"].number_format = '₹#,##0'
        ws_local[f"E{r}"].font = Fn(9, color=NAVY); ws_local[f"E{r}"].fill = F(LIGHT)
        ws_local[f"E{r}"].border = Bd(); ws_local[f"E{r}"].alignment = Al("right","center")
        ws_local[f"F{r}"].value = note; ws_local[f"F{r}"].font = Fn(9, italic=True, color=GRAY)
        ws_local[f"F{r}"].fill = F(WHITE); ws_local[f"F{r}"].border = Bd()
        ws_local[f"F{r}"].alignment = Al("left","center",True)

    def sub_header(ws_local, r, text, bg=BLUE):
        ws_local.merge_cells(f"B{r}:F{r}")
        ws_local[f"B{r}"].value = text
        ws_local[f"B{r}"].font = Fn(9, bold=True, color=WHITE)
        ws_local[f"B{r}"].fill = F(bg); ws_local[f"B{r}"].border = Bd()
        ws_local[f"B{r}"].alignment = Al("left","center")
        ws_local.row_dimensions[r].height = 17

    def sec_hdr(r, text, bg):
        """Section header row — column B only (no merge), rest styled solid."""
        ws.row_dimensions[r].height = 18
        ws[f"B{r}"].value = text; ws[f"B{r}"].font = Fn(9, bold=True, color=WHITE)
        ws[f"B{r}"].fill = F(bg); ws[f"B{r}"].border = Bd(); ws[f"B{r}"].alignment = Al("left","center")
        for c in [3,4,5,6]:
            ws[f"{get_column_letter(c)}{r}"].fill = F(bg)
            ws[f"{get_column_letter(c)}{r}"].border = Bd()

    # Column header row 14 — individual cells, no merge
    for c, t in zip([2,3,4,5,6],
                    ["  FIXED EXPENSES  ·  Category", "Budget (₹/mo)", "% of Income", "Annual (₹)", "Remarks"]):
        ws[f"{get_column_letter(c)}14"].value = t
        ws[f"{get_column_letter(c)}14"].font = Fn(9, bold=True, color=WHITE)
        ws[f"{get_column_letter(c)}14"].fill = F(BLUE)
        ws[f"{get_column_letter(c)}14"].border = Bd()
        ws[f"{get_column_letter(c)}14"].alignment = Al("center","center")
    ws["B14"].alignment = Al("left","center")
    ws.row_dimensions[14].height = 18

    for r, label, amt, note in budget_rows:
        budget_row(ws, r, label, amt, note)

    # Fixed total row 21
    ws["B21"].value = "TOTAL FIXED EXPENSES"
    ws["B21"].font = Fn(10, bold=True, color=WHITE); ws["B21"].fill = F(NAVY); ws["B21"].border = Bd()
    ws["B21"].alignment = Al("left","center")
    for c, val in [("C","=SUM(C15:C20)"),("D",f"=IF(C{INCOME_MONTHLY_ROW}>0,C21/C{INCOME_MONTHLY_ROW},0)"),("E","=C21*12")]:
        ws[f"{c}21"].value = val
        ws[f"{c}21"].number_format = '₹#,##0' if c != "D" else '0.0%'
        ws[f"{c}21"].font = Fn(10, bold=True, color=WHITE); ws[f"{c}21"].fill = F(NAVY)
        ws[f"{c}21"].border = Bd(); ws[f"{c}21"].alignment = Al("right","center")
    ws["F21"].fill = F(NAVY); ws["F21"].border = Bd()
    ws.row_dimensions[21].height = 20

    # Row 22 = VARIABLE section header (separate from data)
    sec_hdr(22, "  VARIABLE EXPENSES  ·  Category", PURPLE)
    for c, t in zip([3,4,5,6], ["Budget (₹/mo)","% of Income","Annual (₹)","Remarks"]):
        ws[f"{get_column_letter(c)}22"].value = t
        ws[f"{get_column_letter(c)}22"].font = Fn(9, bold=True, color=WHITE)

    # Variable rows shifted to start at 23
    variable_rows_shifted = [(r+1, lbl, amt, note) for r, lbl, amt, note in variable_rows]
    for r, label, amt, note in variable_rows_shifted:
        budget_row(ws, r, label, amt, note)

    # Variable total at row 30 (was 29, shifted +1)
    ws["B30"].value = "TOTAL VARIABLE EXPENSES"
    ws["B30"].font = Fn(10, bold=True, color=WHITE); ws["B30"].fill = F(PURPLE); ws["B30"].border = Bd()
    ws["B30"].alignment = Al("left","center")
    for c, val in [("C","=SUM(C23:C29)"),("D",f"=IF(C{INCOME_MONTHLY_ROW}>0,C30/C{INCOME_MONTHLY_ROW},0)"),("E","=C30*12")]:
        ws[f"{c}30"].value = val
        ws[f"{c}30"].number_format = '₹#,##0' if c != "D" else '0.0%'
        ws[f"{c}30"].font = Fn(10, bold=True, color=WHITE); ws[f"{c}30"].fill = F(PURPLE)
        ws[f"{c}30"].border = Bd(); ws[f"{c}30"].alignment = Al("right","center")
    ws["F30"].fill = F(PURPLE); ws["F30"].border = Bd()
    ws.row_dimensions[30].height = 20

    # Row 31 = SAVINGS section header
    sec_hdr(31, "  SAVINGS & INVESTMENTS ← FIRE ENGINE  ·  Category", GREEN)
    for c, t in zip([3,4,5,6], ["Budget (₹/mo)","% of Income","Annual (₹)","Remarks"]):
        ws[f"{get_column_letter(c)}31"].value = t
        ws[f"{get_column_letter(c)}31"].font = Fn(9, bold=True, color=WHITE)

    # Savings rows shifted to start at 32
    savings_rows_shifted = [(r+2, lbl, amt, note) for r, lbl, amt, note in savings_rows]
    for r, label, amt, note in savings_rows_shifted:
        budget_row(ws, r, label, amt, note)

    # EPF auto row 35 (savings: 32,33,34 → EPF at 35)
    EPF_ROW = 35
    ws.row_dimensions[EPF_ROW].height = 19
    ws[f"B{EPF_ROW}"].value = "EPF — Employee Share (auto 12%)"
    ws[f"B{EPF_ROW}"].font = Fn(10, color=BLACK); ws[f"B{EPF_ROW}"].fill = F(LGRAY)
    ws[f"B{EPF_ROW}"].border = Bd(); ws[f"B{EPF_ROW}"].alignment = Al("left","center")
    ws[f"C{EPF_ROW}"].value = "=C7*0.12/12"
    ws[f"C{EPF_ROW}"].number_format = '₹#,##0'; ws[f"C{EPF_ROW}"].font = Fn(10, color=BLUE)
    ws[f"C{EPF_ROW}"].fill = F(LIGHT); ws[f"C{EPF_ROW}"].border = Bd(); ws[f"C{EPF_ROW}"].alignment = Al("right","center")
    ws[f"D{EPF_ROW}"].value = f"=IF(C{INCOME_MONTHLY_ROW}>0,C{EPF_ROW}/C{INCOME_MONTHLY_ROW},0)"
    ws[f"D{EPF_ROW}"].number_format = '0.0%'; ws[f"D{EPF_ROW}"].font = Fn(9, color=BLUE)
    ws[f"D{EPF_ROW}"].fill = F(LIGHT); ws[f"D{EPF_ROW}"].border = Bd(); ws[f"D{EPF_ROW}"].alignment = Al("center","center")
    ws[f"E{EPF_ROW}"].value = f"=C{EPF_ROW}*12"; ws[f"E{EPF_ROW}"].number_format = '₹#,##0'
    ws[f"E{EPF_ROW}"].font = Fn(9, color=NAVY); ws[f"E{EPF_ROW}"].fill = F(LIGHT); ws[f"E{EPF_ROW}"].border = Bd()
    ws[f"E{EPF_ROW}"].alignment = Al("right","center")
    ws[f"F{EPF_ROW}"].value = "Auto-deducted from salary; grows in your EPF account"
    ws[f"F{EPF_ROW}"].font = Fn(9, italic=True, color=GRAY); ws[f"F{EPF_ROW}"].fill = F(WHITE)
    ws[f"F{EPF_ROW}"].border = Bd(); ws[f"F{EPF_ROW}"].alignment = Al("left","center")

    # Savings total row 36
    SAV_TOTAL = 36
    ws[f"B{SAV_TOTAL}"].value = "TOTAL MONTHLY SAVINGS"
    ws[f"B{SAV_TOTAL}"].font = Fn(10, bold=True, color=WHITE); ws[f"B{SAV_TOTAL}"].fill = F(GREEN)
    ws[f"B{SAV_TOTAL}"].border = Bd(); ws[f"B{SAV_TOTAL}"].alignment = Al("left","center")
    for c, val in [("C",f"=SUM(C32:C{EPF_ROW})"),
                   ("D",f"=IF(C{INCOME_MONTHLY_ROW}>0,C{SAV_TOTAL}/C{INCOME_MONTHLY_ROW},0)"),
                   ("E",f"=C{SAV_TOTAL}*12")]:
        ws[f"{c}{SAV_TOTAL}"].value = val
        ws[f"{c}{SAV_TOTAL}"].number_format = '₹#,##0' if c != "D" else '0.0%'
        ws[f"{c}{SAV_TOTAL}"].font = Fn(11, bold=True, color=WHITE); ws[f"{c}{SAV_TOTAL}"].fill = F(GREEN)
        ws[f"{c}{SAV_TOTAL}"].border = Bd(); ws[f"{c}{SAV_TOTAL}"].alignment = Al("right","center")
    ws[f"F{SAV_TOTAL}"].fill = F(GREEN); ws[f"F{SAV_TOTAL}"].border = Bd()
    ws.row_dimensions[SAV_TOTAL].height = 22

    # Grand total row 37
    GRAND_TOTAL = 37
    ws[f"B{GRAND_TOTAL}"].value = "TOTAL ACCOUNTED  (should = monthly take-home)"
    ws[f"B{GRAND_TOTAL}"].font = Fn(10, bold=True, color=WHITE); ws[f"B{GRAND_TOTAL}"].fill = F(NAVY)
    ws[f"B{GRAND_TOTAL}"].border = Bd(); ws[f"B{GRAND_TOTAL}"].alignment = Al("left","center")
    ws[f"C{GRAND_TOTAL}"].value = f"=C21+C30+C{SAV_TOTAL}"
    ws[f"C{GRAND_TOTAL}"].number_format = '₹#,##0'
    ws[f"C{GRAND_TOTAL}"].font = Fn(11, bold=True, color=WHITE); ws[f"C{GRAND_TOTAL}"].fill = F(NAVY)
    ws[f"C{GRAND_TOTAL}"].border = Bd(); ws[f"C{GRAND_TOTAL}"].alignment = Al("right","center")
    ws[f"D{GRAND_TOTAL}"].value = f"=IF(C{INCOME_MONTHLY_ROW}>0,C{GRAND_TOTAL}/C{INCOME_MONTHLY_ROW},0)"
    ws[f"D{GRAND_TOTAL}"].number_format = '0.0%'; ws[f"D{GRAND_TOTAL}"].font = Fn(10, bold=True, color=WHITE)
    ws[f"D{GRAND_TOTAL}"].fill = F(NAVY); ws[f"D{GRAND_TOTAL}"].border = Bd(); ws[f"D{GRAND_TOTAL}"].alignment = Al("center","center")
    ws[f"E{GRAND_TOTAL}"].value = f"=C{GRAND_TOTAL}*12"; ws[f"E{GRAND_TOTAL}"].number_format = '₹#,##0'
    ws[f"E{GRAND_TOTAL}"].font = Fn(10, bold=True, color=WHITE); ws[f"E{GRAND_TOTAL}"].fill = F(NAVY)
    ws[f"E{GRAND_TOTAL}"].border = Bd(); ws[f"E{GRAND_TOTAL}"].alignment = Al("right","center")
    ws[f"F{GRAND_TOTAL}"].value = f"=IF(ABS(C{GRAND_TOTAL}-C{INCOME_MONTHLY_ROW})<500,\"✅ Balanced\",\"⚠️ Recheck totals\")"
    ws[f"F{GRAND_TOTAL}"].font = Fn(10, bold=True, color=WHITE); ws[f"F{GRAND_TOTAL}"].fill = F(NAVY)
    ws["F35"].border = Bd(); ws["F35"].alignment = Al("center","center")
    ws.row_dimensions[35].height = 22

    ws.row_dimensions[36].height = 8

    # ── C: FIRE ASSUMPTIONS ────────────────────────────────────────────────────
    section(ws, 37, 2, 6, "C.  FIRE ASSUMPTIONS  (change yellow cells)", GREEN)
    for c, t in zip([2,3,4,5,6], ["Assumption","Value","Formula / Logic","","Note"]):
        ws[f"{get_column_letter(c)}38"].value = t
        ws[f"{get_column_letter(c)}38"].font = Fn(9, bold=True, color=NAVY)
        ws[f"{get_column_letter(c)}38"].fill = F(SKY); ws[f"{get_column_letter(c)}38"].border = Bd()
        ws[f"{get_column_letter(c)}38"].alignment = Al("center","center")
    ws.row_dimensions[38].height = 18

    assume_rows = [
        (39, "Current Age",                       25,   "0",      True,  "",                "Edit this"),
        (40, "Monthly Investment (SIP + EPF + PPF)","=C36", '₹#,##0', False, "=SUM of savings above", "All your investments combined"),
        (41, "Current Portfolio Value",            0,    '₹#,##0', True,  "",                "0 if just starting out"),
        (42, "Expected Annual Return",             0.12, "0.00%",  True,  "Nifty 50 CAGR ~12%", "Conservative = use 10%"),
        (43, "Annual Salary Increment Rate",       0.08, "0.00%",  True,  "Industry avg 8–10%",  "Investment grows with salary"),
        (44, "Inflation Rate (India CPI)",         0.06, "0.00%",  True,  "RBI target ~4-6%",   ""),
        (45, "Target Retirement Age",              45,   "0",      True,  "",                "Change to 50/55 if needed"),
        (46, "Monthly Expenses in Retirement (₹)","=C30+C21-C16", '₹#,##0', False,
             "Fixed+Var−rent",  "Assumes no rent in retirement (own house)"),
        (47, "FIRE Number  (25× annual expenses)", "=C46*12*25", '₹#,##0', False,
             "=C46×12×25",      "25× = 4% SWR can sustain indefinitely"),
        (48, "Years of Investing",                "=C45-C39",  "0 yrs", False,
             "=Ret. Age−Age",   ""),
    ]

    for r, label, val, fmt, editable, logic, note in assume_rows:
        ws.row_dimensions[r].height = 20
        ws[f"B{r}"].value = label; ws[f"B{r}"].font = Fn(10, bold=True, color=NAVY)
        ws[f"B{r}"].fill = F(LGRAY); ws[f"B{r}"].border = Bd(); ws[f"B{r}"].alignment = Al("left","center")
        ws[f"C{r}"].value = val; ws[f"C{r}"].number_format = fmt
        ws[f"C{r}"].font = Fn(11, bold=True, color=BLACK if editable else BLUE)
        ws[f"C{r}"].fill = F(AMBER if editable else LIGHT)
        ws[f"C{r}"].border = ThickBd(); ws[f"C{r}"].alignment = Al("right","center")
        ws[f"D{r}"].value = logic; ws[f"D{r}"].font = Fn(9, italic=True, color=PURPLE)
        ws[f"D{r}"].fill = F(WHITE); ws[f"D{r}"].border = Bd(); ws[f"D{r}"].alignment = Al("center","center")
        ws[f"E{r}"].fill = F(WHITE); ws[f"E{r}"].border = Bd()
        ws[f"F{r}"].value = note; ws[f"F{r}"].font = Fn(9, italic=True, color=GRAY)
        ws[f"F{r}"].fill = F(WHITE); ws[f"F{r}"].border = Bd(); ws[f"F{r}"].alignment = Al("left","center",True)

    ws.row_dimensions[49].height = 8

    # ── D: FIRE RESULTS ────────────────────────────────────────────────────────
    section(ws, 50, 2, 6, "D.  YOUR FIRE RESULTS", NAVY)

    results = [
        (51, "Monthly Take-Home Pay",         f"=C{INCOME_MONTHLY_ROW}",  '₹#,##0', LGREEN, GREEN),
        (52, "Monthly Invested (Total)",       "=C40",  '₹#,##0', LGREEN, GREEN),
        (53, "Savings Rate",                   f"=IF(C{INCOME_MONTHLY_ROW}>0,C40/C{INCOME_MONTHLY_ROW},0)",
             '0.0%', AMBER, GOLD),
        (54, "FIRE Number Required",           "=C47",  '₹#,##0', LIGHT, BLUE),
        (55, "Corpus at Target Age (₹)",
             "=C41*(1+C42)^C48 + C40*12*((1+C42)^C48-1)/C42",
             '₹#,##0', LGREEN, GREEN),
        (56, "FIRE Achievable at Target Age?",
             '=IF(C55>=C47,"✅ YES — FIRE at "&C45&" yrs!","⏳ Not yet — "&ROUND((C47-C55)/1000,0)&"K more needed")',
             "@", LIGHT, NAVY),
        (57, "Monthly Income Post-FIRE (4% SWR)",
             "=C55*0.04/12", '₹#,##0', LGREEN, GREEN),
        (58, "Surplus vs Required Monthly Income",
             "=C57-C46", '₹#,##0', LIGHT, BLUE),
    ]

    for r, label, formula, fmt, bg, fc in results:
        ws.row_dimensions[r].height = 28
        ws.merge_cells(f"B{r}:C{r}")
        ws[f"B{r}"].value = label; ws[f"B{r}"].font = Fn(11, bold=True, color=fc)
        ws[f"B{r}"].fill = F(bg); ws[f"B{r}"].border = ThickBd(); ws[f"B{r}"].alignment = Al("left","center")
        ws.merge_cells(f"D{r}:F{r}")
        ws[f"D{r}"].value = formula; ws[f"D{r}"].number_format = fmt
        ws[f"D{r}"].font = Fn(14, bold=True, color=fc)
        ws[f"D{r}"].fill = F(bg); ws[f"D{r}"].border = ThickBd(); ws[f"D{r}"].alignment = Al("right","center")

    # Savings rate conditional formatting
    ws.conditional_formatting.add("D53",
        CellIsRule("greaterThanOrEqual", ["0.3"],
                   fill=F(LGREEN), font=Font(bold=True, color=GREEN)))
    ws.conditional_formatting.add("D53",
        CellIsRule("lessThan", ["0.2"],
                   fill=F(LRED), font=Font(bold=True, color=RED)))

    # Corpus result conditional
    ws.conditional_formatting.add("D55",
        CellIsRule("greaterThanOrEqual", ["=C47"],
                   fill=F(LGREEN), font=Font(bold=True, color=GREEN)))

    ws.freeze_panes = "B5"


# ══════════════════════════════════════════════════════════════════════════════
# SHEET 2: YEAR-BY-YEAR PROJECTION
# ══════════════════════════════════════════════════════════════════════════════

def build_projection(ws, profile_sheet_name="Profile & FIRE Plan"):
    ws.sheet_view.showGridLines = False
    for c, w in [(1,2),(2,8),(3,16),(4,16),(5,18),(6,18),(7,18),(8,18),(9,14),(10,2)]:
        W(ws, c, w)

    ws.row_dimensions[1].height = 8
    ws.row_dimensions[2].height = 50
    banner(ws, 2, 2, 9,
           "YEAR-BY-YEAR PROJECTION  ·  25yr Old  ·  ₹5L Salary  ·  Retire at 45",
           NAVY, 16)
    ws.row_dimensions[3].height = 22
    ws.merge_cells("B3:I3")
    ws["B3"].value = ("Corpus formula: Opening Balance × (1+return) + Annual Investment  ·  "
                      "All values in ₹  ·  Return = 12% p.a.  ·  Investment grows 8% p.a. with salary")
    ws["B3"].font = Fn(9, italic=True, color=GRAY); ws["B3"].fill = F(LIGHT)
    ws["B3"].alignment = Al("center","center"); ws["B3"].border = Bd()

    ws.row_dimensions[4].height = 8
    banner(ws, 5, 2, 9, "HOW THE FORMULA WORKS:", BLUE, 10)
    ws.row_dimensions[5].height = 20
    ws.merge_cells("B6:I6")
    ws["B6"].value = ("Year-End Balance  =  (Opening Balance + Annual SIP) × (1 + Annual Return Rate)   "
                      "  ↑ Same as compound interest but you keep adding money each year")
    ws["B6"].font = Fn(10, italic=True, color=NAVY); ws["B6"].fill = F(AMBER)
    ws["B6"].alignment = Al("center","center"); ws["B6"].border = Bd()
    ws.row_dimensions[6].height = 22

    ws.row_dimensions[7].height = 8

    # Table header
    hdrs = ["Yr","Age","Opening Balance (₹)","Annual Investment (₹)",
            "Investment Return (₹)","Year-End Corpus (₹)","FIRE Target (₹)","FI % Achieved"]
    for ci, txt in enumerate(hdrs, 2):
        ws[f"{get_column_letter(ci)}8"].value = txt
        ws[f"{get_column_letter(ci)}8"].font = Fn(9, bold=True, color=NAVY)
        ws[f"{get_column_letter(ci)}8"].fill = F(SKY); ws[f"{get_column_letter(ci)}8"].border = Bd()
        ws[f"{get_column_letter(ci)}8"].alignment = Al("center","center",True)
    ws.row_dimensions[8].height = 24

    # Refs from Profile sheet
    P = f"'{profile_sheet_name}'"
    START_AGE  = f"{P}!C39"
    RET_AGE    = f"{P}!C45"
    START_PORT = f"{P}!C41"
    MONTHLY_INV= f"{P}!C40"
    RETURN     = f"{P}!C42"
    INCR       = f"{P}!C43"  # salary increment → investment grows
    FIRE_NUM   = f"{P}!C47"

    TABLE_START = 9
    TABLE_END   = TABLE_START + 34  # 35 years of projection

    for yr in range(1, 36):
        r = TABLE_START + yr - 1
        ws.row_dimensions[r].height = 17
        alt = LGRAY if yr % 2 == 0 else WHITE

        # Year
        ws[f"B{r}"].value = yr; ws[f"B{r}"].font = Fn(9)
        ws[f"B{r}"].fill = F(alt); ws[f"B{r}"].border = Bd()
        ws[f"B{r}"].alignment = Al("center","center"); ws[f"B{r}"].number_format = "0"

        # Age
        ws[f"C{r}"].value = f"={START_AGE}+{yr}"
        ws[f"C{r}"].font = Fn(9, bold=True); ws[f"C{r}"].fill = F(alt)
        ws[f"C{r}"].border = Bd(); ws[f"C{r}"].alignment = Al("center","center")
        ws[f"C{r}"].number_format = "0"

        # Opening balance
        ob = f"={START_PORT}" if yr == 1 else f"=G{r-1}"
        ws[f"D{r}"].value = ob; ws[f"D{r}"].font = Fn(9)
        ws[f"D{r}"].fill = F(alt); ws[f"D{r}"].border = Bd()
        ws[f"D{r}"].alignment = Al("right","center"); ws[f"D{r}"].number_format = '₹#,##0'

        # Annual investment — grows with salary increment each year
        ws[f"E{r}"].value = f"={MONTHLY_INV}*12*(1+{INCR})^{yr-1}"
        ws[f"E{r}"].font = Fn(9, color=GREEN); ws[f"E{r}"].fill = F(alt)
        ws[f"E{r}"].border = Bd(); ws[f"E{r}"].alignment = Al("right","center")
        ws[f"E{r}"].number_format = '₹#,##0'

        # Investment return (on opening + half of annual investment)
        ws[f"F{r}"].value = f"=(D{r}+E{r}/2)*{RETURN}"
        ws[f"F{r}"].font = Fn(9, color=BLUE); ws[f"F{r}"].fill = F(alt)
        ws[f"F{r}"].border = Bd(); ws[f"F{r}"].alignment = Al("right","center")
        ws[f"F{r}"].number_format = '₹#,##0'

        # Year-end corpus
        ws[f"G{r}"].value = f"=D{r}+E{r}+F{r}"
        ws[f"G{r}"].font = Fn(10, bold=True, color=NAVY); ws[f"G{r}"].fill = F(alt)
        ws[f"G{r}"].border = Bd(); ws[f"G{r}"].alignment = Al("right","center")
        ws[f"G{r}"].number_format = '₹#,##0'

        # FIRE target
        ws[f"H{r}"].value = f"={FIRE_NUM}"
        ws[f"H{r}"].font = Fn(9, italic=True, color=RED); ws[f"H{r}"].fill = F(alt)
        ws[f"H{r}"].border = Bd(); ws[f"H{r}"].alignment = Al("right","center")
        ws[f"H{r}"].number_format = '₹#,##0'

        # FI %
        ws[f"I{r}"].value = f"=IF(H{r}>0,MIN(G{r}/H{r},2),0)"
        ws[f"I{r}"].font = Fn(9, bold=True); ws[f"I{r}"].fill = F(alt)
        ws[f"I{r}"].border = Bd(); ws[f"I{r}"].alignment = Al("center","center")
        ws[f"I{r}"].number_format = '0%'

    # Conditional formatting
    ws.conditional_formatting.add(
        f"G{TABLE_START}:G{TABLE_END}",
        CellIsRule("greaterThanOrEqual", [f"={FIRE_NUM}"],
                   fill=F(LGREEN), font=Font(bold=True, color=GREEN)))

    ws.conditional_formatting.add(
        f"I{TABLE_START}:I{TABLE_END}",
        ColorScaleRule(start_type="num", start_value=0,    start_color=LRED,
                       mid_type="num",   mid_value=0.5,    mid_color=AMBER,
                       end_type="num",   end_value=1.0,    end_color=LGREEN))

    # FIRE milestone rows — highlight rows where FI reaches 25%, 50%, 75%, 100%
    for pct_row in range(TABLE_START, TABLE_END+1):
        ws.conditional_formatting.add(
            f"B{pct_row}:I{pct_row}",
            CellIsRule("greaterThanOrEqual",
                       [f"=IF(I{pct_row}>=1,G{pct_row},\"\")"],
                       fill=F(LGREEN)))

    ws.freeze_panes = "B9"

    # Summary box below table
    SUM_ROW = TABLE_END + 2
    banner(ws, SUM_ROW, 2, 9, "FINAL OUTCOME SUMMARY", NAVY, 12)
    ws.row_dimensions[SUM_ROW].height = 22

    summary = [
        (SUM_ROW+1, "Corpus at Target Retirement Age",
         f"=IFERROR(INDEX(G{TABLE_START}:G{TABLE_END},MATCH({RET_AGE},C{TABLE_START}:C{TABLE_END},0)),0)",
         '₹#,##0', LGREEN, GREEN),
        (SUM_ROW+2, "FIRE Number (target corpus)",
         f"={FIRE_NUM}", '₹#,##0', AMBER, GOLD),
        (SUM_ROW+3, "Surplus / Shortfall",
         f"=B{SUM_ROW+1}-B{SUM_ROW+2}",  # will fix refs below
         '₹#,##0', LIGHT, BLUE),
        (SUM_ROW+4, "Monthly Income in Retirement (4% SWR÷12)",
         f"=IFERROR(INDEX(G{TABLE_START}:G{TABLE_END},MATCH({RET_AGE},C{TABLE_START}:C{TABLE_END},0))*0.04/12,0)",
         '₹#,##0', LGREEN, GREEN),
    ]

    for r, label, formula, fmt, bg, fc in summary:
        ws.row_dimensions[r].height = 26
        ws.merge_cells(f"B{r}:E{r}")
        ws[f"B{r}"].value = label; ws[f"B{r}"].font = Fn(11, bold=True, color=fc)
        ws[f"B{r}"].fill = F(bg); ws[f"B{r}"].border = ThickBd(); ws[f"B{r}"].alignment = Al("left","center")
        ws.merge_cells(f"F{r}:I{r}")
        ws[f"F{r}"].value = formula; ws[f"F{r}"].number_format = fmt
        ws[f"F{r}"].font = Fn(14, bold=True, color=fc)
        ws[f"F{r}"].fill = F(bg); ws[f"F{r}"].border = ThickBd(); ws[f"F{r}"].alignment = Al("right","center")

    # Fix surplus formula using actual cell refs
    sr1 = SUM_ROW + 1; sr2 = SUM_ROW + 2
    ws[f"F{SUM_ROW+3}"].value = f"=F{sr1}-F{sr2}"

    # Chart
    try:
        chart = LineChart()
        chart.title = "Corpus Growth vs FIRE Target (25yr, ₹5L Salary)"
        chart.style = 10
        chart.y_axis.title = "Value (₹)"
        chart.x_axis.title = "Year"
        chart.height = 14; chart.width = 26

        d1 = Reference(ws, min_col=7, max_col=7,
                        min_row=TABLE_START-1, max_row=TABLE_END)
        d2 = Reference(ws, min_col=8, max_col=8,
                        min_row=TABLE_START-1, max_row=TABLE_END)
        chart.add_data(d1, titles_from_data=True)
        chart.add_data(d2, titles_from_data=True)
        cats = Reference(ws, min_col=2, min_row=TABLE_START, max_row=TABLE_END)
        chart.set_categories(cats)

        chart.series[0].graphicalProperties.line.solidFill = BLUE
        chart.series[0].graphicalProperties.line.width = 25000
        chart.series[1].graphicalProperties.line.solidFill = RED
        chart.series[1].graphicalProperties.line.width = 18000
        chart.series[1].graphicalProperties.line.dashDot = "dash"

        ws.add_chart(chart, f"B{SUM_ROW+6}")
    except Exception:
        pass


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def create_example(output_path="FIRE_Example_5Lac.xlsx"):
    from openpyxl.styles import Font  # needed for conditional formatting Font refs
    wb = Workbook()

    PROFILE_NAME = "Profile & FIRE Plan"
    ws1 = wb.active; ws1.title = PROFILE_NAME
    ws2 = wb.create_sheet("Year-by-Year Projection")

    ws1.sheet_properties.tabColor = "1B3A5C"
    ws2.sheet_properties.tabColor = "1A7A4A"

    print("  Building Profile & FIRE Plan...")
    build_profile(ws1)

    print("  Building Year-by-Year Projection...")
    build_projection(ws2, PROFILE_NAME)

    for ws in [ws1, ws2]:
        ws.sheet_view.zoomScale = 95

    wb.save(output_path)
    print(f"\n✅  Saved: {output_path}")
    print("    Sheet 1: Profile & FIRE Plan  (all inputs + results)")
    print("    Sheet 2: Year-by-Year Projection  (35 years + chart)")
    return output_path


if __name__ == "__main__":
    create_example()
