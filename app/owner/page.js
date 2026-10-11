"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import InvoiceUpload from "@/components/InvoiceUpload";
import { Money, Badge } from "@/components/ui";

export default function Owner() {
  const [dishes, setDishes] = useState(null);
  const [changed, setChanged] = useState({}); // name -> old plate cost
  const prev = useRef({});

  const refetch = useCallback(async () => {
    const data = await fetch("/api/dishes", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
    if (!Array.isArray(data)) return;
    const diff = {};
    for (const d of data) if (prev.current[d.name] != null && prev.current[d.name] !== d.plateCost) diff[d.name] = prev.current[d.name];
    prev.current = Object.fromEntries(data.map((d) => [d.name, d.plateCost]));
    setDishes(data.sort((a, b) => b.foodCostPct - a.foodCostPct));
    setChanged(diff);
    if (Object.keys(diff).length) setTimeout(() => setChanged({}), 6000);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const flagged = dishes?.filter((d) => d.overTarget).length ?? 0;
  const averageFoodCost = dishes?.length
    ? Math.round(dishes.reduce((sum, d) => sum + d.foodCostPct, 0) / dishes.length * 100)
    : 0;

  return (
    <div className="space-y-10">
      <section className="flex flex-col justify-between gap-5 border-b border-rule pb-8 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Owner desk / live costs</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">Know what pays.</h1>
          <p className="mt-3 max-w-xl text-lg text-ink">Your menu, priced against what is actually coming through the back door.</p>
        </div>
        <p className="mono text-xs text-ink">UPDATED WHEN AN INVOICE IS SAVED</p>
      </section>

      <section className="grid border-y border-rule md:grid-cols-3">
        <Summary label="Dishes tracked" value={dishes ? dishes.length : "—"} detail="from your current menu" />
        <Summary label="Needs attention" value={dishes ? flagged : "—"} detail={flagged ? "above your cost target" : "nothing flagged"} tone={flagged ? "loss" : "margin"} />
        <Summary label="Average food cost" value={dishes ? `${averageFoodCost}%` : "—"} detail="across tracked dishes" />
      </section>

      <InvoiceUpload onSaved={refetch} />
      <section>
        <div className="mb-4 flex items-end justify-between border-b border-rule pb-3">
          <div>
            <p className="eyebrow">Menu economics</p>
            <h2 className="mt-1 text-2xl font-bold">Your plates</h2>
          </div>
          <span className="mono text-xs text-ink">TARGET / 35%</span>
        </div>
        {!dishes && <p className="py-8 text-ink">Loading menu costs…</p>}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {dishes?.map((d) => {
              const margin = d.price - d.plateCost;
              const old = changed[d.name];
              return (
                <motion.article key={d._id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                  className={`border bg-surface ${d.overTarget ? "border-loss" : "border-rule"} ${old != null ? "ring-4 ring-action ring-offset-2 ring-offset-paper" : ""}`}>
                  <div className="grid gap-5 p-4 md:grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(110px,0.7fr)_)] md:items-center md:p-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold">{d.name}</h3>
                        {d.overTarget && <Badge tone="loss">Over cost target</Badge>}
                      </div>
                      {old != null && <p className="mono mt-2 text-xs text-loss">COST MOVED {formatDelta(d.plateCost - old)}</p>}
                    </div>
                    <Stat label="Plate cost"><Money cents={d.plateCost} /></Stat>
                    <Stat label="Margin"><Money cents={margin} className={d.overTarget ? "text-loss" : "text-margin"} /></Stat>
                    <Stat label="Food cost"><span className={d.overTarget ? "text-loss" : ""}>{(d.foodCostPct * 100).toFixed(0)}%</span></Stat>
                    <Link href={`/owner/deal?dish=${encodeURIComponent(d.name)}`} className="flex min-h-12 items-center justify-center border-2 border-ink px-4 text-sm font-bold hover:bg-ink hover:text-paper md:min-w-32">Drop a deal</Link>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

function Summary({ label, value, detail, tone }) {
  return <div className="border-b border-rule px-1 py-5 first:pl-0 last:border-b-0 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
    <p className="eyebrow">{label}</p>
    <p className={`mt-2 text-4xl font-bold tracking-tight ${tone === "loss" ? "text-loss" : tone === "margin" ? "text-margin" : ""}`}>{value}</p>
    <p className="mt-1 text-sm text-ink">{detail}</p>
  </div>;
}

function Stat({ label, children }) {
  return (
    <dl>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 text-2xl font-bold md:text-3xl">{children}</dd>
    </dl>
  );
}

function formatDelta(cents) {
  return `${cents >= 0 ? "+" : "-"}${Math.abs(cents / 100).toFixed(2)}`;
}
