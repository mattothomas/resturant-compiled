import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { plateCost, foodCostPct, unitKind, TO_BASE, OVER_TARGET } from "@/lib/cost";

export const dynamic = "force-dynamic";

export async function GET() {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;
  const { restaurantId } = owner;
  const db = await getDb();
  const [dishes, ings] = await Promise.all([
    db.collection("dishes").find({ restaurantId }).toArray(),
    db.collection("ingredients").find({ restaurantId }).toArray(),
  ]);
  const costs = Object.fromEntries(ings.map((i) => [i.name, i.costPerUnit]));
  return Response.json(
    dishes.map((d) => {
      const pct = foodCostPct(d, costs);
      return { _id: d._id, name: d.name, price: d.price, plateCost: Math.round(plateCost(d, costs)),
        foodCostPct: pct, overTarget: pct > OVER_TARGET };
    })
  );
}

// Validates a POST/PUT body → { dish: { name, price, lines } } or { error }. Used by [id]/route.js too.
export async function parseDish(req, restaurantId) {
  const b = await req.json().catch(() => null);
  const name = typeof b?.name === "string" ? b.name.trim() : "";
  const price = Math.round(Number(b?.price));
  if (!name) return { error: "Give the plate a name" };
  if (!(price > 0)) return { error: "Menu price must be more than $0" };
  if (!Array.isArray(b.lines) || !b.lines.length) return { error: "Add at least one ingredient" };
  const ings = await (await getDb()).collection("ingredients").find({ restaurantId }).toArray();
  const lines = [];
  for (const l of b.lines) {
    const ing = ings.find((i) => i.name === l?.ingredient);
    const qty = Number(l?.qty);
    if (!ing) return { error: `Unknown ingredient: ${l?.ingredient || "(none picked)"}` };
    if (!(TO_BASE[l.unit] > 0)) return { error: `Pick a unit for ${ing.name}` };
    if (!(qty > 0)) return { error: `Enter a quantity for ${ing.name}` };
    if (unitKind(l.unit) !== unitKind(ing.unit))
      return { error: `${ing.name} is counted in ${ing.unit}, so "${l.unit}" won't work. Use a ${unitKind(ing.unit)} unit.` };
    lines.push({ ingredient: ing.name, qty: qty * TO_BASE[l.unit] });
  }
  return { dish: { name, price, lines } };
}

export async function POST(req) {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;
  const { restaurantId } = owner;
  const { dish, error } = await parseDish(req, restaurantId);
  if (error) return Response.json({ error }, { status: 400 });
  const doc = { restaurantId, ...dish };
  const { insertedId } = await (await getDb()).collection("dishes").insertOne(doc);
  return Response.json({ _id: insertedId, ...dish });
}
