# Components Inventory (Redesign Branch)

| Component Name | Where Used | Token Dependencies | Strict Enforcement |
|---|---|---|---|
| `ProductCard` | `page.tsx` (Home Special Grids), `shop/` route categories | `--space-8`, `--space-16`, `--radius-sm`, `--text-caption` | **Equal Height Constraint**: Handled by Grid/Flex grow; **Image Ratio**: `aspect-ratio: 1`, `object-fit: contain` |
| `PromoCard` | `page.tsx` (Secondary Hero Grid) | `--space-16`, `--space-32` | 4-column desktop wrapping to 2-column mobile. |
| `CatButton` | `page.tsx` (Everyday Shopping Blocks) | `--space-32`, `--radius-sm`, `--color-border` | Identifies Woolworths structural category navigation mapping. |
| `BigPromo` (e.g. `bigRed`) | `page.tsx` (Shop Promotions Band) | `--space-24`, `--radius-sm`, Brand colors | Strict padding mapping exactly to the retail design prompt. |
