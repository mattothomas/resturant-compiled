"use client";
import { useEffect, useState } from "react";

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
    <div className="rounded-2xl border-4 border-navy bg-white p-5">
      <p className="text-lg font-bold">{d.restaurantName}</p>
      <h2 className="font-display text-3xl leading-tight">{d.dishName}</h2>
      <p className="mt-2 flex items-baseline gap-3">
        <span className="text-4xl font-black text-navy">{usd(d.dealPrice)}</span>
        <span className="text-xl line-through opacity-70">{usd(d.normalPrice)}</span>
      </p>
      <p className="mt-2 text-lg font-bold">{d.qtyLeft} left · ends in <Countdown to={d.expiresAt} /></p>
      {claimed ? (
        <p className="mt-4 rounded-xl bg-margin p-4 text-xl font-bold text-white">Claimed! Show this screen at the counter.</p>
      ) : soldOut || d.qtyLeft <= 0 ? (
        <p className="mt-4 rounded-xl bg-loss p-4 text-xl font-bold text-white">Sold out.</p>
      ) : (
        <button onClick={claim} className="mt-4 h-20 w-full rounded-xl bg-deal text-3xl font-black text-navy">Claim</button>
      )}
    </div>
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

  if (!deals) return <p className="text-lg">Loading…</p>;
  if (!deals.length) return <p className="text-xl font-bold">No deals right now. Check back after dinner rush.</p>;
  return <div className="mx-auto flex max-w-md flex-col gap-5">{deals.map(d => <Card key={d._id} d={d} />)}</div>;
}
