"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import DealDrop from "@/components/landing/DealDrop";
import InvoiceToPlate from "@/components/landing/InvoiceToPlate";

const door = "flex h-16 w-full items-center justify-center border-2 px-8 text-xl font-bold md:w-auto";

function Doors({ dark }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <Link href="/deals" className={`${door} border-ink bg-action text-ink hover:-translate-y-0.5`}>I&apos;m hungry</Link>
      <Link href="/owner" className={`${door} ${dark ? "border-paper text-paper hover:bg-paper hover:text-ink" : "border-ink bg-paper text-ink hover:bg-ink hover:text-paper"}`}>I run a restaurant</Link>
    </div>
  );
}

const CLAIM_STEPS = ["See a deal drop near you.", "Tap Claim. No app, no account.", "Show the screen at the counter."];

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
      <section className="grid gap-10 pt-4 md:grid-cols-[1fr_300px] md:items-center md:gap-12 md:pt-8">
        <div className="flex min-w-0 flex-col gap-6">
          <h1 className="text-[40px] font-bold leading-[1.05] tracking-tight md:text-[72px]">Keep College Ave cooking.</h1>
          <p className="text-xl text-ink/75">Know what every plate costs. Move tonight&apos;s leftovers to hungry students.</p>
          <Doors />
        </div>
        <DealDrop />
      </section>

      {count && (
        <div className="flex items-center justify-between gap-4 border-y-2 border-ink py-4 text-xl font-bold md:text-2xl">
          <span><span>Live now:</span> {count} {count === 1 ? "deal" : "deals"} downtown</span>
          <span className="mono text-base text-ink">ENDING TONIGHT</span>
        </div>
      )}

      <section className="flex flex-col gap-6">
        <h2 className="text-[28px] font-bold md:text-[40px]">How it works</h2>
        <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1.4fr)_auto_minmax(0,1fr)]">
          <Card className="flex min-w-0 flex-col gap-4">
            <h3 className="text-2xl font-bold">For owners</h3>
            <p>Snap the invoice and every plate&apos;s cost updates itself.</p>
            <InvoiceToPlate />
          </Card>
          <p className="flex items-center justify-center gap-3 py-2 text-center font-bold md:max-w-32 md:flex-col">
            <span aria-hidden className="text-4xl leading-none"><span className="md:hidden">↓</span><span className="hidden md:inline">→</span></span>
            leftovers become a deal
          </p>
          <Card className="flex min-w-0 flex-col gap-4">
            <h3 className="text-2xl font-bold">For students</h3>
            <p>Good food from spots you love, for less, tonight.</p>
            <ol className="flex flex-col gap-3">
              {CLAIM_STEPS.map((t, i) => (
                <li key={t} className="flex gap-3 font-bold">
                  <span className="mono text-ink/60" aria-hidden>{i + 1}</span>{t}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </section>

      <section>
        <blockquote className="border-l-4 border-action bg-surface p-6">
          <p className="text-2xl font-bold md:text-3xl">Good food should not become a spreadsheet problem.</p>
          <footer className="mono mt-3 text-base text-ink">THE IDEA / COLLEGE AVE</footer>
        </blockquote>
      </section>

      <footer className="flex flex-col gap-6 bg-ink p-6 text-paper md:p-10">
        <h2 className="text-3xl font-bold md:text-5xl">Hungry or cooking?</h2>
        <Doors dark />
      </footer>
    </div>
  );
}
