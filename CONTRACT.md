# API contract (money in integer cents unless noted)

Owner routes need the `session` cookie and answer 401 `{ error }` without it. Everything they read or write is
scoped to the logged-in restaurant, including lookups by `_id` (another restaurant's id → 404, never its data).
Server pattern: pages call `getOwner()` and `redirect("/login")` on null; API routes do
`const owner = await requireOwner(); if (owner instanceof Response) return owner;` (both in `lib/auth.js`).

Prices are dated by calendar day (UTC midnight). An ingredient's `costPerUnit` is its newest `prices` row by
`date`, same-day ties going to the later entry; after writing or deleting `prices` rows, call
`recomputeCosts(restaurantId, ingredientNames)` from `lib/prices.js`.

## Public

- GET /api/deals → unexpired deals from every restaurant, including sold out (qtyLeft 0) [{ _id, restaurantName, dishName, normalPrice, dealPrice, qtyLeft, expiresAt }]
- POST /api/deals/:id/claim → { qtyLeft } or 409 { error: "Sold out" }
- Pages: /, /deals, /login, /signup

## Auth

- POST /api/auth/signup { restaurantName, email, password (min 8) } → { name } + session cookie; 400 on bad input, 409 if the email exists
- POST /api/auth/login { email, password } → { name } + session cookie, or 401 { error: "Wrong email or password" }
- POST /api/auth/logout → clears the session, 303 to /login
- GET /api/auth/me → { restaurantId, name } or 401

## Owner

- GET /api/dishes → [{ _id, name, price, plateCost, foodCostPct, overTarget }]
- POST /api/dishes { name, price, lines: [{ ingredient, qty, unit }] } → dish; qty is converted to the ingredient's base unit with TO_BASE; 400 on unit-kind mismatch
- PUT /api/dishes/:id (same body) → dish
- DELETE /api/dishes/:id
- GET /api/ingredients → [{ name, unit, costPerUnit }]
- POST /api/ingredients { name, unit } → ingredient
- PUT /api/ingredients/:id { linePrice, packCount, packSize, packUnit } → adds a "manual" prices row, recomputes
- POST /api/invoice (multipart, field "file", image or PDF) → { lines: [{ description, ingredient|null, packCount, packSize, packUnit, linePrice (dollars) }] }
- POST /api/invoice/confirm { vendor, date ("YYYY-MM-DD", default today), fileName, lines } → saves the invoice, one "invoice" prices row per accepted line, recomputes → { updated: [{ ingredient, oldCost, newCost }], skipped: [{ description, reason }] }
- GET /api/invoices → [{ _id, vendor, date, lineCount, total }]
- GET /api/invoices/:id → full invoice
- PUT /api/invoices/:id { vendor, date, lines } → replaces that invoice's prices rows, recomputes → { updated }
- DELETE /api/invoices/:id → removes it and its prices rows, recomputes
- POST /api/deals { dishName, dealPrice, qty, expiresInMinutes } → deal (stores restaurantId, restaurantName), or 400 if dealPrice < plate cost
- Pages: /owner, /owner/deal, /owner/invoices, /owner/invoices/:id, /owner/ingredients, /owner/menu, /owner/menu/:id

## Collections

- restaurants { name, email (unique, lowercase), passwordHash, salt }
- sessions { tokenHash (sha256 of the cookie token), restaurantId, expiresAt (7 days) }
- ingredients { restaurantId, name, unit (g / ml / each), costPerUnit (cents per base unit) }
- dishes { restaurantId, name, price, lines: [{ ingredient, qty (base unit) }] }
- deals { restaurantId, restaurantName, dishName, normalPrice, dealPrice, qtyLeft, expiresAt }
- invoices { restaurantId, vendor, date, fileName, lines, createdAt }
- prices { restaurantId, ingredient, costPerUnit, source: "invoice" | "manual", invoiceId?, date }
