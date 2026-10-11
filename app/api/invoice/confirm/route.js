import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { costPerUnit, unitKind } from "@/lib/cost";
import { recomputeCosts } from "@/lib/prices";

export async function POST(req) {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;
  const { restaurantId } = owner;
  const { vendor = "", date, fileName = "", lines = [] } = await req.json();
  // prices are dated by calendar day (UTC midnight); same-day ties go to the later entry
  const when = new Date(date || new Date().toISOString().slice(0, 10));
  if (isNaN(when)) return Response.json({ error: "Bad date" }, { status: 400 });

  const db = await getDb();
  const col = db.collection("ingredients");
  const clean = lines.map((l) => ({ description: l.description ?? "", ingredient: l.ingredient || null, packUnit: l.packUnit,
    packCount: Number(l.packCount), packSize: Number(l.packSize), linePrice: Number(l.linePrice) }));
  const { insertedId: invoiceId } = await db.collection("invoices").insertOne({
    restaurantId, vendor: String(vendor).trim(), date: when, fileName: String(fileName), lines: clean, createdAt: new Date(),
  });

  const old = {}, prices = [], skipped = [];
  for (const line of clean) {
    if (!line.ingredient) continue; // owner left it unmatched
    const skip = (reason) => skipped.push({ description: line.description, reason });

    const ing = await col.findOne({ restaurantId, name: line.ingredient });
    if (!ing) { skip(`No ingredient named "${line.ingredient}"`); continue; }
    if (![line.packCount, line.packSize, line.linePrice].every((n) => Number.isFinite(n) && n > 0)) {
      skip("Missing pack count, size, or price"); continue;
    }
    if (!unitKind(line.packUnit) || unitKind(line.packUnit) !== unitKind(ing.unit)) {
      skip(`Unit "${line.packUnit}" doesn't fit ${ing.name} (stored per ${ing.unit})`); continue;
    }

    old[ing.name] ??= ing.costPerUnit;
    prices.push({ restaurantId, ingredient: ing.name, costPerUnit: costPerUnit(line), source: "invoice", invoiceId, date: when });
  }
  if (prices.length) await db.collection("prices").insertMany(prices);

  const names = Object.keys(old);
  await recomputeCosts(restaurantId, names);
  // newCost is the newest price by date, which may be an older invoice's if this one is backdated
  const now = await col.find({ restaurantId, name: { $in: names } }).toArray();
  const updated = now.map((i) => ({ ingredient: i.name, oldCost: old[i.name], newCost: i.costPerUnit }));
  return Response.json({ updated, skipped });
}
