import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { plateCost, foodCostPct, OVER_TARGET } from "@/lib/cost";
import { Badge, Card, Money } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Page() {
  const owner = await getOwner();
  if (!owner) redirect("/login");
  const { restaurantId } = owner;
  const db = await getDb();
  const [dishes, ings] = await Promise.all([
    db.collection("dishes").find({ restaurantId }).sort({ name: 1 }).toArray(),
    db.collection("ingredients").find({ restaurantId }).toArray(),
  ]);
  const costs = Object.fromEntries(ings.map((i) => [i.name, i.costPerUnit ?? 0]));
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl md:text-5xl">Your menu</h1>
      <Link
        href="/owner/menu/new"
        className="flex min-h-14 w-full items-center justify-center rounded-xl bg-deal px-6 text-xl font-bold text-navy md:inline-flex md:min-h-16 md:w-auto"
      >
        Add a plate
      </Link>
      {!dishes.length && <p>No plates yet. Add your first one.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {dishes.map((d) => {
          const pct = foodCostPct(d, costs);
          const over = pct > OVER_TARGET;
          return (
            <Card key={d._id.toString()} className="space-y-3">
              <h2 className="text-2xl font-bold">{d.name}</h2>
              <div className="flex gap-6">
                <div><p>Menu price</p><Money cents={d.price} className="text-3xl font-bold md:text-4xl" /></div>
                <div><p>Plate cost</p><Money cents={Math.round(plateCost(d, costs))} className="text-3xl font-bold md:text-4xl" /></div>
              </div>
              <p className={`text-3xl font-bold md:text-4xl ${over ? "text-loss" : "text-margin"}`}>
                {(pct * 100).toFixed(0)}% food cost{" "}
                {over && <Badge tone="loss" className="align-middle">Over cost target</Badge>}
              </p>
              <Link
                href={`/owner/menu/${d._id}`}
                className="flex min-h-14 items-center justify-center rounded-xl border-2 border-navy px-6 text-xl font-bold"
              >
                Edit
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
