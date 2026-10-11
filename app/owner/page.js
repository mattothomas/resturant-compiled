"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import InvoiceUpload from "@/components/InvoiceUpload";
import { Card, Money, Badge } from "@/components/ui";

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

  return (
    <div className="space-y-6">
      <InvoiceUpload onSaved={refetch} />
      <h1 className="font-display text-3xl md:text-5xl">Your plates</h1>
      {!dishes && <p>Loading…</p>}
      {dishes?.map((d) => {
        const margin = d.price - d.plateCost;
        const old = changed[d.name];
        return (
          <Card key={d._id}
            className={`border-4 transition-all ${d.overTarget ? "border-loss" : "border-transparent"} ${old != null ? "ring-8 ring-deal" : ""}`}>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl md:text-4xl">{d.name}</h2>
              {d.overTarget && <Badge tone="loss">Over cost target</Badge>}
            </div>
            <dl className="my-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="Plate cost">
                {old != null && <span className="block text-base font-normal"><Money cents={old} /> →</span>}
                <Money cents={d.plateCost} />
              </Stat>
              <Stat label="Menu price"><Money cents={d.price} /></Stat>
              <Stat label="Margin"><Money cents={margin} className={d.overTarget ? "text-loss" : "text-margin"} /></Stat>
              <Stat label="Food cost"><span className={d.overTarget ? "text-loss" : ""}>{(d.foodCostPct * 100).toFixed(0)}%</span></Stat>
            </dl>
            <Link href={`/owner/deal?dish=${encodeURIComponent(d.name)}`}
              className="flex min-h-14 items-center justify-center rounded-xl bg-deal px-6 text-xl font-bold text-navy md:inline-flex md:min-h-16">
              Drop a deal
            </Link>
          </Card>
        );
      })}
    </div>
  );
}

function Stat({ label, children }) {
  return (
    <div>
      <dt className="text-base">{label}</dt>
      <dd className="text-[32px] font-bold md:text-[40px]">{children}</dd>
    </div>
  );
}
