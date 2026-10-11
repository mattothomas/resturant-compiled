import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

// _id and source are extras on top of CONTRACT.md: source = where the current cost came from
export async function GET() {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;
  const { restaurantId } = owner;
  const db = await getDb();
  const rows = await db.collection("ingredients").find({ restaurantId }).sort({ name: 1 }).toArray();
  // newest price per ingredient, same ordering recomputeCosts uses
  const latest = {};
  for (const p of await db.collection("prices").find({ restaurantId }).sort({ date: -1, _id: -1 }).toArray()) latest[p.ingredient] ??= p;
  const invoices = Object.fromEntries((await db.collection("invoices")
    .find({ restaurantId, _id: { $in: Object.values(latest).map((p) => p.invoiceId).filter(Boolean) } }).toArray())
    .map((i) => [String(i._id), i]));
  return Response.json(rows.map((i) => {
    const p = latest[i.name], inv = p?.invoiceId && invoices[String(p.invoiceId)];
    return { _id: i._id, name: i.name, unit: i.unit, costPerUnit: i.costPerUnit,
      source: inv ? { type: "invoice", vendor: inv.vendor, date: inv.date, invoiceId: inv._id } : { type: "manual" } };
  }));
}

export async function POST(req) {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;
  const { name, unit } = await req.json();
  const clean = String(name ?? "").trim();
  if (!clean || !["g", "ml", "each"].includes(unit)) return Response.json({ error: "Need a name and a unit (g, ml or each)" }, { status: 400 });
  const col = (await getDb()).collection("ingredients");
  if (await col.findOne({ restaurantId: owner.restaurantId, name: clean })) {
    return Response.json({ error: `You already have "${clean}"` }, { status: 409 });
  }
  const doc = { restaurantId: owner.restaurantId, name: clean, unit, costPerUnit: 0 };
  const { insertedId } = await col.insertOne(doc);
  return Response.json({ ...doc, _id: insertedId });
}
