"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { TO_BASE } from "@/lib/cost";

const UNITS = Object.keys(TO_BASE);
const SHOW_PER = { g: "lb", ml: "gal", each: "each" };
const perUnit = (cents, base) => `$${((cents * TO_BASE[SHOW_PER[base]]) / 100).toFixed(2)}/${SHOW_PER[base]}`;
const blankLine = { description: "", ingredient: null, packCount: "", packSize: "", packUnit: "lb", linePrice: "" };
const input = "min-h-11 w-full rounded-lg border-2 border-navy/20 bg-white px-2 text-base";
const outline = "min-h-14 rounded-xl border-2 border-navy px-6 text-lg font-bold";

export default function Page({ params }) {
  const { id } = use(params);
  const [inv, setInv] = useState(null); // { vendor, date (YYYY-MM-DD), lines }
  const [ingredients, setIngredients] = useState([]);
  const [busy, setBusy] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      const [r, g] = await Promise.all([fetch(`/api/invoices/${id}`, { cache: "no-store" }), fetch("/api/ingredients", { cache: "no-store" })]);
      if (r.status === 401) return void (window.location.href = "/login");
      if (!r.ok) return setError("Invoice not found.");
      const d = await r.json();
      setInv({ vendor: d.vendor, date: d.date.slice(0, 10), lines: d.lines });
      setIngredients(await g.json());
    })().catch(() => setError("Could not load this invoice."));
  }, [id]);
  const unitOf = Object.fromEntries(ingredients.map((i) => [i.name, i.unit]));

  const edit = (i, key, value) => setInv((v) => ({ ...v, lines: v.lines.map((l, j) => (j === i ? { ...l, [key]: value } : l)) }));

  async function save() {
    setBusy("saving"); setError(null);
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inv) });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch { setError("Save failed. Try again."); }
    setBusy("");
  }

  async function remove() {
    setBusy("deleting"); setError(null);
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    if (res.ok) window.location.href = "/owner/invoices";
    else { setError("Delete failed. Try again."); setBusy(""); }
  }

  return (
    <div className="space-y-6">
      <Link href="/owner/invoices" className="inline-flex min-h-11 items-center text-lg font-bold underline">← All invoices</Link>
      <h1 className="font-display text-3xl md:text-5xl">Invoice</h1>
      {error && <p className="rounded-lg bg-loss px-4 py-3 font-bold text-white" role="alert">{error}</p>}
      {inv && (
        <Card className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block font-bold">Vendor
              <input className={`${input} mt-1 min-h-14 text-xl`} value={inv.vendor} onChange={(e) => setInv((v) => ({ ...v, vendor: e.target.value }))} />
            </label>
            <label className="block font-bold">Invoice date
              <input type="date" required className={`${input} mt-1 min-h-14 text-xl`} value={inv.date} onChange={(e) => setInv((v) => ({ ...v, date: e.target.value }))} />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-base">
              <thead>
                <tr className="border-b-2 border-navy">
                  {["Ingredient", "Packs", "Size", "Unit", "Price ($)", ""].map((h, i) => <th key={i} className="px-1 py-2 font-bold">{h || <span className="sr-only">Remove</span>}</th>)}
                </tr>
              </thead>
              <tbody>
                {inv.lines.map((l, i) => (
                  <tr key={i} className="border-b border-navy/10 align-top">
                    <td className="px-1 py-2">
                      <select className={input} value={l.ingredient ?? ""} onChange={(e) => edit(i, "ingredient", e.target.value || null)} aria-label="Ingredient">
                        <option value="">— not tracked —</option>
                        {ingredients.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
                      </select>
                      {l.description && <span className="mt-1 block text-base opacity-70">{l.description}</span>}
                    </td>
                    <td className="w-20 px-1 py-2"><input className={input} type="number" min="0" step="any" value={l.packCount ?? ""} onChange={(e) => edit(i, "packCount", e.target.value)} aria-label="Pack count" /></td>
                    <td className="w-24 px-1 py-2"><input className={input} type="number" min="0" step="any" value={l.packSize ?? ""} onChange={(e) => edit(i, "packSize", e.target.value)} aria-label="Pack size" /></td>
                    <td className="w-24 px-1 py-2">
                      <select className={input} value={l.packUnit ?? ""} onChange={(e) => edit(i, "packUnit", e.target.value)} aria-label="Unit">
                        {UNITS.map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="w-28 px-1 py-2"><input className={input} type="number" min="0" step="0.01" value={l.linePrice ?? ""} onChange={(e) => edit(i, "linePrice", e.target.value)} aria-label="Line price in dollars" /></td>
                    <td className="px-1 py-2">
                      <button type="button" className="min-h-11 rounded-lg border-2 border-loss px-3 font-bold text-loss" onClick={() => setInv((v) => ({ ...v, lines: v.lines.filter((_, j) => j !== i) }))}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <Button onClick={save} disabled={!!busy}>{busy === "saving" ? "Saving…" : "Save changes"}</Button>
            <button type="button" className={outline} onClick={() => setInv((v) => ({ ...v, lines: [...v.lines, { ...blankLine }] }))}>Add line</button>
          </div>
        </Card>
      )}

      {result && (
        <Card className="space-y-3">
          <h2 className="font-display text-2xl md:text-3xl">Saved. Costs now:</h2>
          <ul className="space-y-2">
            {result.updated.map((u) => {
              const up = u.newCost > u.oldCost, same = u.newCost === u.oldCost, base = unitOf[u.ingredient] ?? "g";
              return (
                <li key={u.ingredient} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-navy/10 py-2">
                  <span className="font-bold">{u.ingredient}</span>
                  <span>
                    {perUnit(u.oldCost, base)} →{" "}
                    <span className={`text-xl font-bold ${same ? "" : up ? "text-loss" : "text-margin"}`}>
                      {perUnit(u.newCost, base)} {same ? "no change" : up ? "▲ up" : "▼ down"}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          {result.skipped.length > 0 && (
            <ul className="list-disc pl-6 text-base">
              {result.skipped.map((s, i) => <li key={i}><span className="font-bold">{s.description || "(no description)"}</span>: {s.reason}</li>)}
            </ul>
          )}
        </Card>
      )}

      {inv && (confirming ? (
        <Card className="space-y-3">
          <p className="text-xl font-bold">Delete this invoice? Its prices come off your ingredient costs.</p>
          <div className="flex flex-col gap-3 md:flex-row">
            <button type="button" disabled={!!busy} className="min-h-14 rounded-xl bg-loss px-6 text-lg font-bold text-white disabled:opacity-50" onClick={remove}>
              {busy === "deleting" ? "Deleting…" : "Yes, delete it"}
            </button>
            <button type="button" className={outline} onClick={() => setConfirming(false)}>Keep it</button>
          </div>
        </Card>
      ) : (
        <button type="button" className={`${outline} border-loss text-loss`} onClick={() => setConfirming(true)}>Delete invoice</button>
      ))}
    </div>
  );
}
