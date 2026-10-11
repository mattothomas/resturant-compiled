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
    <div className="space-y-10">
      <section className="flex flex-col justify-between gap-5 border-b border-rule pb-8 md:flex-row md:items-end"><div><p className="eyebrow">Owner desk / menu</p><h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">Your menu.</h1><p className="mt-3 text-lg text-ink">The recipes behind every margin decision.</p></div><span className="mono text-xs text-ink">{dishes.length} PLATES</span></section>
      <Link
        href="/owner/menu/new"
        className="flex min-h-12 w-full items-center justify-center border-2 border-ink bg-action px-5 text-base font-bold text-ink hover:-translate-y-0.5 md:inline-flex md:w-auto"
      >
        Add a plate
      </Link>
      {!dishes.length && <p>No plates yet. Add your first one.</p>}
      <div className="grid gap-2 md:grid-cols-2">
        {dishes.map((d) => {
          const pct = foodCostPct(d, costs);
          const over = pct > OVER_TARGET;
          return (
            <Card key={d._id.toString()} className={`space-y-4 ${over ? "border-loss" : ""}`}>
              <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Plate</p><h2 className="mt-1 text-2xl font-bold">{d.name}</h2></div>{over && <Badge tone="loss">Over target</Badge>}</div>
              <div className="grid grid-cols-2 gap-4 border-y border-rule py-4">
                <div><p className="eyebrow">Menu price</p><Money cents={d.price} className="mono mt-1 text-2xl font-bold" /></div>
                <div><p className="eyebrow">Plate cost</p><Money cents={Math.round(plateCost(d, costs))} className="mono mt-1 text-2xl font-bold" /></div>
              </div>
              <p className={`mono text-2xl font-bold ${over ? "text-loss" : "text-margin"}`}>{(pct * 100).toFixed(0)}% <span className="font-sans text-base text-ink">food cost</span></p>
              <Link
                href={`/owner/menu/${d._id}`}
                className="flex min-h-12 items-center justify-center border-2 border-ink px-5 text-base font-bold hover:bg-ink hover:text-paper"
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
