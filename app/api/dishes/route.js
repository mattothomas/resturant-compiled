import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { plateCost, foodCostPct, OVER_TARGET } from "@/lib/cost";

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
