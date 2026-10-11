"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui";

const door = "flex min-h-12 w-full items-center justify-center border-2 px-6 text-base font-bold md:w-auto";

function Doors({ dark }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <Link href="/deals" className={`${door} border-ink bg-action text-ink hover:-translate-y-0.5`}>See tonight&apos;s deals</Link>
      <Link href="/owner" className={`${door} ${dark ? "border-paper text-paper hover:bg-paper hover:text-ink" : "border-ink text-ink hover:bg-ink hover:text-paper"}`}>Open the owner desk</Link>
    </div>
  );
}

const SIDES = [
  { who: "Students", points: ["Real deals from spots you already love.", "Priced so the restaurant still wins, so they keep doing it.", "No app: scan, claim, show the code."] },
  { who: "Owners", points: ["Upload an invoice, see every plate's true cost.", "Spot the dish losing money before month-end.", "Turn leftovers into customers tonight."] },
];

const STEPS = [
  { icon: "🧾", text: "Owner uploads an invoice" },
  { icon: "🍕", text: "Leftovers become a deal" },
  { icon: "📱", text: "You claim it on your phone" },
];

export default function Page() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    fetch("/api/deals")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setCount(d.filter((x) => x.qtyLeft > 0).length || null))
      .catch(() => {}); // ponytail: strip simply stays hidden on failure
  }, []);

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      <section className="grid gap-10 pt-4 md:grid-cols-[1.2fr_0.8fr] md:items-end md:pt-12">
        <div className="flex flex-col gap-6">
          <p className="eyebrow">State College / restaurant economics</p>
          <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] tracking-tight md:text-8xl">Keep College Ave cooking.</h1>
          <p className="max-w-2xl text-xl leading-relaxed text-ink/65">
            Know what every plate costs. Move the food that needs a good home tonight.
          </p>
        </div>
        <Doors />
      </section>

      {count && (
        <div className="flex items-center justify-between gap-4 border-y-2 border-ink py-4 text-lg font-bold md:text-xl">
          <span><span className="text-loss">Live now:</span> {count} {count === 1 ? "deal" : "deals"} downtown</span>
          <span className="mono text-xs text-ink">ENDING TONIGHT</span>
        </div>
      )}

      <section className="grid gap-px border border-rule bg-rule md:grid-cols-2">
        {SIDES.map(({ who, points }) => (
          <Card key={who} className="flex flex-col gap-4">
            <p className="eyebrow">For {who.toLowerCase()}</p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{who}</h2>
            <ul className="flex flex-col gap-2">
              {points.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-[28px] font-bold md:text-[40px]">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
          {STEPS.map(({ icon, text }, i) => (
            <li key={text} className="flex items-center gap-4 border border-rule bg-surface p-5 md:flex-col md:items-start">
              <span className="mono text-sm font-bold text-loss" aria-hidden>0{i + 1}</span>
              <span className="font-bold">{text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <blockquote className="border-l-4 border-action bg-surface p-6">
          <p className="text-2xl font-bold md:text-3xl">Good food should not become a spreadsheet problem.</p>
          <footer className="mono mt-3 text-xs text-ink">THE IDEA / COLLEGE AVE</footer>
        </blockquote>
      </section>

      <footer className="flex flex-col gap-6 bg-ink p-6 text-paper md:p-10">
        <p className="eyebrow text-paper">Keep the neighborhood moving</p>
        <h2 className="text-3xl font-bold md:text-5xl">Hungry or cooking?</h2>
        <Doors dark />
        <p className="mono text-xs text-paper">BUILT FOR COLLEGE AVE / STATE COLLEGE</p>
      </footer>
    </div>
  );
}
