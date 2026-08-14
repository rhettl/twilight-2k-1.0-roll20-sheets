# Twilight 200

A custom Roll20 character sheet for classic Twilight: 2000 (the original
GDW rules — attributes like STR/AGL/CON/STA/INT/EDU, Coolness Under Fire,
hit-location capacity, etc.), not the newer Free League edition. Built from
scratch: no code copied from any existing Roll20 community sheet.

The sheet has three tabs — **Character Sheet**, **Equipment**, and
**Vehicle** — combined into a single Roll20 sheet.

## Installing in Roll20 (for the GM)

Roll20 doesn't need this whole repo — just the two build outputs:

1. In your game, go to **Settings → Game Settings → Character Sheet Template**
   and choose **Custom**.
2. Paste the contents of **`sheet.html`** into the *HTML* box.
3. Paste the contents of **`sheet.css`** into the *CSS* box.
4. Paste the contents of the `<script type="text/worker">...</script>` block
   at the bottom of **`sheet-template.html`** (just the JS inside the tags)
   into the *Sheet Worker JavaScript* box. This is what makes the tabs
   clickable — without it the tab buttons won't do anything.
5. Save. Every character sheet in the game will now use this template.

If you only want to review what the sheet looks like without touching your
Roll20 game, open `sheet-preview.html` in a browser instead (see
[Development](#development) below).

## What's what

### Files Roll20 actually needs

| File | Purpose |
|---|---|
| `sheet.html` | The combined sheet (all three tabs). Paste into Roll20's HTML box. |
| `sheet.css` | The combined stylesheet. Paste into Roll20's CSS box. |
| `sheet-template.html` | Not pasted directly, but its `<script type="text/worker">` block is — see step 4 above. |

**`sheet.html` and `sheet.css` are generated files** — see below. Don't hand-edit
them; edit the source files and let the build regenerate them.

### Source files (edit these)

| File | Purpose |
|---|---|
| `main.html` | Character Sheet tab: attributes, skills, hit capacity, base numbers to hit. |
| `equipment.html` | Equipment tab: gear lists + weapon statistics. |
| `vehicles.html` | Vehicle tab: vehicle info, armament, damage location, maintenance/travel/cargo. |
| `sheet-template.html` | Wraps the three fragments above in the tab bar and adds the tab-switching sheet worker script. |
| `scss/main.scss` | Character tab styles. |
| `scss/equipment.scss` | Equipment tab styles. |
| `scss/vehicle.scss` | Vehicle tab styles. |
| `scss/_tabs.scss` | Tab bar + tab-switching CSS. |
| `scss/_variables.scss`, `_mixins.scss`, `_base.scss`, `_utilities.scss` | Shared design tokens, mixins, page chrome, and spacing utility classes (`.m-1`, `.pt-3`, etc.) reused by all three tabs. |
| `*-wrapper.html` (`preview-wrapper.html`, `equipment-wrapper.html`, `vehicle-wrapper.html`, `sheet-wrapper.html`) | Dev-only HTML shells (doctype/head/css-link) used to preview each fragment in a plain browser. |

### Generated files (don't edit — rebuilt automatically)

| File | Built from |
|---|---|
| `sheet.html` | `sheet-template.html` + `main.html` + `equipment.html` + `vehicles.html` |
| `sheet.css` | `scss/sheet.scss` (which pulls in all three tab stylesheets + tabs) |
| `main.css` / `equipment.css` / `vehicle.css` | Their matching `scss/*.scss` file |
| `preview.html` / `equipment-preview.html` / `vehicle-preview.html` | Fragment + matching `*-wrapper.html`, for previewing one tab in isolation |
| `sheet-preview.html` | `sheet.html` + `sheet-wrapper.html`, with a small dev-only script that makes the tabs clickable in a plain browser (Roll20's action buttons don't work outside Roll20) |

### Attribute naming

To let the three tabs merge into one sheet without field names colliding:

- Character tab fields have **no prefix** (`attr_str`, `attr_hp_head`, ...)
- Equipment tab fields use **`eq_`** (`attr_eq_wpn1_dam`, ...)
- Vehicle tab fields use **`veh_`** (`attr_veh_type`, `attr_veh_dmg_rbody_lh`, ...)

### Not part of this repo

`references/` (source PDFs and screenshots used while building this) and
`roll20-character-sheets/` (a clone of Roll20's community sheet repo, used
only to study the standard tab-CSS pattern and confirm we weren't reusing
anyone else's sheet code) are both git-ignored — they're local research
material, not part of the sheet.

## Development

```bash
npm install
npm run watch:css      # compiles all scss/*.scss -> *.css on save
npm run watch:preview   # rebuilds all *-preview.html + sheet.html on save
```

Run both in separate terminals, then open any `*-preview.html` file in a
browser. Edit `main.html` / `equipment.html` / `vehicles.html` /
`scss/*.scss` and the previews update automatically on save.

One-off builds (no watching): `npm run build:css` and `npm run build:preview`.
