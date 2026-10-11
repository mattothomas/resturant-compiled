import { getDb } from "@/lib/db";
import { plateCost, foodCostPct, OVER_TARGET } from "@/lib/cost";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const [dishes, ings] = await Promise.all([
    db.collection("dishes").find().toArray(),
    db.collection("ingredients").find().toArray(),
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
