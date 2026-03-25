Here's a precise description of all the styling changes for an AI agent to implement:

---

**Typography**
- Import `DM Sans` (weights 300, 400, 500, 600) and `DM Mono` (weights 400, 500) from Google Fonts
- Apply `DM Sans` as the base font family across the entire component
- Apply `DM Mono` to all stat card numeric values for tabular number rendering

**CSS Variables**
Define these on the root wrapper element:
- `--brand: #1e40af`, `--brand-light: #eff6ff`, `--brand-mid: #bfdbfe`
- `--success: #10b981`, `--success-bg: #ecfdf5`
- `--warn: #f59e0b`, `--warn-bg: #fffbeb`
- `--danger: #ef4444`, `--danger-bg: #fef2f2`
- `--surface: #ffffff`, `--surface-2: #f8fafc`
- `--border: #e2e8f0`, `--border-strong: #cbd5e1`
- `--text-primary: #0f172a`, `--text-secondary: #475569`, `--text-muted: #94a3b8`
- `--radius: 10px`
- `--shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)`
- `--shadow: 0 4px 12px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.04)`

---

**Page wrapper**
- Background `#f8fafc`, padding `2rem`, `min-height: 100vh`

**Header**
- Title: `font-size: 1.6rem`, `font-weight: 600`, `letter-spacing: -0.02em`, color `--text-primary`
- Subtitle: `font-size: 0.875rem`, color `--text-secondary`

---

**Stat cards**
- Each card: `background: white`, `border: 1px solid --border`, `border-radius: 10px`, `box-shadow: --shadow-sm`, `padding: 1.1rem 1.25rem`
- On hover: `box-shadow: --shadow`, `transform: translateY(-1px)`, transition `0.18s`
- Icon wrapper: `width/height: 2.5rem`, `border-radius: 8px` — keep existing bg colors
- Stat label: `font-size: 0.7rem`, `font-weight: 500`, `text-transform: uppercase`, `letter-spacing: 0.06em`, color `--text-muted`
- Stat value: `font-size: 1.6rem`, `font-weight: 600`, `line-height: 1`, `font-family: DM Mono`
- Assignment Rate card value: color changes to `#10b981` if ≥80%, `#f59e0b` if ≥50%, `#ef4444` if below

---

**Buttons**
Standardize all buttons to this system:
- Base: `display: inline-flex`, `align-items: center`, `gap: 0.4rem`, `padding: 0.5rem 0.9rem`, `border-radius: 7px`, `font-size: 0.8125rem`, `font-weight: 500`, `border: 1px solid`, `transition: all 0.15s`, `white-space: nowrap`
- Outline variant: `background: white`, `border-color: --border-strong`, `color: --text-secondary`; hover: `background: --surface-2`, `border-color: #94a3b8`, `color: --text-primary`
- Primary variant: `background: --brand`, `border-color: --brand`, `color: white`; hover: `background: #1e3a8a`
- Small modifier: `padding: 0.35rem 0.7rem`, `font-size: 0.775rem`
- Icon-only modifier: `padding: 0.35rem 0.45rem`
- Disabled: `opacity: 0.5`, `cursor: not-allowed`

---

**Filter panel**
- Wrap in a white card with `border: 1px solid --border`, `border-radius: 10px`, `box-shadow: --shadow-sm`, `padding: 1.25rem`
- Field labels: `font-size: 0.75rem`, `font-weight: 500`, `text-transform: uppercase`, `letter-spacing: 0.04em`, color `--text-secondary`
- All inputs/selects: `border: 1px solid --border-strong`, `border-radius: 7px`, `font-size: 0.8125rem`, `padding: 0.5rem 0.75rem`; focus: `border-color: --brand`, `box-shadow: 0 0 0 3px rgba(30,64,175,0.1)`
- All `<select>` elements: hide browser default arrow using `appearance: none`, add a custom CSS triangle arrow using a pseudo-element (`::after`) on a wrapper div positioned `right: 0.7rem`, vertically centered
- Search input: add left padding `2.1rem` to accommodate the search icon positioned absolutely inside

---

**Bulk action banner**
- Background `#eff6ff`, border `1px solid #bfdbfe`, `border-radius: 10px`
- Selected count text: `font-size: 0.875rem`, `font-weight: 600`, color `--brand`
- Subtext: `font-size: 0.75rem`, color `#3b5bdb`, `opacity: 0.8`

---

**Table**
- Remove outer border/shadow from the existing card wrapper — the panel itself provides the container
- `thead th`: `background: #f8fafc`, `border-bottom: 1px solid --border`, `font-size: 0.68rem`, `font-weight: 600`, `text-transform: uppercase`, `letter-spacing: 0.07em`, color `--text-muted`, `padding: 0.65rem 1rem`
- `tbody tr`: `border-bottom: 1px solid --border`; hover: `background: #f8fafc`; if row is being edited: `background: #eff6ff`
- `tbody td`: `padding: 0.8rem 1rem`, `vertical-align: middle`

**Employee cell:**
- Name: `font-weight: 500`, color `--text-primary`
- Email and employee ID: `font-size: 0.72rem`, color `--text-muted`, displayed as separate lines

**Branch cell:**
- Wrap in a small pill: `display: inline-flex`, `align-items: center`, `gap: 0.35rem`, `padding: 0.25rem 0.6rem`, `background: --surface-2`, `border: 1px solid --border`, `border-radius: 20px`, `font-size: 0.72rem`, `font-weight: 500`, color `--text-secondary`

**Location cell:**
- Assigned state: replace the plain green dot + text with a pill badge — `background: #ecfdf5`, `border: 1px solid #a7f3d0`, `border-radius: 20px`, `padding: 0.28rem 0.65rem`, `font-size: 0.72rem`, `font-weight: 500`, color `#065f46`; include a `6px` filled green circle dot inside
- Unassigned state: `font-size: 0.72rem`, color `--text-muted`, `font-style: italic`, text "Not assigned"

**Notes cell:**
- Has notes: `font-size: 0.75rem`, color `--text-secondary`
- No notes: render `—` in color `--text-muted`

---

**Pagination**
- Move inside the table panel, separated by `border-top: 1px solid --border`, `padding: 0.875rem 1.25rem`
- Info text: `font-size: 0.8rem`, color `--text-muted`; format as `Showing X–Y of Z` (use en-dash not hyphen)
- Page number buttons: `width/height: 2rem`, `border-radius: 6px`, `font-size: 0.75rem`, `font-family: DM Mono`; active page: `background: --brand`, `color: white`
- Previous/Next labels: use `← Prev` and `Next →` instead of "Previous" / "Next"

---

**Info box (bottom)**
- Background `#fffbeb`, border `1px solid #fde68a`, `border-radius: 10px`, `padding: 1rem 1.25rem`
- Title: `font-size: 0.8125rem`, `font-weight: 600`, color `#92400e`
- List items: `font-size: 0.78rem`, color `#92400e`, `opacity: 0.9`; custom bullet dot in `#d97706`

---

**Alert banners (success/error)**
- Success: `background: #ecfdf5`, `border: 1px solid #6ee7b7`, color `#065f46`
- Error: `background: #fef2f2`, `border: 1px solid #fca5a5`, color `#7f1d1d`
- Both: `border-radius: 10px`, `padding: 0.875rem 1rem`, `font-size: 0.875rem`; icon left-aligned, close button right-aligned with `margin-left: auto`

---

**Spinning refresh icon**
- When loading, apply `animation: spin 0.8s linear infinite` to the `RefreshCw` icon