# Current vs Design Mismatch Matrix

| Page | Section | Current UI issue (Pre-Fix) | /design requirement | Fix approach | Files/components | Status |
|---|---|---|---|---|---|---|
| Home | Hero | Used messy produce background heavily reliant on arbitrary spacing. | Exact hero layout from `/design` (solid typography, no arbitrary fruit). | Rebuild Hero component mapped to Woolworths `landingpage.jpeg`. | `page.tsx`, `page.module.css` | **PASS** |
| Home | Category Nav | Categories were vertically scattered or missing rigid boxes. | 8 clear grid buttons, strict border spacing mapping to Daily Shopping blocks. | Hard-coded strict category grid. | `page.tsx`, `page.module.css` | **PASS** |
| General | Product Grid | Uneven card heights, arbitrary column breaks on responsive view. | Fixed ratio + equal-height cards utilizing 2/3/4/5 column logic. | Enforce `ProductCard` contract and strict CSS Grid logic. | `page.module.css`, `ProductCard.tsx` | **PASS** |
| Product detail / Card | Price block | Missing cash-and-carry unit price (`price per unit`), messy badges. | Show pack size + unit price. Exact SAVE label in top right. | Update `PriceBlock` logic and strict absolute positioning on badges. | `ProductCard.tsx`, `ProductCard.module.css` | **PASS** |
| System | Spacing | Random paddings (e.g. 10px, 20px). | 8/12/16/24/32px scale strictly. | Centralized variables and purged pixel-scatter in all files. | `globals.css` | **PASS** |
