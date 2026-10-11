"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

const LOCAL_PARTNERS = [
  "Big Bowl Noodle House", "Sizzling Bites", "Halal Cart", "Uncle Chens", "Osaka",
  "Subway", "Raising Cane's", "Big Deans", "Harry's Hotdogs", "Little Anthony's",
  "Little Chef", "Double D Diner", "Jack's Pizza",
];

const usd = (c) => `$${(c / 100).toFixed(2)}`;

function Countdown({ to }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const s = Math.max(0, Math.floor((new Date(to) - now) / 1000));
  return <span>{Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")}</span>;
}

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

  return (
    <motion.article layout initial={{ y: 10 }} animate={{ y: 0 }} className="border border-rule bg-surface p-5">
      <div className="flex items-center justify-between gap-3 border-b border-rule pb-3">
        <p className="eyebrow">{d.restaurantName}</p>
        <span className="mono text-xs text-ink">LIVE OFFER</span>
      </div>
      <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight">{d.dishName}</h2>
      <p className="mt-2 flex items-baseline gap-3">
        <span className="text-5xl font-bold tracking-tight">{usd(d.dealPrice)}</span>
        <span className="mono text-sm text-ink line-through">was {usd(d.normalPrice)}</span>
      </p>
      <p className="mt-4 flex items-center justify-between border-y border-rule py-3 text-sm font-bold">
        <span>{d.qtyLeft} left</span>
        <span className="mono text-xs text-ink">ENDS IN <Countdown to={d.expiresAt} /></span>
      </p>
      {claimed ? (
        <motion.p initial={{ scale: 0.98 }} animate={{ scale: 1 }} className="mt-4 bg-margin p-4 text-lg font-bold text-white">Claimed! Show this screen at the counter.</motion.p>
      ) : soldOut || d.qtyLeft <= 0 ? (
        <p className="mt-4 bg-loss p-4 text-lg font-bold text-white">Sold out.</p>
      ) : (
        <button onClick={claim} className="mt-5 min-h-16 w-full border-2 border-ink bg-action text-2xl font-bold text-ink hover:-translate-y-0.5">Claim this deal</button>
      )}
    </motion.article>
  );
}

export default function Page() {
  const [deals, setDeals] = useState(null);
  useEffect(() => {
    const load = () => fetch("/api/deals", { cache: "no-store" }).then(r => r.json()).then(setDeals).catch(() => {});
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  if (!deals) return <p className="text-ink">Loading tonight&apos;s board…</p>;
  if (!deals.length) return <div className="mx-auto max-w-3xl"><div className="mb-10 border-b border-rule pb-6"><p className="eyebrow">College Ave / partner board</p><h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">The next deal is being cooked.</h1><p className="mt-4 max-w-xl text-lg text-ink">No live offers right now. These are the kitchens we are building the board with.</p></div><div className="grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">{LOCAL_PARTNERS.map((name) => <div key={name} className="bg-surface p-5 font-bold">{name}</div>)}</div><p className="mt-8 font-mono text-sm uppercase tracking-[0.08em] text-ink">Check back after the dinner rush for live offers.</p></div>;
  return <div className="mx-auto max-w-md"><div className="mb-8 border-b border-rule pb-5"><p className="eyebrow">College Ave / available now</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Eat well. Waste less.</h1><p className="mt-3 text-ink">Real food, available for a little less while it&apos;s still hot.</p></div><div className="flex flex-col gap-4">{deals.map(d => <Card key={d._id} d={d} />)}</div></div>;
}
