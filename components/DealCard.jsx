"use client";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button, Money } from "@/components/ui";

const clock = (t) => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// Presentational: the page owns claim state and the fetch. d = { restaurantName, dishName, normalPrice, dealPrice, qtyLeft, expiresAt }
export default function DealCard({ d, claimed = false, soldOut = false, onClaim }) {
  const reduce = useReducedMotion();
  const prev = useRef(d.qtyLeft);
  const changed = prev.current !== d.qtyLeft;
  useEffect(() => { prev.current = d.qtyLeft; });

  const gone = soldOut || d.qtyLeft <= 0 || new Date(d.expiresAt) <= Date.now();
  const dead = gone && !claimed;

  return (
    <article className={`overflow-hidden border-2 border-ink bg-surface ${dead ? "opacity-60" : ""}`}>
      <div className="relative flex min-h-36 items-end bg-ink p-5">
        <span aria-hidden className="absolute -right-2 -top-4 text-[8rem] font-bold leading-none text-paper/15">{d.dishName.charAt(0)}</span>
        <p className="relative text-3xl font-bold leading-tight tracking-tight text-paper">{d.restaurantName}</p>
      </div>
      {claimed ? (
        <div className="p-5">
          <p className="text-2xl font-bold">You&apos;re in. Show this screen at the counter.</p>
          <p className="mt-3 flex items-baseline justify-between gap-3">
            <span className="font-bold">{d.dishName}</span>
            <Money cents={d.dealPrice} className="num-key" />
          </p>
        </div>
      ) : (
        <div className="p-5">
          <h2 className="text-2xl font-bold leading-tight">{d.dishName}</h2>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-ink/70">{dead ? "Gone for tonight" : `Pickup until ${clock(d.expiresAt)}`}</p>
            <motion.span key={d.qtyLeft} initial={changed && !reduce ? { scale: 1.3 } : false} animate={{ scale: 1 }}
              className="shrink-0 rounded-full border-2 border-ink px-3 py-1 text-base font-bold">{d.qtyLeft} left</motion.span>
          </div>
          <p className="mt-4 flex items-baseline justify-end gap-3">
            <Money cents={d.normalPrice} className="text-ink/70 line-through" />
            <Money cents={d.dealPrice} className="num-key" />
          </p>
          <Button onClick={onClaim} disabled={dead} className="mt-4 md:w-full">{dead ? "Sold out" : "Claim"}</Button>
        </div>
      )}
    </article>
  );
}
