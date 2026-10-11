"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const usd = (cents) => `$${(cents / 100).toFixed(2)}`;

const NOTES = [
  { number: "01", title: "See what is hot", body: "Live deals from the places you already know, while they are still worth crossing town for." },
  { number: "02", title: "Keep the kitchen honest", body: "Owners see the actual cost behind every plate before a bad margin becomes a bad month." },
  { number: "03", title: "Give good food a second shift", body: "A slower dinner service becomes a reason for somebody nearby to walk through the door." },
];

export default function AlternateHome() {
  const [deals, setDeals] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch("/api/deals", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => Array.isArray(data) && setDeals(data.filter((deal) => deal.qtyLeft > 0)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (deals.length < 2) return undefined;
    const timer = setInterval(() => setActive((index) => (index + 1) % deals.length), 5000);
    return () => clearInterval(timer);
  }, [deals.length]);

  const featured = deals[active];

  return (
    <div className="-mx-5 -mt-8 overflow-hidden bg-[#eee8db] md:-mx-8 md:-mt-12">
      <section className="relative min-h-[680px] overflow-hidden bg-[#191c18] text-[#f5f0e5]">
        <img
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=2200&q=85"
          alt="A fresh pizza coming out of a restaurant oven"
          className="absolute inset-0 size-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[#191c18]/45" />
        <div className="relative mx-auto flex min-h-[680px] max-w-6xl flex-col justify-between px-5 py-6 md:px-8 md:py-8">
          <div className="max-w-4xl pb-4 md:pb-10">
            <p className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-[#e5b83e]">The neighborhood is still open</p>
            <h1 className="mt-5 max-w-4xl text-6xl font-bold leading-[0.9] tracking-[-0.04em] md:text-9xl">Good food has another hour in it.</h1>
            <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center">
              <Link href="/deals" className="inline-flex min-h-14 items-center justify-center bg-[#e5b83e] px-6 text-lg font-bold text-[#191c18] hover:-translate-y-1">Find dinner nearby</Link>
              <p className="max-w-sm text-lg leading-snug text-[#f5f0e5]">A live board for State College restaurants, students, and the food that should not go to waste.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-[#191c18] bg-[#e5b83e] px-5 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 font-mono text-sm font-bold uppercase tracking-[0.08em]">
          <span><span className="text-[#a63e34]">Live board</span> / {deals.length || "No"} {deals.length === 1 ? "deal" : "deals"} right now</span>
          <span className="hidden md:inline">Updated every two seconds</span>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[0.75fr_1.25fr] md:px-8 md:py-24">
        <div>
          <p className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-[#a63e34]">Tonight&apos;s board</p>
          <h2 className="mt-4 text-5xl font-bold leading-[0.95] tracking-[-0.03em] md:text-7xl">The good stuff, while it lasts.</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#191c18]/75">Not a marketplace. Not a coupon maze. Just a short list of food that needs a person nearby.</p>
          <Link href="/deals" className="mt-8 inline-flex min-h-12 items-center border-b-2 border-[#191c18] px-1 text-base font-bold hover:border-[#a63e34] hover:text-[#a63e34]">Open the whole board <span className="ml-3" aria-hidden>↗</span></Link>
        </div>

        <div className="relative min-h-[330px] bg-[#191c18] p-6 text-[#f5f0e5] md:p-8">
          <div className="flex items-start justify-between border-b border-[#f5f0e5]/35 pb-5 font-mono text-sm uppercase tracking-[0.08em]">
            <span>{featured ? "Now serving" : "Coming soon"}</span>
            <span>{String(active + 1).padStart(2, "0")} / {String(Math.max(deals.length, 1)).padStart(2, "0")}</span>
          </div>
          {featured ? (
            <motion.div key={featured._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pt-10">
              <p className="font-mono text-sm uppercase tracking-[0.08em] text-[#e5b83e]">{featured.restaurantName || "College Ave kitchen"}</p>
              <h3 className="mt-3 text-4xl font-bold leading-none md:text-6xl">{featured.dishName}</h3>
              <div className="mt-8 flex items-end justify-between gap-4">
                <div><span className="text-5xl font-bold">{usd(featured.dealPrice)}</span><span className="ml-3 font-mono text-sm text-[#f5f0e5]/70 line-through">{usd(featured.normalPrice)}</span></div>
                <span className="font-mono text-sm text-[#e5b83e]">{featured.qtyLeft} LEFT</span>
              </div>
              <Link href="/deals" className="mt-8 inline-flex min-h-12 items-center border-2 border-[#f5f0e5] px-5 font-bold hover:bg-[#f5f0e5] hover:text-[#191c18]">Claim this one</Link>
            </motion.div>
          ) : (
            <div className="flex min-h-[230px] items-end"><p className="max-w-sm text-3xl font-bold leading-tight">The board is quiet. Check back when dinner slows down.</p></div>
          )}
        </div>
      </section>

      <section className="border-y border-[#191c18]/20 bg-[#f7f3ea]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="mb-10 flex items-end justify-between gap-5"><div><p className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-[#a63e34]">A small system with a real point</p><h2 className="mt-3 text-4xl font-bold tracking-[-0.03em] md:text-6xl">Less waste. More neighborhood.</h2></div><span className="hidden font-mono text-sm md:inline">HOW IT WORKS / 2026</span></div>
          <div className="grid gap-px border border-[#191c18]/20 bg-[#191c18]/20 md:grid-cols-3">
            {NOTES.map((note, index) => <motion.article key={note.number} whileHover={{ y: -5 }} className="bg-[#f7f3ea] p-6 md:min-h-[270px] md:p-8"><span className="font-mono text-sm font-bold text-[#a63e34]">{note.number}</span><h3 className="mt-14 text-2xl font-bold leading-tight">{note.title}</h3><p className="mt-4 text-base leading-relaxed text-[#191c18]/75">{note.body}</p></motion.article>)}
          </div>
        </div>
      </section>

      <footer className="bg-[#191c18] px-5 py-12 text-[#f5f0e5] md:px-8 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="font-mono text-sm uppercase tracking-[0.12em] text-[#e5b83e]">Keep College Ave cooking</p><p className="mt-4 max-w-lg text-3xl font-bold leading-tight md:text-5xl">The best version of tonight is usually closer than you think.</p></div><Link href="/owner" className="inline-flex min-h-12 items-center border-2 border-[#f5f0e5] px-5 font-bold hover:bg-[#f5f0e5] hover:text-[#191c18]">I run a restaurant</Link></div>
      </footer>
    </div>
  );
}
