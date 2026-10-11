"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card, Money } from "@/components/ui";

export default function Page() {
  return <Suspense><Deal /></Suspense>;
}

function Deal() {
  const [dishes, setDishes] = useState([]);
  const [dish, setDish] = useState(useSearchParams().get("dish") ?? "");
  const [qty, setQty] = useState(10);
  const [mins, setMins] = useState(60);
  const [price, setPrice] = useState(""); // dollars
  const [touched, setTouched] = useState(false);
  const [err, setErr] = useState("");
  const [deal, setDeal] = useState(null);
  const [live, setLive] = useState(null);

  useEffect(() => {
    fetch("/api/dishes").then((r) => r.json()).then((d) => {
      if (!Array.isArray(d)) return;
      setDishes(d);
      setDish((cur) => (d.some((x) => x.name === cur) ? cur : d[0]?.name ?? ""));
    }).catch(() => {});
  }, []);

  const d = dishes.find((x) => x.name === dish);
  const min = d ? Math.ceil(d.plateCost / 25) * 25 : 0; // cents, up to next $0.25
  const suggested = d ? Math.max(min, Math.round(d.price / 2)) : 0;
  // follow the suggestion until the owner types their own price
  const shown = touched ? price : d ? (suggested / 100).toFixed(2) : "";
  const cents = Math.round(parseFloat(shown) * 100);
  const tooLow = d && !(cents >= min);

  // poll the live claim count once a deal is dropped
  useEffect(() => {
    if (!deal) return;
    const tick = async () => {
      try {
        const list = await fetch("/api/deals", { cache: "no-store" }).then((r) => r.json());
        const mine = Array.isArray(list) && list.find((x) => x._id === deal._id);
        if (mine) setLive(mine.qtyLeft);
      } catch {} // placeholder / error responses: keep last value
    };
    tick();
    const t = setInterval(tick, 2000);
    return () => clearInterval(t);
  }, [deal]);

  async function drop() {
    setErr("");
    try {
      const res = await fetch("/api/deals", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dishName: dish, dealPrice: cents, qty, expiresInMinutes: mins }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?._id) return setErr(body?.error ?? "Couldn't drop the deal. Try again.");
      setLive(body.qtyLeft ?? qty);
      setDeal(body);
    } catch { setErr("Couldn't reach the server. Try again."); }
  }

  if (deal) {
    const claimed = Math.max(0, qty - (live ?? qty));
    return (
      <Card className="space-y-4 text-center">
        <p className="text-xl font-bold">{dish} · <Money cents={cents} /> · live now</p>
        <p className="font-display text-[96px] leading-none md:text-[200px]">{claimed} of {qty}</p>
        <p className="text-2xl font-bold">claimed</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-6">
      <h1 className="font-display text-3xl md:text-5xl">Drop a deal</h1>
      <label className="block font-bold">Dish
        <select value={dish} onChange={(e) => { setDish(e.target.value); setTouched(false); }}
          className="mt-1 block min-h-14 w-full rounded-xl border-2 border-navy bg-white px-3 text-xl">
          {dishes.map((x) => <option key={x._id}>{x.name}</option>)}
        </select>
      </label>
      <div>
        <p className="font-bold">How many</p>
        <div className="mt-1 flex items-center gap-4">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Fewer"
            className="size-14 rounded-xl bg-navy text-3xl font-bold text-offwhite">−</button>
          <span className="w-16 text-center text-4xl font-bold">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} aria-label="More"
            className="size-14 rounded-xl bg-navy text-3xl font-bold text-offwhite">+</button>
        </div>
      </div>
      <div>
        <p className="font-bold">Ends in</p>
        <div className="mt-1 flex gap-3">
          {[30, 60, 120].map((m) => (
            <button key={m} onClick={() => setMins(m)} aria-pressed={mins === m}
              className={`min-h-14 flex-1 rounded-xl border-2 border-navy text-xl font-bold ${mins === m ? "bg-navy text-offwhite" : "bg-white"}`}>
              {m} min
            </button>
          ))}
        </div>
      </div>
      <label className="block font-bold">Deal price ($)
        <input type="number" inputMode="decimal" step="0.25" value={shown}
          onChange={(e) => { setTouched(true); setPrice(e.target.value); }}
          className="mt-1 block min-h-14 w-full rounded-xl border-2 border-navy bg-white px-3 text-3xl font-bold" />
      </label>
      {d && (
        <p>Lowest allowed: <b><Money cents={min} /></b> (plate cost, up to the next quarter) · Suggested: <b><Money cents={suggested} /></b></p>
      )}
      {tooLow && <p className="font-bold text-loss">Price can&apos;t go below <Money cents={min} />.</p>}
      {err && <p className="font-bold text-loss">{err}</p>}
      <Button onClick={drop} disabled={!d || tooLow} className="md:min-h-20 md:w-full md:text-3xl">Drop deal</Button>
    </Card>
  );
}
