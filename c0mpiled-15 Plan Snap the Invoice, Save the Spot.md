# c0mpiled-15 Plan: Snap the Invoice, Save the Spot

&#32;Oct 11, 2026 · @leon

Owners upload a photo or PDF of a supplier invoice and see each dish's true cost; leftover food becomes a cost-priced deal pushed live to students. The demo climax is a deal dropped to the whole room by QR code. We have 5:00–8:00 to build it and record the video, so we only build what the video shows.

Design: c0mpiled-15 Design Brief · Roles: c0mpiled-15 Team Roles

## Concept

**"Snap the invoice. Save the spot."** One cost engine, two sides:

- **Owners:** upload an invoice photo or PDF, see every dish's plate cost, spot the one losing money.
- **Students:** leftover food becomes a deal priced from that cost, pushed to nearby phones. The restaurant's waste becomes your discount.

**Why students care:** they notice price hikes at their usual spot and don't want it to close.

**Pricing claim to use:** owners who can't see costs raise the entire menu's price; owners who can see costs raise only the dishes losing money. The 10 dollar favorite stays at the same price, while the 8 dollar dish that 5 people order goes up. **\
vs Too Good To Go:** their surplus bags aren't priced from real costs; our deals never go below cost.

## What we build

**Build for real:** the landing page; the owner dashboard with invoice upload; the deal drop; the live deals page with a Claim button.

**Type in by hand (seed data):** 3 dishes with recipes and menu prices, using ingredient names that match the invoice.

**Skip:** logins, a dish setup page, an ingredient-match page, a price-alerts page, multi-page PDFs, an installable app, Textract, live push (the deals page just refreshes every 2 seconds).

## Timeline

| Time | Leon (design) | Frontend | Backend | Sales and pitch |
| --- | --- | --- | --- | --- |
| 5:00–5:20 | Agree on the 4 pages; start the landing page in Claude Design | Set up the web app and deploy a blank page | Agree on the 5 endpoints and seed data; set up MongoDB | Call or walk to a restaurant now, before dinner peaks |
| 5:20–6:15 | Design all 4 pages (see the design brief) | Build the dashboard and deal pages with fake data | Invoice → AI → plate costs; deals and claims | Get an invoice photo, permission to name them, a quote; write the video script |
| 6:15–7:00 | Hand off designs; build the landing page | Apply the designs; connect to the real API | Help connect; test claims on 5 phones | Film storefront, owner, phones claiming |
| 7:00 | **Code freeze** |  |  |  |
| 7:00–7:40 | Edit the video | Run the demo for recording | Run the demo for recording | Narrate |
| 7:40–8:00 | **Submit**, with 20 minutes of buffer for upload problems |  |  |  |

Checkpoint at 6:15: if a real invoice doesn't turn into plate costs yet, switch to a clean printed test invoice and keep going.

## Tech, simplest version

- **One web app** in the team's usual stack, deployed wherever the team deploys fastest.
- **Invoice reading:** send the image or PDF straight to a vision-capable AI model and ask for JSON lines: name, pack count, pack size, pack unit, line price. The owner fixes any wrong line before saving.
- **Cost math (plain code, no AI):** cost per unit = line price ÷ (pack count × pack size); plate cost = sum of each ingredient's quantity × cost per unit.
- **Database:** MongoDB Atlas with four collections: dishes, ingredients, deals, claims.
- **Claims:** one atomic decrement on the deal's quantity, so 50 people tapping at once can't oversell.

The 5 endpoints: `POST /invoice`, `GET /dishes`, `POST /deals`, `GET /deals`, `POST /deals/:id/claim`.

## Video (90 seconds)

| Time | On screen | Line |
| --- | --- | --- |
| 0:00–0:10 | Downtown storefront | "Raise your hand if \[your spot\]'s prices went up this year." |
| 0:10–0:25 | The owner and their invoice | "It's not greed. Ingredients went up, and nobody could see it." |
| 0:25–0:55 | Upload the invoice → the losing dish turns red | "One upload: their #1 dish loses $X a plate." |
| 0:55–1:15 | Drop a deal → phones claim it | "Leftovers become a deal, priced so the restaurant never loses money." |
| 1:15–1:30 | Landing page, then the team | "Snap the invoice. Save the spot." |

Don't say "we lower food prices" or "90% of restaurants fail in year one" (a myth).

## If something breaks

| Problem | Do this |
| --- | --- |
| No restaurant agrees | Use a seeded demo restaurant, labeled as a demo. Never name a real place without permission. |
| No restaurant gives a deal | Buy a few pizzas and drop free slices, or use a labeled demo deal |
| AI misreads the invoice | Fix lines on screen, or use a clean printed invoice |
| Deal page breaks | Film the one run that worked |
| Behind at 6:30 | Cut claim codes, then the landing page's lower sections |
