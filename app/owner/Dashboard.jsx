"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import InvoiceUpload from "@/components/InvoiceUpload";
import { Button, Card, Money, Badge } from "@/components/ui";
import { OVER_TARGET } from "@/lib/cost";

const TARGET = Math.round(OVER_TARGET * 100);
const priced = (d) => d.plateCost > 0; // null (missing ingredient cost) or 0 → no number to show
const pct = (d) => `${Math.round(d.foodCostPct * 100)}%`;
const dollars = (cents) => `$${Math.abs(cents / 100).toFixed(2)}`;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// worst food cost first, unpriced plates last
const worstFirst = (a, b) => (priced(b) - priced(a)) || (b.foodCostPct - a.foodCostPct);

export default function Dashboard() {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dishes, setDishes] = useState(null);
  const [deltas, setDeltas] = useState({}); // dish name -> plate cost change (cents) from the last saved invoice
  const [summary, setSummary] = useState(null);

  async function load() {
    const data = await fetch("/api/dishes", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
    if (!Array.isArray(data)) return null;
    setDishes(data.sort(worstFirst));
    return data;
  }
  useEffect(() => { load(); }, []);

  async function saved(result) {
    const before = Object.fromEntries((dishes ?? []).map((d) => [d.name, d.plateCost]));
    const after = (await load()) ?? [];
    const moved = {};
    for (const d of after) if (priced(d) && before[d.name] > 0 && d.plateCost !== before[d.name]) moved[d.name] = d.plateCost - before[d.name];
    setDeltas(moved);
    const jumps = result.updated
      .filter((u) => u.oldCost > 0)
      .map((u) => ({ name: cap(u.ingredient), change: Math.round((u.newCost / u.oldCost - 1) * 100) }))
      .filter((j) => j.change) // re-pricing at the same cost leaves float dust
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    setSummary({ count: result.updated.length, jumps, dishes: after.filter((d) => moved[d.name]).sort(worstFirst), skipped: result.skipped });
  }

  const pricedDishes = dishes?.filter(priced) ?? [];
  const over = pricedDishes.filter((d) => d.overTarget).length;
  const average = pricedDishes.length ? Math.round(pricedDishes.reduce((s, d) => s + d.foodCostPct, 0) / pricedDishes.length * 100) : null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-8">
        <header className="flex flex-col gap-5 border-b border-rule pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Your plates</h1>
            <p className="mt-2 text-lg md:text-xl">Food cost per plate, worst first. Target {TARGET}%.</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) { setSummary(null); setFile(f); } }} />
          <Button className="md:shrink-0" onClick={() => fileRef.current.click()}>Upload invoice</Button>
        </header>

        {summary && <SavedSummary {...summary} />}

        {!dishes && <p className="py-8">Loading menu costs…</p>}
        {dishes?.length === 0 && (
          <Card className="space-y-4 text-lg">
            <p>No plates yet. Add your first plate to see its cost.</p>
            <Link href="/owner/menu/new" className="inline-flex min-h-12 items-center border-2 border-ink px-5 font-bold hover:bg-ink hover:text-paper">Add a plate</Link>
          </Card>
        )}

        {dishes?.length > 0 && (
          <section className="grid grid-cols-3 gap-px border border-rule bg-rule" aria-label="Menu at a glance">
            <Stat label="Plates tracked" value={dishes.length} />
            <Stat label="Over cost target" value={over} tone={over ? "text-loss" : ""} />
            <Stat label="Average food cost" value={average == null ? "—" : `${average}%`} />
          </section>
        )}

        {dishes?.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {dishes.map((d) => <DishCard key={d._id} d={d} delta={deltas[d.name]} />)}
            </AnimatePresence>
          </section>
        )}

        <InvoiceUpload file={file} onSaved={saved} />
      </div>
    </MotionConfig>
  );
}

function DishCard({ d, delta }) {
  const has = priced(d);
  const tone = !has ? "text-ink/50" : d.overTarget ? "text-loss" : "text-margin";
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      className={`flex flex-col border border-l-4 border-rule bg-surface p-5 ${d.overTarget && has ? "border-l-loss" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-xl font-bold md:text-2xl">{d.name}</h3>
        {d.overTarget && has && <Badge tone="loss">Over cost target</Badge>}
      </div>
      <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
        <span className={`text-[32px] font-bold leading-none tabular-nums md:text-[40px] ${tone}`}>{has ? pct(d) : "—"}</span>
        <span className="text-lg">food cost</span>
      </p>
      {delta ? (
        <p className={`mt-3 self-start rounded-full border px-3 py-1 text-base font-bold tabular-nums ${delta > 0 ? "border-loss text-loss" : "border-ink"}`}>
          {delta > 0 ? "↗ +" : "↘ −"}{dollars(delta)} since this invoice
        </p>
      ) : null}
      {!has && <p className="mt-2 text-lg text-ink/70">Add prices to see this plate&apos;s cost</p>}
      <dl className="mt-5 divide-y divide-rule border-t border-rule text-lg">
        <Row label="Plate cost">{has ? <Money cents={d.plateCost} /> : "—"}</Row>
        <Row label="Menu price"><Money cents={d.price} /></Row>
        <Row label="Margin">{has ? <Money cents={d.price - d.plateCost} /> : "—"}</Row>
      </dl>
      <Link href={`/owner/deal?dish=${encodeURIComponent(d.name)}`} className="mt-4 self-start py-2 text-lg font-bold underline underline-offset-4 hover:no-underline">Drop a deal</Link>
    </motion.div>
  );
}

function Row({ label, children }) {
  return <div className="flex justify-between gap-4 py-2"><dt className="text-ink/70">{label}</dt><dd className="font-bold tabular-nums">{children}</dd></div>;
}

function Stat({ label, value, tone = "" }) {
  return <div className="bg-surface px-3 py-3 md:px-5 md:py-4"><p className="text-base leading-tight text-ink/70">{label}</p><p className={`mt-1 text-[32px] font-bold leading-none tabular-nums ${tone}`}>{value}</p></div>;
}

function SavedSummary({ count, jumps, dishes, skipped }) {
  return (
    <Card className="space-y-3 text-lg" role="status">
      <h2 className="text-2xl font-bold">{count ? `Updated ${count} ingredient cost${count === 1 ? "" : "s"}` : "Nothing updated"}</h2>
      {jumps.length > 0 && (
        <p>
          <span className="text-ink/70">Your biggest jumps: </span>
          {jumps.map((j, i) => (
            <span key={j.name}>{i ? ", " : ""}{j.name} <b className={`tabular-nums ${j.change > 0 ? "text-loss" : ""}`}>{j.change > 0 ? "+" : ""}{j.change}%</b></span>
          ))}.
        </p>
      )}
      {count > 0 && !jumps.length && <p>No price changes on this invoice.</p>}
      {dishes.map((d) => (
        <p key={d._id}>
          <b>{d.name}</b> is now <b className={`tabular-nums ${d.overTarget ? "text-loss" : ""}`}>{pct(d)}</b> food cost
          {d.overTarget ? <> — over your {TARGET}% target.</> : "."}
        </p>
      ))}
      {skipped.length > 0 && (
        <ul className="border-t border-rule pt-3 text-base text-ink/70">
          {skipped.map((s, i) => <li key={i}>Not saved: <span className="mono">{s.description || "line"}</span> — {s.reason}</li>)}
        </ul>
      )}
    </Card>
  );
}
