"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useRef, useState } from "react";

const LINES = [
  ["CHICKEN WINGS JUMBO 4/10LB", "$136.00", "chicken wings"],
  ["CHEESE MOZZARELLA 4/5LB", "$80.00", "mozzarella"],
  ["FLOUR ALL PURP 1/50LB", "$30.00", "flour"],
  ["SAUCE TOMATO & FANCY 6/105OZ", "$29.76", "tomato sauce"],
  ["SAUCE HOT CAYENNE PEPPER 4/1GAL", "$48.00", "hot sauce"],
  ["CELERY STALK FRESH 1/30LB", "$45.00", "celery"],
];

const STAGES = ["Upload", "Read", "Decide"];

export default function DemoPage() {
  const inputRef = useRef(null);
  const [stage, setStage] = useState(0);
  const [fileName, setFileName] = useState("");
  const [inventory, setInventory] = useState(false);

  function start(file) {
    setFileName(file?.name || "keystone-invoice-0048213.png");
    setStage(1);
    window.setTimeout(() => setStage(2), 1400);
  }

  return (
    <div className="-mx-5 -mt-8 min-h-screen overflow-hidden bg-[#eee8db] md:-mx-8 md:-mt-12">
      <section className="bg-[#191c18] px-5 py-12 text-[#f5f0e5] md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Link href="/home-2" className="font-mono text-sm uppercase tracking-[0.12em] text-[#e5b83e]">← Back to the neighborhood board</Link>
          <div className="mt-16 grid gap-10 md:grid-cols-[1fr_0.7fr] md:items-end">
            <div><p className="font-mono text-sm uppercase tracking-[0.12em] text-[#e5b83e]">A product walkthrough / owner desk</p><h1 className="mt-5 max-w-4xl text-6xl font-bold leading-[0.9] tracking-[-0.04em] md:text-8xl">Your invoice is trying to tell you something.</h1></div>
            <p className="max-w-sm text-xl leading-relaxed text-[#f5f0e5]/75">Upload the paper. Get the decision. Before the wing rush gets expensive.</p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
        <div className="mb-10 flex items-center gap-1 border-b border-[#191c18]/20 pb-4">
          {STAGES.map((label, index) => <div key={label} className="flex flex-1 items-center gap-3"><span className={`grid size-9 place-items-center border-2 text-sm font-bold ${stage >= index ? "border-[#a63e34] bg-[#a63e34] text-[#f5f0e5]" : "border-[#191c18]/25 text-[#191c18]/45"}`}>0{index + 1}</span><span className={`font-mono text-sm uppercase tracking-[0.08em] ${stage >= index ? "" : "text-[#191c18]/45"}`}>{label}</span>{index < 2 && <span className="hidden h-px flex-1 bg-[#191c18]/20 md:block" />}</div>)}
        </div>

        <section className="grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
          <div className="border border-[#191c18]/20 bg-[#f7f3ea] p-6 md:p-8">
            <p className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-[#a63e34]">01 / Upload</p>
            <h2 className="mt-4 text-4xl font-bold leading-none">Give us the paper.</h2>
            <p className="mt-5 text-lg leading-relaxed text-[#191c18]/70">A phone photo is enough. The owner does not need to type seven line items into a spreadsheet.</p>
            <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(event) => start(event.target.files?.[0])} />
            <button onClick={() => inputRef.current?.click()} className="mt-8 min-h-14 w-full border-2 border-[#191c18] bg-[#e5b83e] px-5 text-lg font-bold hover:-translate-y-0.5">{fileName || "Upload the invoice"}</button>
            <button onClick={() => start()} className="mt-4 min-h-12 w-full border-b-2 border-[#191c18] px-5 text-base font-bold">Use the Keystone demo invoice</button>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.08em] text-[#191c18]/55">Image, PDF, or camera photo / owner account required for live OCR</p>
          </div>

          <div className="border border-[#191c18]/20 bg-[#f7f3ea] p-6 md:p-8">
            <div className="flex items-start justify-between gap-5 border-b border-[#191c18]/20 pb-5"><div><p className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-[#a63e34]">{stage === 0 ? "Invoice preview" : stage === 1 ? "Reading the invoice" : "OCR complete"}</p><h2 className="mt-2 text-3xl font-bold">Keystone Foodservice Distributors</h2></div><span className="font-mono text-sm">#0048213</span></div>
            <div className="mt-6 space-y-3">
              {LINES.map(([description, price, ingredient], index) => <motion.div key={description} initial={{ opacity: 0.35 }} animate={{ opacity: stage >= 1 ? 1 : 0.55 }} transition={{ delay: stage === 1 ? index * 0.12 : 0 }} className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#191c18]/10 pb-3 font-mono text-sm"><span>{description}<small className={`ml-2 font-sans text-xs ${stage >= 2 ? "text-[#256553]" : "text-[#191c18]/40"}`}>{stage >= 2 ? `→ ${ingredient}` : "waiting"}</small></span><span>{price}</span></motion.div>)}
            </div>
            <div className="mt-6 flex justify-between border-t-2 border-[#191c18] pt-4 font-mono font-bold"><span>INVOICE TOTAL</span><span>$393.26</span></div>
            {stage === 1 && <div className="mt-7"><div className="h-2 overflow-hidden bg-[#191c18]/10"><motion.div className="h-full bg-[#a63e34]" initial={{ width: "0%" }} animate={{ width: "85%" }} transition={{ duration: 1.2 }} /></div><p className="mt-3 font-mono text-sm uppercase tracking-[0.08em]">Matching ingredients and pack sizes…</p></div>}
          </div>
        </section>

        {stage === 0 && <div className="mt-10 border-l-4 border-[#e5b83e] bg-[#f7f3ea] p-6 text-xl font-bold md:p-8">The magic is not “AI read a receipt.” The magic is what the owner can do next.</div>}

        {stage >= 2 && <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mt-10 space-y-8">
          <div className="border-y-2 border-[#191c18] py-8"><p className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-[#a63e34]">02 / Decision</p><h2 className="mt-3 max-w-4xl text-5xl font-bold leading-[0.95] tracking-[-0.03em] md:text-7xl">The wings are no longer a $5 problem. They are a margin problem.</h2><p className="mt-5 max-w-2xl text-xl leading-relaxed text-[#191c18]/70">Four 10-pound packs cost $136. That puts the chicken at $3.40/lb and the Buffalo Wings plate at about $4.22 before labor, rent, and the sauce.</p></div>
          <div className="grid gap-3 md:grid-cols-3">
            <Insight label="Plate cost" value="$4.22" detail="current ingredient cost" tone="dark" />
            <Insight label="At $5.00" value="84%" detail="food cost / too thin" tone="loss" />
            <Insight label="Target price" value="$12.25" detail="35% food-cost target" tone="action" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="border-2 border-[#a63e34] bg-[#a63e34] p-6 text-[#f5f0e5] md:p-8"><p className="font-mono text-sm uppercase tracking-[0.08em]">Blocked recommendation</p><p className="mt-5 text-4xl font-bold">$3.50 deal</p><p className="mt-3 text-lg">No. That loses about $0.72 on every plate before labor. The system should stop the owner from calling a loss a deal.</p></div>
            <div className="border-2 border-[#191c18] bg-[#e5b83e] p-6 md:p-8"><p className="font-mono text-sm uppercase tracking-[0.08em]">Safer move</p><p className="mt-5 text-4xl font-bold">Raise price or switch the feature.</p><p className="mt-3 text-lg">Price the wings at $12.25 for the target margin, or discount a different dish whose cost can actually carry the traffic.</p></div>
          </div>
        </motion.section>}

        <section className="mt-16 border border-[#191c18]/20 bg-[#191c18] p-6 text-[#f5f0e5] md:p-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="font-mono text-sm uppercase tracking-[0.12em] text-[#e5b83e]">03 / The stretch</p><h2 className="mt-3 max-w-2xl text-4xl font-bold leading-none md:text-6xl">Point the phone at the prep bin before the rush.</h2><p className="mt-5 max-w-xl text-lg leading-relaxed text-[#f5f0e5]/70">Future capability: a camera estimate of on-hand inventory, matched to the rush forecast and the owner&apos;s menu economics.</p></div><button onClick={() => setInventory((value) => !value)} className="min-h-12 border-2 border-[#f5f0e5] px-5 font-bold hover:bg-[#f5f0e5] hover:text-[#191c18]">{inventory ? "Hide concept" : "See the concept"}</button></div>
          {inventory && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-10 grid gap-px border border-[#f5f0e5]/30 bg-[#f5f0e5]/30 md:grid-cols-3"><InventoryStat label="Camera estimate" value="2.4 lb" detail="wings on hand" /><InventoryStat label="Friday rush forecast" value="8.0 lb" detail="expected demand" /><InventoryStat label="Action" value="Buy 5.6 lb" detail="or feature a different plate" /></motion.div>}
        </section>
      </main>
    </div>
  );
}

function Insight({ label, value, detail, tone }) {
  const styles = { dark: "bg-[#191c18] text-[#f5f0e5]", loss: "bg-[#f7f3ea] border-2 border-[#a63e34] text-[#a63e34]", action: "bg-[#e5b83e] text-[#191c18]" };
  return <div className={`p-5 md:p-6 ${styles[tone]}`}><p className="font-mono text-sm uppercase tracking-[0.08em]">{label}</p><p className="mt-5 text-4xl font-bold">{value}</p><p className="mt-2 text-base opacity-75">{detail}</p></div>;
}

function InventoryStat({ label, value, detail }) {
  return <div className="bg-[#191c18] p-5 md:p-6"><p className="font-mono text-sm uppercase tracking-[0.08em] text-[#e5b83e]">{label}</p><p className="mt-4 text-3xl font-bold">{value}</p><p className="mt-2 text-base text-[#f5f0e5]/65">{detail}</p></div>;
}
