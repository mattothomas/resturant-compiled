# API contract (money in integer cents unless noted)

- GET /api/dishes → [{ _id, name, price, plateCost, foodCostPct, overTarget }]
- GET /api/ingredients → [{ name, unit, costPerUnit }]
- POST /api/invoice (multipart, field "file", image or PDF) → { lines: [{ description, ingredient|null, packCount, packSize, packUnit, linePrice (dollars) }] }
- POST /api/invoice/confirm { lines } → { updated: [{ ingredient, oldCost, newCost }], skipped: [{ description, reason }] }
- GET /api/deals → active deals [{ _id, dishName, normalPrice, dealPrice, qtyLeft, expiresAt }]
- POST /api/deals { dishName, dealPrice, qty, expiresInMinutes } → deal, or 400 if dealPrice < plate cost
- POST /api/deals/:id/claim → { qtyLeft } or 409 { error: "Sold out" }
