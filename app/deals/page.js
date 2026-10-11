"use client";
import { useEffect, useState } from "react";
import DealCard from "@/components/DealCard";

const LOCAL_PARTNERS = [
  "Big Bowl Noodle House", "Sizzling Bites", "Halal Cart", "Uncle Chens", "Osaka",
  "Subway", "Raising Cane's", "Big Deans", "Harry's Hotdogs", "Little Anthony's",
  "Little Chef", "Double D Diner", "Jack's Pizza",
];

function Card({ d }) {
  const key = `claimed:${d._id}`;
  const [claimed, setClaimed] = useState(false);
  const [soldOut, setSoldOut] = useState(false);
  useEffect(() => {
    try { setClaimed(!!localStorage.getItem(key)); } catch {}
  }, [key]);

  async function claim() {
    const r = await fetch(`/api/deals/${d._id}/claim`, { method: "POST" });
    if (r.ok) {
      try { localStorage.setItem(key, "1"); } catch {}
      setClaimed(true);
    } else setSoldOut(true);
  }

  return <DealCard d={d} claimed={claimed} soldOut={soldOut} onClaim={claim} />;
}

export default function Page() {
  const [deals, setDeals] = useState(null);
  useEffect(() => {
    const load = () => fetch("/api/deals", { cache: "no-store" }).then(r => r.json()).then(setDeals).catch(() => {});
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  const sorted = deals && [...deals].sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Deals downtown right now</h1>
      <p className="mt-3 flex items-center gap-2 text-ink/70">
        <span aria-hidden className="size-3 rounded-full bg-margin motion-safe:animate-pulse" />Live — updates every 2 seconds
      </p>
      {!deals ? <p className="mt-8">Loading deals…</p> : !deals.length ? (
        <div className="mt-8"><div className="mx-auto max-w-3xl"><div className="mb-10 border-b border-rule pb-6"><p className="eyebrow">College Ave / partner board</p><h2 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">The next deal is being cooked.</h2><p className="mt-4 max-w-xl text-lg text-ink">No live offers right now. These are the kitchens we are building the board with.</p></div><div className="grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">{LOCAL_PARTNERS.map((name) => <div key={name} className="bg-surface p-5 font-bold">{name}</div>)}</div><p className="mt-8 font-mono text-sm uppercase tracking-[0.08em] text-ink">Check back after the dinner rush for live offers.</p></div></div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">{sorted.map(d => <Card key={d._id} d={d} />)}</div>
      )}
    </div>
  );
}
