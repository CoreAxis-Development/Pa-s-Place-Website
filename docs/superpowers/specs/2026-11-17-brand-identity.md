# Pa's Place — Brand Identity Spec ("The Garden by the Sea")

**Date:** 2026-11-17 · **Branch:** `overhaul/v2` · **Status:** ready to implement
**Scope:** all guest-facing pages (`/`, `/book-a-stay`, `/venue-hire`, `/what-we-do`, `/get-involved`) and the internal admin portal. `/our-story` keeps its storybook treatment as a deliberate exception (see §5.4).

Client constraints this answers: *"it doesn't feel like we have a good brand identity"*, *"make it enterprise grade"*, *"very modern and not hearty"* (rejected), *"be relentless and rip out some of it… balance"*, booking is paramount, CSS-only motion.

---

## 1. Stylistic analysis

### 1.1 The logo
- Measured colours: rays and ring are a single flat **`#FF9900`** marigold; the wordmark is warm grey **`#6E6565`**; the dove is pure white with a pale blue glow.
- What it says: sunrise, hope, peace, hand-made. The rays are **irregular in length with round caps**, which is the one distinctive, ownable shape in the whole identity.
- Its weaknesses, which the site must design around:
  - The dove is white. On the current cream header it has almost no contrast and reads as a hole in the sun. It only works on a dark ground or inside the ring on white.
  - The arched wordmark is a few pixels tall at header size (52px). It is illegible, so the site needs a typeset wordmark beside the mark.
  - It carries no green, no sea and no night indigo. The current site's indigo palette has no source in the logo or the property.

### 1.2 The real photos
- The property is **green**. Every frame is dominated by enormous spreading trees, dappled lawn (`#84903C` sunlit, `#18240C` in shade) and subtropical undergrowth. This is the real asset: a shaded garden with old trees that guests cannot get at a flat-block holiday let.
- Supporting colours that are really there: turquoise pool (`#48C0CC`), mini-golf kerbs in terracotta-orange (`#C06C3C` to `#F07854`), candy slides (pink `#E49CC0`, blue `#78B4E4`, green `#60A884`, yellow `#D8C084`), dark-stained timber poles (`#342817`), cream corrugated roof.
- Light is **overcast or dappled**, never golden hour. Skies are white or grey in images 0, 3, 6, 7, 8, 9.
- They are honest phone photos: 1280px square or 1200×1600, wide-angle distortion, some clutter (cooler boxes, plastic chairs, an electrical box). They show a well-loved, unpretentious place that is affordable, and real families using it.
- There is **no photo of the sea, the house exterior or a bedroom**. The current hero promises a golden beach that the real photo set cannot back up.

### 1.3 The current site
Where it is incoherent, bluntly:
1. **Two brands share one stylesheet.** The bedtime-storybook language built for `/our-story` (night indigo, stars, fireflies, torn paper) leaked into the header, footer and booking pages. A parent trying to book a R200 bed is paying into a scrapbook.
2. **Nine motifs, no hierarchy.** Torn edges, masking tape, taped keepsakes, film grain, Caveat, squiggle underline, sticker buttons, spinning sunburst, twinkle and fireflies all compete. A brand is one or two devices used with discipline; this is a mood board.
3. **Decoration sits on the transaction.** Tape strips are on the booking card and the confirmation card; Caveat handwriting carries real information (eyebrows, kickers, the nonprofit link). Hand-drawn chrome on a payment form lowers trust.
4. **The palette describes a different place.** Cream, driftwood brown and indigo are a sepia film still. The property is saturated green with a turquoise pool. When the real photos go in, the UI and the pictures will fight.
5. **The imagery is the biggest credibility gap.** AI-generated golden-hour "film" shots of children on a charity site read as stock at best and deceptive at worst. Once real photos sit next to them the difference is obvious.
6. **Accessibility and craft slips.** Marigold `#F0931F` is used as text and kicker colour on cream (about 2.2:1, fails AA). Body text relies on opacity (`text-cocoa/80`) for hierarchy. Every heading is `WONK 1, SOFT 100`, so the type is permanently in costume.
7. **Venue hire is missing from the header nav**, though it is one of three audiences and a revenue line.

**Diagnosis:** the site has an art direction (for one page) but no identity system: no fixed colour roles, no type rules, no rule for when decoration is allowed. This spec supplies that.

---

## 2. Brand essence

**Positioning:** *A big, green, family holiday garden two minutes from the sea, where every booking helps send a child on their first seaside holiday.*

**Internal idea:** "The Garden by the Sea." The site should feel like the property: shaded, generous, cheerful, plainly kept.

| Trait | This | Not that |
|---|---|---|
| Hearty | Warm colour, soft serif headlines, real people | Sleek SaaS minimalism, grey-on-white |
| Honest | Real photos, prices shown up front, plain words | AI polish, "from" pricing games, hype |
| Capable | Clear steps, tidy forms, fast pages | Scrapbook clutter on a payment screen |
| Joyful | Slides, mini-golf, birthday tables | Cartoonish, childish UI, confetti |
| Purposeful | One calm line about the mission per page | Guilt, pity imagery, donation pop-ups |

### Voice and tone
- South African English. Prices as `R200 per person per night`. Dates as `Fri 12 Dec 2026`.
- Write like the person who answers the phone: short, kind, specific. Say "you" and "we".
- Lead with the fact a guest needs (price, distance to beach, what is included). The mission is the reason, stated once, never the sales pitch.
- Sentence case everywhere, including buttons and headings. No exclamation marks in UI. No "storybook" phrasing ("the pages", "turn the page") outside `/our-story`.
- Children are described with dignity: "children who have never had a seaside holiday", not "poor" or "underprivileged kids".

| Context | Example |
|---|---|
| Home headline | A holiday garden, two minutes from the sea |
| Home sub-line | Pool, waterslides, mini-golf and room for the whole family. R200 per person per night. |
| Venue headline | Your party, under the big trees |
| Mission line | Pa's Place is a non-profit. Every stay helps give a child their first holiday by the sea. |
| Primary CTA | Check availability · Book a stay · Hire the venue |
| Donor CTA | Sponsor a child's holiday |
| Field error | Please choose a check-out date after your check-in date. |
| System error | We couldn't save your booking. Nothing has been charged. Please try again, or call us on [phone from settings]. |
| Empty state (admin) | No new bookings. New requests will appear here. |
| Success | Booking confirmed. We've emailed your reference, PP-2041, to you. |

---

## 3. Colour system

Source of every colour: **Sun** from the logo; **Canopy** from the trees; **Paper** from the logo's white and the lapa roof; **Terracotta** from the mini-golf kerbs; **Pool** from the pool; **Play** from the slides.

Roles:
- **Sun `#FF9900` is the primary brand and action colour.** It is used as a fill with dark ink text, and for the signature devices. It is never used as text or as a thin icon on a light surface (2.1:1).
- **Canopy is the dark anchor and the working colour**: footer, admin sidebar, links, secondary buttons, focus rings, success.
- Surfaces are warm white, not cream. Cards are pure white so photos and forms look clean.
- Terracotta and Pool are small accents (a tag, an icon tile, an info state). Play colours are for data only (admin calendar categories), never for marketing chrome.
- Colour use by area on a typical guest page: about 80% paper and white, 10% canopy, 5% sun, 5% photography-led accents.

```css
/* Paste into the @theme block of src/styles/global.css (Tailwind v4).
   Storybook-only tokens (night-*, moon, ember, grass-*) move to a stylesheet
   loaded only by /our-story. */
@theme {
  /* Sun: logo rays. Primary brand + primary action fill. */
  --color-sun-50:  #FFF8E8;
  --color-sun-100: #FFEFD1;  /* tint: highlight panels, warning bg */
  --color-sun-400: #FFAE33;  /* primary button hover */
  --color-sun-500: #FF9900;  /* PRIMARY. Fills and devices only, never text on light */
  --color-sun-600: #E58600;  /* primary button pressed */
  --color-sun-700: #9A5200;  /* the only "orange" allowed as text on light */
  --color-sun-800: #855000;  /* warning text */

  /* Canopy: the trees. Dark anchor + interactive green. */
  --color-canopy-50:  #F0F6EC;
  --color-canopy-100: #E2EEDD;  /* selected rows, soft panels */
  --color-canopy-600: #2C6239;  /* links, focus ring, secondary button */
  --color-canopy-700: #22482F;  /* link/secondary hover */
  --color-canopy-800: #1A3324;  /* raised surface on dark */
  --color-canopy-900: #12241A;  /* DARK ANCHOR: footer, admin sidebar, dark bands */

  /* Surfaces */
  --color-page:   #FBF8F2;  /* page background (warm white) */
  --color-raised: #FFFFFF;  /* cards, header, inputs, tables */
  --color-sunken: #F3EEE4;  /* alternate bands, table headers, wells */

  /* Text */
  --color-ink:        #17231B;  /* strong: headings, labels, prices */
  --color-ink-body:   #3A443C;  /* body copy */
  --color-ink-muted:  #5F685F;  /* captions, help text, placeholders */
  --color-on-dark:       #F6F2E7;  /* text on canopy-900/800 */
  --color-on-dark-muted: #B9C7B8;  /* secondary text on canopy-900/800 */
  --color-dove-grey:  #6E6565;  /* logo wordmark grey; logo lockups only */

  /* Borders */
  --color-line:        #E4DDCE;  /* hairlines, card borders, dividers */
  --color-line-strong: #CFC6B2;  /* table rules, disabled outlines */
  --color-line-field:  #8A8472;  /* input borders (3:1 minimum for controls) */

  /* Accents: from the property */
  --color-terracotta-100: #FBE6DC;
  --color-terracotta-500: #D2603A;  /* fills/icons only */
  --color-terracotta-700: #A8431F;  /* terracotta as text */
  --color-pool-100: #DDF3F4;
  --color-pool-500: #3FBFC6;        /* fills/icons only */
  --color-pool-700: #0E6F78;        /* pool as text; info */

  /* Semantic status (fg on bg; fg also passes on white) */
  --color-success:    #1E6E3A;  --color-success-bg: #E1F2E3;
  --color-warning:    #855000;  --color-warning-bg: #FFEFD1;
  --color-danger:     #B42318;  --color-danger-bg:  #FCE8E4;
  --color-info:       #0E6F78;  --color-info-bg:    #DDF3F4;
  --color-neutral:    #4F574F;  --color-neutral-bg: #ECE8DF;

  /* Play: the slides. Admin calendar/category fills only, with ink text. */
  --color-play-pink:   #E79CC4;
  --color-play-blue:   #78B4E4;
  --color-play-green:  #5FB083;
  --color-play-yellow: #E3C56B;
}
```

### Contrast (WCAG 2.1, computed)

| Foreground | Background | Ratio | Use |
|---|---|---|---|
| ink `#17231B` | page / raised / sunken | 15.3 / 16.3 / 14.1 | headings, labels |
| ink-body `#3A443C` | page / raised / sunken | 9.6 / 10.1 / 8.8 | body |
| ink-muted `#5F685F` | page / raised / sunken | 5.5 / 5.8 / 5.0 | captions, help |
| ink `#17231B` | sun-500 / sun-400 / sun-600 | 7.6 / 8.8 / 6.0 | primary button label, all states |
| white | canopy-600 / canopy-700 | 7.2 / 10.3 | secondary button |
| canopy-600 `#2C6239` | page / raised / canopy-100 | 6.8 / 7.2 / 6.0 | links, tertiary button |
| on-dark `#F6F2E7` | canopy-900 / canopy-800 | 14.5 / 12.2 | footer, sidebar text |
| on-dark-muted `#B9C7B8` | canopy-900 / canopy-800 | 9.2 / 7.7 | footer, sidebar secondary |
| sun-500 `#FF9900` | canopy-900 / canopy-800 | 7.6 / 6.4 | rays, active marker, headings accent on dark |
| sun-700 `#9A5200` | page / raised / sun-100 | 5.5 / 5.9 / 5.2 | eyebrow text |
| terracotta-700 | raised / terracotta-100 | 6.0 / 5.0 | tag text |
| pool-700 / info | raised / pool-100 | 5.9 / 5.1 | info badge |
| success | raised / success-bg | 6.3 / 5.4 | confirmed |
| warning | raised / warning-bg | 6.7 / 5.9 | awaiting deposit |
| danger | raised / danger-bg | 6.6 / 5.6 | cancelled, errors |
| white | danger `#B42318` | 6.6 | destructive button |
| neutral | raised / neutral-bg | 7.5 / 6.1 | completed, draft |
| ink | play pink / blue / green / yellow | 7.7 / 7.3 / 6.2 / 9.6 | calendar blocks |
| line-field `#8A8472` | raised / page / sunken | 3.7 / 3.5 / 3.2 | input border (non-text, needs 3:1) |

**Fails, therefore banned:** sun-500 as text or icon on page/raised (2.0 to 2.1); white text on sun-500 (2.1); white text on terracotta-500 (3.8); ink-muted on neutral-bg at small sizes is 4.7 (allowed, but use `neutral` for badge text). Never create hierarchy with opacity on text; use the three ink tokens.

---

## 4. Typography

| Role | Face | Package | Status |
|---|---|---|---|
| Display (headlines) | **Fraunces Variable**, re-tuned | `@fontsource-variable/fraunces` (import `full.css`; add `full-italic.css` only on `/our-story`) | keep |
| Text + UI | **Figtree Variable** | `@fontsource-variable/figtree` (wght 300 to 900) | **new, replaces Nunito Sans** |
| Handwriting | Caveat Variable | `@fontsource-variable/caveat` | keep, restricted; load only on `/our-story` |

Why:
- **Fraunces stays** because it is the "hearty" the client asked for. It is re-tuned so it stops being a costume: `font-variation-settings: "SOFT" 50, "WONK" 0; font-optical-sizing: auto;` weight 600 (500 for sizes of 48px and above). Soft enough to be warm, upright enough to be trusted. `WONK 1 / SOFT 100` survives only on `/our-story`.
- **Nunito Sans goes.** I checked the installed font file: it has **no `tnum` feature**, so prices, dates and table columns cannot align, and its rounded terminals read as children's-product UI at small sizes. **Figtree** is friendly and open but cleaner, and its file does ship `tnum` and `pnum` (verified in `@fontsource-variable/figtree` 5.3.0). After the swap, `npm uninstall @fontsource-variable/nunito-sans`.
- Fraunces is **never** used below 20px, in buttons, labels, form fields, tables or the admin UI.

```css
--font-display: "Fraunces Variable", Georgia, "Times New Roman", serif;
--font-body:    "Figtree Variable", "Segoe UI", system-ui, sans-serif;
--font-hand:    "Caveat Variable", "Segoe Script", cursive; /* /our-story only */
```

### Marketing scale (guest pages)

| Token | Mobile | Desktop (≥768px) | Line-height | Face / weight | Tracking |
|---|---|---|---|---|---|
| display | 40px / 2.5rem | 60px / 3.75rem | 1.05 | Fraunces 500 | -0.02em |
| h1 | 34px / 2.125rem | 48px / 3rem | 1.1 | Fraunces 500 | -0.02em |
| h2 | 28px / 1.75rem | 36px / 2.25rem | 1.15 | Fraunces 600 | -0.015em |
| h3 | 22px / 1.375rem | 24px / 1.5rem | 1.25 | Fraunces 600 | -0.01em |
| h4 / card title | 18px / 1.125rem | 18px | 1.35 | Figtree 700 | 0 |
| lead | 18px / 1.125rem | 20px / 1.25rem | 1.55 | Figtree 400 | 0 |
| body | 16px / 1rem | 17px / 1.0625rem | 1.6 | Figtree 400 | 0 |
| small | 14px / 0.875rem | 14px | 1.5 | Figtree 400/500 | 0 |
| caption | 13px / 0.8125rem | 13px | 1.45 | Figtree 500 | 0 |
| eyebrow | 13px / 0.8125rem | 13px | 1.3 | Figtree 700, uppercase | 0.08em |
| button | 16px / 1rem | 16px | 1 | Figtree 700 | 0 |
| price | 28px / 1.75rem | 32px / 2rem | 1.1 | Figtree 800, `tnum` | -0.01em |

`text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs. Prose measure max `68ch`.

### Admin scale (dense)

| Token | Size | Line-height | Weight |
|---|---|---|---|
| page title | 22px / 1.375rem | 1.3 | Figtree 700 |
| section title | 16px / 1rem | 1.4 | Figtree 700 |
| body / inputs / table cells | 14px / 0.875rem | 1.45 (20px) | Figtree 400 |
| label, table header | 12px / 0.75rem | 1.35 | Figtree 600, uppercase headers at 0.04em |
| meta / help | 12px / 0.75rem | 1.4 | Figtree 400 |
| KPI figure | 28px / 1.75rem | 1.1 | Figtree 700, `tnum` |

### Rules
- **Tabular numerals** (`font-variant-numeric: tabular-nums`): every price, total, quote line, calendar date, guest counter, reference number, and all admin table cells and KPIs. Apply globally in admin (`.admin { font-variant-numeric: tabular-nums; }`). Body prose keeps proportional figures.
- **Handwriting:** allowed on `/our-story` freely. On guest pages, **zero** uses. It never carries information (prices, labels, eyebrows, links, captions, errors) and never appears in forms, booking flow, emails or admin.
- Weights in use: 400, 500, 600, 700, 800 (price only). No 300, no 900, no italics in UI.
- Eyebrows are the only uppercase text. Max one eyebrow per section.

---

## 5. Graphic language

Two devices, both lifted from the logo. Everything else is type, colour and photographs.

### 5.1 Device 1: the Rays
Short, round-capped strokes of irregular length fanning from a hidden centre, exactly as in the logo. Always `stroke: #FF9900` (sun-500), `stroke-linecap: round`, never animated, never filled shapes.

- **Ray mark (section marker).** Sits above the eyebrow of a section header, left-aligned with the text. 40×20px, max one per section, max four per page.
  ```html
  <svg class="ray-mark" width="40" height="20" viewBox="0 0 40 20" fill="none"
       stroke="#FF9900" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
    <path d="M11.3 19 3.6 14.5M15 15.3l-3-5.2M20 14V3M25 15.3l3-5.2M28.7 19l7.8-4.5"/>
  </svg>
  ```
- **Corner sunrise.** A quarter of the full sunburst (reuse `Sunburst.astro` with `spin` removed), anchored to one corner so only the rays show, no ring. Allowed in exactly three places: the mission band, the footer's top-right corner, and the booking confirmation screen. On canopy-900 at 100% opacity; on light surfaces at `opacity: 0.35`. Size 280 to 420px; it must be cropped by its container (`overflow: hidden`).
- **Ray bullet.** A single 12px ray tick replaces the four-point star in feature lists. Colour sun-500 on dark, canopy-600 on light.

### 5.2 Device 2: the Ring
The logo's thin circle. A `2px solid #FF9900` circle with a transparent or white centre.
- **Step numbers** in the booking flow (1, 2, 3): 32px ring, ink numeral, Figtree 700. Completed step: ring fills sun-500 with an ink tick.
- **Price roundel** on photos: 96px white disc with a 2px sun ring, e.g. "R200 / pp / night". At most one per image.
- **Logo containment.** When the mark has to sit on a photo, place it in a white disc with the 2px sun ring.
- Not for avatars, icons or decoration generally.

### 5.3 Logo usage
- Header lockup: mark at 44px plus a typeset wordmark "Pa's Place" (Fraunces 600, 22px, ink) and "Pennington · Non-profit company" (Figtree 600, 11px, ink-muted, 0.06em). The arched grey wordmark inside the mark is treated as illustration, not as the readable name.
- The white dove needs contrast: use the mark on **canopy-900** (footer, sidebar, mission band) or on **white** only. Never on page-cream photos, never on sun fills.
- Clear space equals the ring's radius. Minimum size 40px. Do not recolour, redraw, rotate or spin it.
- The **dove on its own** is reserved for mission moments (mission band, sponsor CTA, donation receipt). It is not a general ornament.

### 5.4 Retire on guest pages
Remove from every page except `/our-story`, and move their CSS into a storybook-only stylesheet:
torn-paper edges (`TornEdge`), masking tape (`.tape`), taped keepsake frames and tilts (`.keepsake*`), film grain (`body.grain`), Caveat (`.hand`), squiggle underline, drop caps, sticker buttons with hard offset shadows, stars, twinkle, fireflies, bobbing boat, spinning sunburst, waft, marquee, the rotating page-turn view transition, the transparent "moonlit" header, the custom brown scrollbar, the entire `night-*`, `moon`, `ember`, `bark-*`, `cream-*`, `cocoa`, `dove-*`, `sea-*`, `grass-*` palettes.

`/our-story` keeps all of it, but uses the new global header and footer so the reader can always get to "Book a stay".

---

## 6. Photography direction

### 6.1 Principles
- **Real photos only on guest pages.** Remove the AI images from `/`, `/book-a-stay`, `/venue-hire` and the gallery as real ones arrive; never show AI and real photos in the same view. AI images that show things the property does not have (rock pools, a golden beach with children) come out first. They may remain inside `/our-story` only, where they read as illustration.
- **Sources are small** (1280px square, 1200×1600). Never display a photo wider than about 720 CSS px, and never full-bleed. This rules out a full-width photo hero; use the split hero in §7.6.
- **Overcast skies:** crop so sky is under 15% of the frame, or let foliage fill the top edge. Never replace or tint skies, never add sun flares.
- **One light grade for all**, applied in the build (Sharp) or an export preset, so the set looks like one shoot without faking golden hour:
  - saturation 0.92 (the phone HDR greens are too hot), brightness 1.03, warm shift about +3% (hue 0, a slight red/yellow lift), shadows lifted slightly, gentle sharpen after resize.
  - Sharp starting point: `.modulate({ saturation: 0.92, brightness: 1.03 }).gamma(1.05).sharpen({ sigma: 0.6 })`.
  - No grain, no vignette, no borders, no filters, no duotones.
- **Treatment:** square-cornered photo inside a `border-radius: 14px` clip (20px for the hero), no frame, no tilt, no tape, optional `1px` line border when a pale sky meets the page.
- **Aspect ratios:** hero 4:5 (desktop) and 4:3 (mobile); feature and venue lead 3:2; cards 4:3; gallery thumbnails 1:1; lightbox uses the original ratio. Always set `object-position` deliberately.
- **Captions:** Figtree 13px, ink-muted, below the image, left-aligned, sentence case, factual, eight words or fewer ("Mini-golf under the big trees"). No handwriting, no caption overlaid on the photo. Alt text describes what is there; do not name the tree species unless the client confirms it.
- **People:** prefer backs, distance and activity. Any child whose face is recognisable needs written parental consent on file (POPIA; a child's image is personal information of a child and needs a competent person's consent). Without it, crop the child out or do not publish.

### 6.2 Photo map

| File | Rename to | What it shows | Best use | Crop / flags |
|---|---|---|---|---|
| `image0` | `pool-waterslides.jpg` | Pool, pink/blue and green/yellow slides, timber chairs, grey sky | **Home hero collage (secondary tile)**; "Pool and slides" feature card; `/venue-hire` facilities | Crop 3:2 from roughly y 430 to 1150 to drop the sky and most of the chairs. Children in swimwear are small and distant; keep it at card size and do not enlarge them. Safety signage is legible only when zoomed. |
| `image1` | `garden-big-tree.jpg` | The great spreading tree, lawn, adult and child walking away | **Home hero (primary, 4:5)** | Crop out the roof edge (top right) and the black bag (bottom, below y 1150). People are seen from behind. Safe. |
| `image2` | `mini-golf-family.jpg` | Adult and two children at a mini-golf hole, backs to camera | "Things to do" card on `/`; gallery, Activities | Digitally zoomed and soft: card size only (max 480px wide). Safe (backs). |
| `image3` | `lapa-party-wide.jpg` | Whole lapa with a party under way, slides behind | **`/venue-hire` lead image**: shows size and position next to the pool | Crop 3:2, cut the top sun flare and the bare ground at the bottom. Adults are small but one seated woman is recognisable at full size; keep at 720px or less, or ask her. |
| `image4` | `mini-golf-course.jpg` | Mini-golf course in dappled light, giraffe statue | Gallery, Activities (lead); "Mini-golf" feature card | Crop the right third to remove the shade-cloth fence and the neighbour's house. Adult seen from behind. Safe. |
| `image5` | `garden-lawn-canopy.jpg` | Wide lawn under the canopy, two tiny figures | Home "The garden" section; `/book-a-stay` header image; gallery, The garden | Use 3:2 from the upper two thirds. Clean and safe. Best "peaceful" shot. |
| `image6` | `mini-golf-child-putting.jpg` | Portrait: young child putting, facing camera | Gallery, Activities, **only with consent** | **Identifiable child, face visible. Do not publish without written parental consent.** Other children in the background. Never hero, never ads. |
| `image7` | `lapa-birthday-table.jpg` | Gingham table, balloons and banner under the lapa | `/venue-hire` "Birthdays" card; gallery, Parties | **Crop off the bottom 30%** (child's face in profile, bottom left). Banner and balloons are Teenage Mutant Ninja Turtles themed: third-party characters, so secondary placement only, never hero, social ads or print. |
| `image8` | `lapa-birthday-balloons.jpg` | Close-up of turtle-face balloons on a pole | Gallery, Parties, at most; otherwise hold | Character-themed decor is the subject, an electrical box is centre frame, a swimmer is in the background. **Lowest priority; recommend not using.** |
| `image9` | `lapa-birthday-boy.jpg` | Smiling boy holding a gift, adults at the braai | **Hold. Do not publish by default.** | **Clearly identifiable child, face-on.** Also TMNT stickers, a Hot Wheels shirt logo and a partial adult face at right. Only with written parental consent, and then only inside the gallery, never as hero, card art or in adverts. |

Recommended home hero: `image1` large (4:5) with `image0` and `image4` as two small tiles. That shows tree, pool and mini-golf in one glance without enlarging any single phone photo.

### 6.3 Shot list still needed (ask the client)
The beach and the walk to it; the house exterior; each bookable room (bunk room, family room); kitchen and bathrooms; the braai in use; the lapa empty and set for 40; the pool on a sunny day; the entrance and parking. Landscape orientation, original files (not WhatsApp-compressed), no faces unless consented.

---

## 7. UI components (public site)

### 7.1 Foundations

```css
/* spacing: 4px base */
--space-1: 4px;  --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 20px; --space-6: 24px;  --space-8: 32px;  --space-10: 40px;
--space-12: 48px; --space-16: 64px; --space-20: 80px; --space-24: 96px;

/* radii */
--radius-sm: 6px;    /* chips, badges, checkboxes, table tags */
--radius-md: 10px;   /* buttons, inputs, selects */
--radius-lg: 14px;   /* cards, photos, panels */
--radius-xl: 20px;   /* hero photo, booking panel */
--radius-full: 999px;/* ring, avatars, step numbers only */

/* shadows: soft, green-black tinted. No hard offset shadows. */
--shadow-xs: 0 1px 2px rgb(18 36 26 / 0.06);
--shadow-sm: 0 1px 2px rgb(18 36 26 / 0.06), 0 2px 6px rgb(18 36 26 / 0.06);
--shadow-md: 0 2px 4px rgb(18 36 26 / 0.06), 0 10px 24px -6px rgb(18 36 26 / 0.12);
--shadow-lg: 0 4px 8px rgb(18 36 26 / 0.06), 0 24px 48px -12px rgb(18 36 26 / 0.18);

/* widths */
--w-content: 72rem;  /* 1152px page container; side padding 20px mobile, 32px ≥768px */
--w-prose:   42rem;  /* long text */
--w-form:    40rem;  /* single-column forms */

/* motion */
--ease: cubic-bezier(0.2, 0, 0, 1);
--dur-fast: 120ms;  --dur: 180ms;  --dur-slow: 280ms;
```

Section rhythm: `padding-block: 64px` mobile, `96px` desktop. Bands alternate `page` and `sunken`; at most one `canopy-900` band per page (the mission band) plus the footer. Borders are always `1px` (2px only for focus, the Ring and selected states).

Focus (all interactive elements): `outline: 2px solid #2C6239; outline-offset: 2px;` on light; `outline-color: #FF9900` on canopy surfaces.

### 7.2 Buttons
Base: `display:inline-flex; align-items:center; gap:8px; height:48px; padding:0 22px; border-radius:10px; font:700 16px/1 var(--font-body); border:1px solid transparent; transition: background-color 120ms, border-color 120ms, box-shadow 120ms;`. Small: `height:40px; padding:0 16px; font-size:15px`. Full width on mobile inside forms. No transforms on hover, no offset shadows, no pills.

| Variant | Rest | Hover | Active | Use |
|---|---|---|---|---|
| **Primary** | bg `#FF9900`, text `#17231B`, `--shadow-xs` | bg `#FFAE33`, `--shadow-sm` | bg `#E58600` | The one booking action per view: "Check availability", "Book a stay", "Pay deposit" |
| **Secondary** | bg `#2C6239`, text `#FFFFFF` | bg `#22482F` | bg `#1A3324` | "Hire the venue", "Sponsor a child's holiday", "See the place" |
| **Tertiary** | bg transparent, text `#2C6239`, border `#CFC6B2` | bg `#F0F6EC`, border `#2C6239` | bg `#E2EEDD` | "View photos", "Back", "Open the map" |
| **On dark** | bg transparent, text `#F6F2E7`, border `rgb(246 242 231 / 0.4)` | bg `rgb(246 242 231 / 0.1)` | | secondary actions on canopy-900 |
| **Danger** | bg `#B42318`, text `#FFFFFF` | bg `#912018` | | admin only |
| Disabled | bg `#ECE8DF`, text `#5F685F`, no shadow, `cursor:not-allowed` | | | never use opacity for disabled |

Rules: one Primary per viewport. Text links are `#2C6239`, weight 600, `text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px` (2px on hover).

### 7.3 Cards
- **Standard:** `background:#FFFFFF; border:1px solid #E4DDCE; border-radius:14px; box-shadow: var(--shadow-sm); padding:24px` (20px mobile).
- **Photo card** (stay option, activity): image on top, flush, 4:3, top corners 14px; body padding 20px; title h4; meta row in `small`; price right-aligned with `tnum`; whole card is one link; hover `box-shadow: var(--shadow-md); border-color:#CFC6B2` (no lift, no rotate).
- **Selected** (chosen booking option): `border:2px solid #2C6239; background:#F0F6EC` plus a tick icon. Not a marigold slab.
- **Stay vs venue cards on the home page are equal weight**: same white card, differing only in photo and CTA variant. The current marigold "accent" card with a hard shadow goes.
- No tape, no tilt, no cards nested in cards.

### 7.4 Booking bar and form fields
- **Booking bar** (home hero and top of `/book-a-stay`): `background:#FFFFFF; border:1px solid #E4DDCE; border-radius:20px; box-shadow: var(--shadow-lg); padding:12px;` a 4-column grid on desktop (Option · Check-in · Check-out · Guests) with a Primary "Check availability" at the end; cells separated by `1px #E4DDCE`; stacks to one column under 768px with the button full width. Each cell: label 12px/600 ink-muted above a 16px/600 ink value. On mobile, a sticky bottom bar (`height:64px`, white, top border, shadow-lg reversed) shows "From R200 pp/night" and the Primary button.
- **Inputs, selects, textareas:** `height:48px; padding:0 14px; border:1px solid #8A8472; border-radius:10px; background:#FFFFFF; color:#17231B; font:400 16px var(--font-body);` (16px minimum to stop iOS zoom). Hover `border-color:#5F685F`. Focus `border-color:#2C6239; box-shadow:0 0 0 3px rgb(44 98 57 / 0.2); outline:none`. Placeholder `#5F685F`.
- **Label:** 14px/600 ink, `margin-bottom:6px`, always visible (no floating labels). Optional fields marked "(optional)"; do not use asterisks. Help text 13px ink-muted below.
- **Error:** `border-color:#B42318; box-shadow:0 0 0 3px rgb(180 35 24 / 0.15)`; message 13px/500 `#B42318` with a leading icon, linked with `aria-describedby`.
- **Calendar:** day cell 44×44px, `border-radius:10px`, `tnum`. Available: ink on white. Unavailable: `#5F685F` on `#F3EEE4`, struck through. Range ends: bg `#2C6239`, white text. In-range: bg `#E2EEDD`. Today: 2px sun ring (the Ring device).
- **Stepper** (guest count): 44px square tertiary buttons, value 18px/700 `tnum`.
- **Quote summary:** sunken panel `background:#F3EEE4; border-radius:14px; padding:20px`; rows 15px, amounts right-aligned `tnum`; total row with a `1px #CFC6B2` top rule, 20px/800. "Deposit due now" is the only highlighted line (sun-100 background).
- **Trust row** under the pay button: 13px ink-muted with a lock icon: "Secure payment · Registered non-profit company · Balance payable on arrival".

### 7.5 Badges and chips
- **Fact chip** (hero facts): `height:32px; padding:0 12px; border-radius:6px; background:#FFFFFF; border:1px solid #E4DDCE; font:600 14px; color:#17231B;` with a 16px canopy-600 icon. On photos use the same white chip; do not use blurred translucent pills.
- **Tag** (category): `height:24px; padding:0 8px; border-radius:6px; font:600 12px;` in tint pairs: canopy-700 on canopy-100, terracotta-700 on terracotta-100, pool-700 on pool-100.
- **Price badge:** ink on sun-100, 14px/700 `tnum`, radius 6px.
- **Status badge:** see §8.

### 7.6 Section header, hero, header, footer
- **Section header:** left-aligned. Ray mark (40×20), then 12px gap, eyebrow (13px/700 uppercase, `#9A5200`), 8px, h2 (ink), 12px, optional lead (ink-body, max 60ch). 40px below before content. Centre-aligned only in the mission band.
- **Home hero (split, no full-bleed):** `page` background, container `--w-content`, grid `1.05fr 0.95fr`, gap 48px, `padding-block: 48px 64px`. Left: eyebrow, display headline, lead, the booking bar, then three fact chips ("From R200 per person per night", "2 minutes from the beach", "Pool, slides and mini-golf"). Right: photo collage, one 4:5 image (`radius 20px`) with two 1:1 tiles (`radius 14px`) overlapping its lower left by 24px, 4px white border on the tiles, plus the price roundel. Mobile: headline, then the 4:3 photo, then the booking bar. Height is content-driven; drop `min-h-[92svh]`.
- **Header:** `position:sticky; top:0; height:68px` (60px mobile); `background:#FFFFFF; border-bottom:1px solid #E4DDCE;` no blur, no transparency, same on every page including `/our-story`. Gains `--shadow-sm` after 8px of scroll. Nav order: **Stay · Venue hire · What we do · Our story · Get involved**; links 15px/600 ink-body, hover ink, current page ink with a `2px #FF9900` underline offset 8px. Right side: phone number (tertiary link, desktop only) and Primary "Book a stay" (small, 40px). Mobile: menu button 44px, full-width sheet with 48px rows, Primary "Book a stay" and Secondary "Hire the venue" at the bottom.
- **Mission band** (one per guest page, near the end): `background:#12241A`, corner sunrise top right, dove mark 56px, h2 in on-dark, one sentence, Secondary-on-dark "Read our story" and Primary "Sponsor a child's holiday" (on `/get-involved`) or none. `padding-block:80px`.
- **Footer:** `background:#12241A; color:#F6F2E7`, straight top edge, no stars. Four columns (brand and one-line mission; Visit: Stay, Venue hire, Gallery; About: Our story, What we do, Get involved; Contact: phone, WhatsApp, email, address, map). Column headings 13px/700 uppercase `#B9C7B8`. Links on-dark, underline on hover. Bottom bar with `1px rgb(246 242 231 / 0.15)` top rule: "Pa's Place NPC · Reg. no. [number] · PBO no. [if any]" and Privacy (POPIA) and Terms links, 13px `#B9C7B8`. The NPC registration number must be shown; it is the single strongest trust signal for donors.

### 7.7 Motion
- Hover and focus transitions: 120ms, colour/border/shadow only.
- Entrance: one optional reveal per section, `opacity 0→1` and `translateY(8px→0)`, 280ms `--ease`, once, via `animation-timeline: view()` where supported (static elsewhere). No staggered hero choreography; the hero renders instantly (it is the LCP).
- Route change: plain 150ms cross-fade, or none. Remove the rotating page-turn.
- No infinite or ambient animation on guest pages. No parallax, no scroll-jacking, no JS motion libraries.
- `@media (prefers-reduced-motion: reduce)`: all animation and transitions off, `scroll-behavior:auto`.

---

## 8. Admin portal

Same tokens, same Figtree, same buttons and fields. None of the marketing layer: **no Fraunces, no Rays, no photos as decoration, no canopy bands, no Caveat.** The only brand marks are the logo in the sidebar and the Ring as the loading spinner. Wrap in `.admin { font-size:14px; font-variant-numeric: tabular-nums; background:#FBF8F2; }`.

- **Shell:** sidebar 248px (collapses to 64px icons under 1024px), `background:#12241A`. Logo lockup 32px at top, with the wordmark in Figtree 700 16px on-dark. Content area on `page`, max width 1440px, padding 24px. Top bar 56px white with `1px #E4DDCE` bottom border: page title, search, user menu.
- **Sidebar items:** 36px high, `padding:0 12px`, radius 6px, 14px/500 `#B9C7B8`, 18px icon. Hover: `background:#1A3324; color:#F6F2E7`. Active: `background:#1A3324; color:#FFFFFF; box-shadow: inset 3px 0 0 #FF9900`. Group labels 11px/600 uppercase `#B9C7B8`. Count pills: sun-500 fill with ink text, for "new" only.
- **Tables:** container white, `border:1px solid #E4DDCE; border-radius:10px; overflow:hidden`. Header row 36px, `background:#F3EEE4`, 12px/600 uppercase ink-muted. Body rows 44px (compact toggle 36px), 14px ink-body, `border-top:1px solid #E4DDCE`, cell padding `0 12px`. Hover `#FBF8F2`; selected `#F0F6EC` with `inset 3px 0 0 #2C6239`. Numbers, dates and money right-aligned. Primary identifier (guest name or reference) in ink 600 as a link. No zebra stripes. Sticky header; row actions in a trailing kebab menu.
- **Status badges:** `height:22px; padding:0 8px; border-radius:6px; font:600 12px;` a 6px leading dot plus the label; never colour alone.

  | Status | Text | Background | Dot |
  |---|---|---|---|
  | New / enquiry | `#0E6F78` | `#DDF3F4` | `#3FBFC6` |
  | Awaiting deposit / pending | `#855000` | `#FFEFD1` | `#FF9900` |
  | Confirmed / paid | `#1E6E3A` | `#E1F2E3` | `#1E6E3A` |
  | Checked in | `#FFFFFF` | `#2C6239` | none |
  | Completed / past | `#4F574F` | `#ECE8DF` | `#5F685F` |
  | Cancelled / refunded / failed | `#B42318` | `#FCE8E4` | `#B42318` |
  | Blocked (maintenance, charity camp) | `#4F574F` | white, `1px #CFC6B2` | none |

- **Calendar / occupancy grid:** one Play colour per bookable option (Bunk room pink, Family room blue, Whole house green, Venue yellow), ink text, radius 6px. Sponsored children's holidays use canopy-600 with white text so mission weeks stand out. Unconfirmed bookings use the same colour at a 2px dashed outline on white.
- **Forms:** inputs 36px high, 14px text, radius 6px, same border and focus rules as §7.4. Labels 12px/600 above. Two-column grid at ≥1024px, gap 16px; sections in white cards (radius 10px, padding 20px) with a 16px/700 title. Sticky footer action bar: Primary "Save" (36px) right, Tertiary "Cancel", Danger separated on the left. In admin the **Primary button is Secondary green** (`#2C6239`, white text); marigold is reserved for attention ("new" counts, pending).
- **KPI tiles:** white card, radius 10px, padding 16px; label 12px/600 ink-muted, figure 28px/700 ink `tnum`, delta 12px in success or danger with an arrow.
- **Empty states:** centred in the table area, 48px outline icon in `#CFC6B2`, title 16px/700 ink, one line 14px ink-muted, one button. No illustration, no dove.
- **Feedback:** toasts bottom right, white, `--shadow-lg`, 4px left border in the status colour, 14px. Inline alerts use the status bg with status text and a `1px` border in the status colour at 30% alpha. Destructive actions need a confirm dialog (radius 14px, max 440px) naming the booking reference.
- **Density and a11y:** minimum hit target 32px in admin (44px on public). Every colour-coded state has a text label.

---

## 9. Do / don't

**Do**
- Lead every guest page with price, place and a booking action above the fold.
- Use Sun for exactly two jobs: the primary action and the Rays/Ring devices.
- Use Canopy for everything else that needs colour (links, secondary buttons, dark bands, focus).
- Put photos in plain rounded rectangles and let the green do the talking.
- Use tabular numerals for every price, date and reference.
- State the mission once per page, calmly, with a link to `/our-story`.
- Show the NPC registration number in the footer and on donation and payment screens.
- Keep `/our-story` as the one place the storybook lives, behind the standard header and footer.
- Get written parental consent before any recognisable child appears; store the consent with the image record in the CMS.
- Check any new colour pair against the contrast table before shipping.

**Don't**
- Don't use sun-500 as text, as a thin icon, or under white text.
- Don't use Caveat, tape, torn edges, grain, stars, tilts, sticker shadows or the night palette on guest pages or in admin.
- Don't use Fraunces in buttons, forms, tables, labels or below 20px.
- Don't put more than one Primary button in a viewport, or a ray mark on more than four sections of a page.
- Don't run a photo full-bleed or wider than about 720px; the sources will not hold.
- Don't replace skies, add grain or grade toward golden hour.
- Don't mix AI and real photographs in the same view; don't use AI images of children on guest pages at all.
- Don't feature licensed characters (the turtle party decor, logo clothing) in heroes, adverts or print.
- Don't animate anything continuously; don't hijack scroll; don't add a motion library.
- Don't signal status by colour alone, and don't dim text with opacity.
- Don't write in storybook voice in the booking flow, emails, errors or admin.
