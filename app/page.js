"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui";

const door = "flex min-h-14 w-full items-center justify-center rounded-xl px-6 text-xl font-bold md:min-h-16 md:w-auto";

function Doors({ dark }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <Link href="/deals" className={`${door} bg-deal text-navy`}>I&apos;m hungry</Link>
      <Link href="/owner" className={`${door} border-4 ${dark ? "border-offwhite text-offwhite" : "border-navy text-navy"}`}>I run a restaurant</Link>
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
    <div className="flex flex-col gap-12 md:gap-16">
      <section className="flex flex-col gap-6 pt-4 md:pt-10">
        <h1 className="font-display text-[40px] leading-[1.05] md:text-7xl">Keep College Ave cooking.</h1>
        <p className="max-w-3xl">
          We show State College restaurants what every plate really costs, and turn tonight&apos;s leftovers into deals for you.
        </p>
        <Doors />
      </section>

      {count && (
        <div className="rounded-2xl bg-navy px-5 py-4 text-xl font-bold text-offwhite md:text-2xl">
          <span className="text-deal">Live now:</span> {count} {count === 1 ? "deal" : "deals"} downtown, ending tonight
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 md:gap-6">
        {SIDES.map(({ who, points }) => (
          <Card key={who} className="flex flex-col gap-3">
            <h2 className="text-[28px] font-bold md:text-[40px]">{who}</h2>
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
            <li key={text} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow md:flex-col md:items-start">
              <span className="text-4xl" aria-hidden>{icon}</span>
              <span className="font-bold"><span className="font-display text-navy">{i + 1}.</span> {text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <blockquote className="rounded-2xl border-l-8 border-deal bg-white p-6 shadow">
          <p className="text-2xl font-bold md:text-3xl">“[Quote from today&apos;s visit]”</p>
          <footer className="mt-3">[Owner], [Restaurant], [Street]</footer>
        </blockquote>
      </section>

      <footer className="flex flex-col gap-6 rounded-2xl bg-navy p-6 text-offwhite md:p-10">
        <h2 className="font-display text-[28px] md:text-[40px]">Hungry or cooking?</h2>
        <Doors dark />
        <p className="text-base">Built in 3 hours at c0mpiled-15, State College</p>
      </footer>
    </div>
  );
}
