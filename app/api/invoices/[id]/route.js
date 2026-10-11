import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { costPerUnit, unitKind } from "@/lib/cost";
import { recomputeCosts } from "@/lib/prices";

export const dynamic = "force-dynamic";

// → { owner, db, invoice } or a Response to return as-is
async function load(params) {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;
  const { id } = await params;
  const db = await getDb();
  const invoice = ObjectId.isValid(id) && await db.collection("invoices")
    .findOne({ _id: new ObjectId(id), restaurantId: owner.restaurantId });
  if (!invoice) return Response.json({ error: "Not found" }, { status: 404 });
  return { owner, db, invoice };
}

const byName = async (db, restaurantId, names) =>
  Object.fromEntries((await db.collection("ingredients").find({ restaurantId, name: { $in: names } }).toArray())
    .map((i) => [i.name, i]));

export async function GET(_req, { params }) {
  const r = await load(params);
  return r instanceof Response ? r : Response.json(r.invoice);
}

export async function PUT(req, { params }) {
  const r = await load(params);
  if (r instanceof Response) return r;
  const { owner: { restaurantId }, db, invoice } = r;
  const { vendor = "", date, lines = [] } = await req.json();
  const when = new Date(date || invoice.date);
  if (isNaN(when) || !Array.isArray(lines)) return Response.json({ error: "Bad date or lines" }, { status: 400 });

  const clean = lines.map((l) => ({ description: l.description ?? "", ingredient: l.ingredient || null, packUnit: l.packUnit,
    packCount: Number(l.packCount), packSize: Number(l.packSize), linePrice: Number(l.linePrice) }));
  const names = [...new Set([...invoice.lines, ...clean].map((l) => l.ingredient).filter(Boolean))];
  const known = await byName(db, restaurantId, names);
  const old = Object.fromEntries(Object.values(known).map((i) => [i.name, i.costPerUnit]));

  const prices = [], skipped = [];
  for (const line of clean) {
    if (!line.ingredient) continue;
    const skip = (reason) => skipped.push({ description: line.description, reason });
    const ing = known[line.ingredient];
    if (!ing) { skip(`No ingredient named "${line.ingredient}"`); continue; }
    if (![line.packCount, line.packSize, line.linePrice].every((n) => Number.isFinite(n) && n > 0)) {
      skip("Missing pack count, size, or price"); continue;
    }
    if (!unitKind(line.packUnit) || unitKind(line.packUnit) !== unitKind(ing.unit)) {
      skip(`Unit "${line.packUnit}" doesn't fit ${ing.name} (stored per ${ing.unit})`); continue;
    }
    prices.push({ restaurantId, ingredient: ing.name, costPerUnit: costPerUnit(line), source: "invoice", invoiceId: invoice._id, date: when });
  }

  await db.collection("invoices").updateOne({ _id: invoice._id }, { $set: { vendor: String(vendor).trim(), date: when, lines: clean } });
  await db.collection("prices").deleteMany({ restaurantId, invoiceId: invoice._id });
  if (prices.length) await db.collection("prices").insertMany(prices);
  await recomputeCosts(restaurantId, names);

  const now = await byName(db, restaurantId, names);
  const updated = Object.keys(now).map((n) => ({ ingredient: n, oldCost: old[n], newCost: now[n].costPerUnit }));
  return Response.json({ updated, skipped });
}

export async function DELETE(_req, { params }) {
  const r = await load(params);
  if (r instanceof Response) return r;
  const { owner: { restaurantId }, db, invoice } = r;
  await db.collection("prices").deleteMany({ restaurantId, invoiceId: invoice._id });
  await db.collection("invoices").deleteOne({ _id: invoice._id });
  await recomputeCosts(restaurantId, invoice.lines.map((l) => l.ingredient).filter(Boolean));
  return Response.json({ ok: true });
}
