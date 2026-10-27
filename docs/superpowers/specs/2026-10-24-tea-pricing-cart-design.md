# Tea Pricing and Cart Design

## Intent

Show the photographed in-store tea prices on the matching tea cards, let customers choose an amount before adding loose tea to the basket, and make basket contents easier to recognize with thumbnails.

## Decisions

- Prices are transcribed only when the supplied shelf labels are readable; missing prices are not invented.
- Loose tea prices are expressed per 100 g. The amount picker accepts 50–1000 g in 50 g steps and never lets one tea line exceed 1 kg.
- Mango Kürəsi follows its photographed per-piece price and uses a piece selector instead of pretending it has a weight price.
- Tea and equipment share the existing local browser basket. Every newly added item stores its image so both tea and equipment baskets can show thumbnails.
- The amount picker is an accessible modal; the basket remains a slide-in drawer and works on mobile.
- Dessert names and prices receive a modest font-weight increase without changing the menu layout.

## Approaches

- Chosen: keep the buildless HTML/CSS/JavaScript structure, add small data and cart utility modules, and progressively enhance the existing tea cards. This preserves the current site and makes the pricing rules testable.
- Rejected: hard-code a separate button and popup into every card. It would duplicate state and make future price updates error-prone.
- Rejected: convert the site to a framework. It is unnecessary for this local static catalog.

## Constraints

- Preserve the existing mobile-first tea design and existing equipment catalog behavior.
- Store basket state locally; no checkout or server integration is added.
- Maximum loose-tea quantity is 1000 g per tea line.

