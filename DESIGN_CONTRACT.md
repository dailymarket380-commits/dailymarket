# DESIGN CONTRACT
## DAILY MARKET

### A) Screen Inventory
- `landingpage.jpeg`: Maps to Home page (Hero, Categories, Promos, Orange Bar, Grid)
- `snacks.jpeg`, `beverages.jpeg`, `butchery.jpeg`: Map to Product Listing / Shop pages (Filters sidebar, Title, Product Cards)

### B) Component Inventory
- `Header`: Clean, center-aligned nav, inline search
- `ProductCard`: Fixed aspect ratio, ellipsis title, SAVE badge, price footer
- `CategoryBar`: Clean layout for "Everyday Shopping" links
- `PromoStack`: 4-column promo images and large colored banners ('WEEKLY OFFERS')

### C) Design Tokens Extracted
- **Colors**:
  - Primary text: `#000000`
  - Secondary text: `#666666`
  - Background: `#ffffff`
  - Surface: `#f7f7f8`
  - Border: `#eeeeee`
  - Accent/Danger: `#d32f2f` (Save badge)
- **Typography**: `Inter`, system-ui
  - Sizes: 28px (Hero), 18px (Section), 14px (Body), 12px (Caption)
- **Spacing Scale (STRICT)**:
  - `8px`, `12px`, `16px`, `24px`, `32px`
- **Radii**: 
  - Small: `4px`
  - Medium: `8px`
  - Large: `12px`
- **Shadows**:
  - Level 1: `0 1px 4px rgba(0,0,0,0.05)`

### D) Interaction Rules
- Buttons use solid black background with white text, no border radius rounding except default `4px`.
- Product cards hover state pushes the card up slightly with a level 2 shadow.
- Nav items use an underline or bold state on active/focus.

### E) Image Rules
- Product images: 1:1 aspect ratio (`aspect-ratio: 1`), `object-fit: contain`. White or transparent backgrounds (like Woolworths).
- Hero image: `object-fit: cover` with proper composition constraints. Promos utilize colorful backgrounds with tight text.
