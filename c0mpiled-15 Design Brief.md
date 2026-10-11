# c0mpiled-15 Design Brief

Oct 11, 2026 · @leon

## Audience and feel

Two audiences on one site: State College students who want cheap food from their spots, and the owners of those spots who need to know what each plate costs. Every page should feel local, loud, and obvious.

|  | Students | Restaurant owners |
| --- | --- | --- |
| Context | On a phone, walking downtown, after class or late night | On a phone between tickets, or a laptop after close |
| What they want | "Where's a deal right now?" | "Which dish is losing me money?" |
| Tone that works | Fun, local, a little hype | Plain, respectful, numbers first |

Voice: talk like a neighbor, not a startup. Name real places they know (College Ave, Beaver Ave, downtown, game-day Saturdays). Short sentences, no jargon: say "plate cost," never "COGS."

Avoid Penn State logos, the Nittany Lion mark, or official university wordmarks; those are trademarked. Local street names and "State College" are fine.

## Pages and navigation

Four pages total. The landing page splits visitors into owners and students; students scanning the QR code skip straight to the deals page.

&#91;embedded content: site map · 4 pages\]

- **Two doors on the landing page:** two giant buttons, "I run a restaurant" and "I'm hungry." Nothing else competes with them.
- **One main action per page,** the biggest thing on screen: Upload invoice, Drop a deal, Claim.
- **Top bar:** logo (goes home) plus the other door. Two links, no hamburger menu, even on phones.
- **Invoice upload lives on the dashboard,** not its own page. Extracted lines appear in a panel to confirm, then the dish cards update.

## Landing page

Six sections, top to bottom. The two doors appear in the hero and again at the bottom so nobody has to scroll back up. All copy is a starting draft; swap in the real restaurant's name and quote once the visit happens.

| Section | What's in it | Draft copy |
| --- | --- | --- |
| 1. Hero | Huge headline, one-line subhead, the two door buttons | "Keep College Ave cooking." / "We show State College restaurants what every plate really costs, and turn tonight's leftovers into deals for you." / \[I'm hungry\] \[I run a restaurant\] |
| 2. Live strip | A bold bar showing live deal count, pulled from the deals data | "Live now: 3 deals downtown, ending tonight" |
| 3. Two sides | Two big cards side by side (stacked on phone), 3 one-line points each | **Students:** Real deals from spots you already love. Priced so the restaurant still wins, so they keep doing it. No app: scan, claim, show the code. **Owners:** Upload an invoice, see every plate's true cost. Spot the dish losing money before month-end. Turn leftovers into customers tonight. |
| 4. How it works | 3 numbered steps with one icon each | "Owner uploads an invoice" → "Leftovers become a deal" → "You claim it on your phone" |
| 5. Local proof | The owner's quote, photo of the storefront (with permission), restaurant name | "\[Quote from today's visit\]" — \[Owner\], \[Restaurant\], \[Street\] |
| 6. Footer | The two doors again, plus a one-line credit | "Built in 3 hours at c0mpiled-15, State College" |

Local micro-copy to sprinkle in (pick 2–3, don't use all):

- "Game-day rush? Know your costs before the crowd hits town."
- "1 a.m. after the library? Somebody downtown has a deal."
- "Your burrito didn't get pricier because they're greedy. Ingredients went up and nobody could see it."

## Visual system

Big, bold, few colors. If something can be read from across the room on a projector, it can be read on a phone outside a pizza shop.

| Element | Desktop | Phone | Notes |
| --- | --- | --- | --- |
| Headline | 64–72px, extra bold | 40px | Tight line height (\~1.05) |
| Section heading | 40px bold | 28px |  |
| Body text | 20px | 18px | Never smaller than 16px anywhere |
| Key numbers (plate cost, margin, deal price) | 40px bold | 32px | The biggest thing on a dashboard card |
| Buttons | 64px tall, 20px bold label | Full width, 56px tall | One primary button per page |

| Color | Use it for | Suggested value |
| --- | --- | --- |
| Deep navy | Headlines, top bar, footer: feels local without using any logo | #0B1F3A |
| Warm off-white | Page background (food, not fintech) | #FAF7F2 |
| Deal orange | Every deal and every primary button | #FF8A00, with dark navy text on it for contrast |
| Loss red | Only money lost: the losing dish, the cost spike | #D7263D |
| Margin green | Healthy margin only | #1B998B |

Fonts (Google Fonts): a heavy display face for headlines (e.g. Archivo Black) and a clean sans for everything else (e.g. Inter).

Accessibility basics:

- Text contrast at least 4.5:1; check the orange buttons especially.
- Tap targets at least 44px; ours are bigger anyway.
- Never use color alone: a losing dish gets a red color **and** a "Losing money" label.
