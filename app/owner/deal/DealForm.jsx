"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card, Money } from "@/components/ui";
import DealCard from "@/components/DealCard";

export default function DealForm({ restaurantName }) {
  return <Suspense><Deal restaurantName={restaurantName} /></Suspense>;
}

function Deal({ restaurantName }) {
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
  const min = d ? d.plateCost : 0; // cents
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
      <Card className="space-y-5">
        <p className="eyebrow">Deal is live / {dish}</p>
        <div className="flex items-end justify-between gap-4 border-b border-rule pb-5"><p className="text-2xl font-bold"><Money cents={cents} /></p><p className="mono text-xs text-ink">CLAIMED</p></div>
        <p className="text-8xl font-bold leading-none tracking-tight md:text-[11rem]">{claimed}{" "}<span className="mx-3 text-ink/70">of</span>{" "}{qty}</p>
        <p className="text-lg text-ink">Watch this number move as customers claim the offer.</p>
      </Card>
    );
  }

  const chip = "min-h-12 flex-1 border border-rule text-lg font-bold";
  const step = "size-12 border-2 border-ink bg-ink text-2xl font-bold text-paper hover:bg-ink/85";
  const preview = d && { restaurantName, dishName: d.name, normalPrice: d.price, dealPrice: cents >= 0 ? cents : min, qtyLeft: qty, expiresAt: Date.now() + mins * 60000 };
  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-start">
      <div className="md:order-last">
        <p className="mb-3 font-bold text-ink/70">What students will see</p>
        {/* ponytail: plain phone frame, no device chrome */}
        <div className="mx-auto max-w-sm rounded-[2.5rem] border-4 border-ink bg-paper p-4">
          <div aria-hidden className="mx-auto mb-3 h-2 w-20 rounded-full bg-ink" />
          {preview ? <DealCard d={preview} /> : <p className="p-5">Add a dish on the Menu page first.</p>}
        </div>
      </div>
      <Card className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Drop a deal</h1>
        <label className="block font-bold">Dish
          <select value={dish} onChange={(e) => { setDish(e.target.value); setTouched(false); }}
            className="mt-2 block min-h-12 w-full border border-rule bg-white px-3 text-lg">
            {dishes.map((x) => <option key={x._id}>{x.name}</option>)}
          </select>
        </label>
        <div>
          <p className="font-bold">How many</p>
          <div className="mt-1 flex items-center gap-4">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Fewer" className={step}>−</button>
            <span className="mono w-16 text-center text-3xl font-bold">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} aria-label="More" className={step}>+</button>
          </div>
        </div>
        <div>
          <p className="font-bold">Ends in</p>
          <div className="mt-1 flex gap-3">
            {[30, 60, 120].map((m) => (
              <button key={m} onClick={() => setMins(m)} aria-pressed={mins === m}
                className={`${chip} ${mins === m ? "bg-ink text-paper" : "bg-white hover:border-ink"}`}>
                {m} min
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-bold">Deal price ($)
            <input type="number" inputMode="decimal" step="0.01" value={shown}
              onChange={(e) => { setTouched(true); setPrice(e.target.value); }}
              className="mono mt-2 block w-full border border-rule bg-white px-3 num-key" />
          </label>
          {d && <p className="mt-2">Plate cost <b className="tabular-nums"><Money cents={min} /></b> — you can&apos;t go below this. Suggested: <b className="tabular-nums"><Money cents={suggested} /></b></p>}
          {tooLow && <p className="mt-2 font-bold">Price can&apos;t go below <Money cents={min} />.</p>}
        </div>
        {err && <p className="font-bold">{err}</p>}
        <Button onClick={drop} disabled={!d || tooLow} className="md:w-full">Drop deal</Button>
      </Card>
    </div>
  );
}
