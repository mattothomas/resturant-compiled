import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { plateCost } from "@/lib/cost";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const deals = await db.collection("deals")
    // sold-out deals stay listed until expiry so the owner's counter reaches "N of N" and students see "Sold out."
    .find({ expiresAt: { $gt: new Date() } })
    .sort({ _id: -1 }).toArray();
  return Response.json(deals);
}

export async function POST(req) {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;
  const { restaurantId, name: restaurantName } = owner;
  const { dishName, dealPrice, qty, expiresInMinutes } = await req.json();
  if (!Number.isFinite(dealPrice) || !(qty > 0) || !(expiresInMinutes > 0))
    return Response.json({ error: "dealPrice, qty, expiresInMinutes required" }, { status: 400 });

  const db = await getDb();
  const dish = await db.collection("dishes").findOne({ restaurantId, name: dishName });
  if (!dish) return Response.json({ error: "Unknown dish" }, { status: 400 });

  const costs = Object.fromEntries(
    (await db.collection("ingredients").find({ restaurantId }).toArray()).map(i => [i.name, i.costPerUnit]));
  const cost = plateCost(dish, costs);
  if (!(dealPrice >= cost))
    return Response.json({ error: `Deal price is below plate cost (${Math.ceil(cost)} cents)` }, { status: 400 });

  const deal = {
    restaurantId, restaurantName, dishName, normalPrice: dish.price, dealPrice, qtyLeft: qty,
    expiresAt: new Date(Date.now() + expiresInMinutes * 60000),
  };
  const { insertedId } = await db.collection("deals").insertOne(deal);
  return Response.json({ _id: insertedId, ...deal });
}
