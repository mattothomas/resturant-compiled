"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { TO_BASE } from "@/lib/cost";

const SHOW_PER = { g: "lb", ml: "gal", each: "each" };
const PACK_UNITS = { g: ["lb", "oz", "kg", "g"], ml: ["gal", "l", "fl oz", "ml"], each: ["each"] };
const perUnit = (cents, base) => `$${((cents * TO_BASE[SHOW_PER[base]]) / 100).toFixed(2)}/${SHOW_PER[base]}`;
const input = "min-h-11 w-full rounded-lg border-2 border-navy/20 bg-white px-2 text-base";
const outline = "min-h-14 rounded-xl border-2 border-navy px-6 text-lg font-bold";

const post = (url, method, body) => fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

function EditPrice({ ing, onDone }) {
  const [f, setF] = useState({ linePrice: "", packCount: "1", packSize: "", packUnit: PACK_UNITS[ing.unit][0] });
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  async function save(e) {
    e.preventDefault(); setError(null);
    const res = await post(`/api/ingredients/${ing._id}`, "PUT", f);
    if (res.ok) onDone(); else setError((await res.json()).error || "Save failed");
  }
  return (
    <form onSubmit={save} className="mt-3 space-y-3 border-t border-navy/10 pt-3">
      <p className="font-bold">What did one pack cost? (e.g. $34 for 1 pack of 10 lb)</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <label className="font-bold">Price ($)<input className={input} type="number" min="0" step="0.01" required value={f.linePrice} onChange={set("linePrice")} /></label>
        <label className="font-bold">Packs<input className={input} type="number" min="0" step="any" required value={f.packCount} onChange={set("packCount")} /></label>
        <label className="font-bold">Size<input className={input} type="number" min="0" step="any" required value={f.packSize} onChange={set("packSize")} /></label>
        <label className="font-bold">Unit
          <select className={input} value={f.packUnit} onChange={set("packUnit")}>{PACK_UNITS[ing.unit].map((u) => <option key={u}>{u}</option>)}</select>
        </label>
      </div>
      {error && <p className="rounded-lg bg-loss px-4 py-3 font-bold text-white" role="alert">{error}</p>}
      <div className="flex flex-col gap-3 md:flex-row">
        <Button type="submit">Save price</Button>
        <button type="button" className={outline} onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}

export default function Page() {
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null);
  const [add, setAdd] = useState({ name: "", unit: "g" });
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/ingredients", { cache: "no-store" });
    if (res.status === 401) return void (window.location.href = "/login");
    setRows(await res.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(e) {
    e.preventDefault(); setError(null);
    const res = await post("/api/ingredients", "POST", add);
    if (res.ok) { setAdd({ name: "", unit: "g" }); load(); } else setError((await res.json()).error || "Could not add");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl md:text-5xl">Ingredients</h1>
      <Card>
        <form onSubmit={create} className="grid gap-3 md:grid-cols-[1fr_10rem_auto] md:items-end">
          <label className="font-bold">New ingredient
            <input className={`${input} min-h-14 text-xl`} required value={add.name} onChange={(e) => setAdd((a) => ({ ...a, name: e.target.value }))} />
          </label>
          <label className="font-bold">Counted in
            <select className={`${input} min-h-14 text-xl`} value={add.unit} onChange={(e) => setAdd((a) => ({ ...a, unit: e.target.value }))}>
              <option value="g">g (weight)</option><option value="ml">ml (liquid)</option><option value="each">each</option>
            </select>
          </label>
          <Button type="submit">Add ingredient</Button>
        </form>
        {error && <p className="mt-3 rounded-lg bg-loss px-4 py-3 font-bold text-white" role="alert">{error}</p>}
      </Card>
      {rows && !rows.length && <p className="text-lg">No ingredients yet.</p>}
      <ul className="space-y-3">
        {rows?.map((i) => (
          <li key={i._id}>
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xl font-bold">{i.name}</p>
                  <p className="text-base">
                    {i.source.type === "invoice"
                      ? <>From <Link className="underline" href={`/owner/invoices/${i.source.invoiceId}`}>{i.source.vendor || "invoice"}</Link> · {i.source.date.slice(0, 10)}</>
                      : "Manual"}
                  </p>
                </div>
                <span className="text-3xl font-bold md:text-4xl">{perUnit(i.costPerUnit, i.unit)}</span>
                <button type="button" className={`${outline} w-full md:w-auto`} onClick={() => setEditing(editing === i._id ? null : i._id)}>Edit price</button>
              </div>
              {editing === i._id && <EditPrice ing={i} onDone={() => { setEditing(null); load(); }} />}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
