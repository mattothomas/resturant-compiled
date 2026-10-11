"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Card } from "@/components/ui";
import { TO_BASE } from "@/lib/cost";

const UNITS = Object.keys(TO_BASE);
// show cents-per-base-unit the way an owner thinks about it
const SHOW_PER = { g: "lb", ml: "gal", each: "each" };
const perUnit = (cents, base) => `$${((cents * TO_BASE[SHOW_PER[base]]) / 100).toFixed(2)}/${SHOW_PER[base]}`;

const blankLine = { description: "", ingredient: null, packCount: "", packSize: "", packUnit: "lb", linePrice: "" };

// phone photos can blow past Vercel's ~4.5 MB body limit
async function shrink(file) {
  if (file.type === "application/pdf") return file;
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / img.width);
  const c = Object.assign(document.createElement("canvas"),
    { width: img.width * scale, height: img.height * scale });
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return new Promise((r) => c.toBlob(
    (b) => r(new File([b], "invoice.jpg", { type: "image/jpeg" })), "image/jpeg", 0.85));
}

const input = "min-h-11 w-full border border-rule bg-white px-2 text-sm";

export default function InvoiceUpload({ onSaved }) {
  const fileRef = useRef(null);
  const [ingredients, setIngredients] = useState([]);
  const [lines, setLines] = useState(null);
  const [busy, setBusy] = useState(""); // "" | "reading" | "saving"
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch("/api/ingredients", { cache: "no-store" }).then((r) => r.json()).then(setIngredients).catch(() => {});
  }, []);
  const unitOf = Object.fromEntries(ingredients.map((i) => [i.name, i.unit]));

  async function upload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("reading"); setError(null); setRaw(""); setResult(null); setLines(null);
    try {
      const body = new FormData();
      body.append("file", await shrink(file));
      const res = await fetch("/api/invoice", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        setRaw(data.raw || "");
        if (data.raw) setLines([{ ...blankLine }]); // type it in by hand
      } else {
        setLines(data.lines.map((l) => ({ ...blankLine, ...l })));
      }
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setBusy("");
    }
  }

  const edit = (i, key, value) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [key]: value } : l)));

  async function save() {
    setBusy("saving"); setError(null);
    try {
      const res = await fetch("/api/invoice/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json());
      setLines(null);
      setRaw("");
      onSaved?.();
    } catch {
      setError("Save failed. Try again.");
    } finally {
      setBusy("");
    }
  }

  return (
    <Card className="space-y-5">
      <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={upload} />
      <Button onClick={() => fileRef.current.click()} disabled={!!busy}>
        {busy === "reading" ? "Reading invoice…" : "Upload invoice"}
      </Button>
      {busy === "reading" && (
        <p className="mono text-xs text-ink" role="status">READING EVERY LINE / ABOUT 20 SECONDS</p>
      )}

      {error && <p className="rounded-lg bg-loss px-4 py-3 font-bold text-white" role="alert">{error}</p>}
      {raw && (
        <details className="text-base">
          <summary className="cursor-pointer font-bold">What the AI saw (type the numbers below)</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap border border-rule bg-paper p-3 text-sm">{raw}</pre>
        </details>
      )}

      {lines && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl md:text-3xl">Check the lines, then save</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-ink">
                  {["Description", "Ingredient", "Packs", "Size", "Unit", "Price ($)"].map((h) => (
                    <th key={h} className="px-1 py-2 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i} className="border-b border-rule align-top">
                    <td className="px-1 py-2"><input className={input} value={l.description ?? ""} onChange={(e) => edit(i, "description", e.target.value)} aria-label="Description" /></td>
                    <td className="px-1 py-2">
                      <select className={input} value={l.ingredient ?? ""} onChange={(e) => edit(i, "ingredient", e.target.value || null)} aria-label="Ingredient">
                        <option value="">— not tracked —</option>
                        {ingredients.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
                      </select>
                    </td>
                    <td className="w-20 px-1 py-2"><input className={input} type="number" min="0" step="any" value={l.packCount ?? ""} onChange={(e) => edit(i, "packCount", e.target.value)} aria-label="Pack count" /></td>
                    <td className="w-24 px-1 py-2"><input className={input} type="number" min="0" step="any" value={l.packSize ?? ""} onChange={(e) => edit(i, "packSize", e.target.value)} aria-label="Pack size" /></td>
                    <td className="w-24 px-1 py-2">
                      <select className={input} value={l.packUnit ?? ""} onChange={(e) => edit(i, "packUnit", e.target.value)} aria-label="Unit">
                        {UNITS.map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="w-28 px-1 py-2"><input className={input} type="number" min="0" step="0.01" value={l.linePrice ?? ""} onChange={(e) => edit(i, "linePrice", e.target.value)} aria-label="Line price in dollars" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <Button onClick={save} disabled={!!busy}>{busy === "saving" ? "Saving…" : "Save costs"}</Button>
            <button type="button" className="min-h-12 border-2 border-ink px-5 text-sm font-bold hover:bg-ink hover:text-paper" onClick={() => setLines((ls) => [...ls, { ...blankLine }])}>
              Add line
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl md:text-3xl">
            {result.updated.length ? `Updated ${result.updated.length} ingredient cost${result.updated.length === 1 ? "" : "s"}` : "Nothing updated"}
          </h2>
          <ul className="space-y-2">
            {result.updated.map((u) => {
              const up = u.newCost > u.oldCost, same = u.newCost === u.oldCost;
              return (
                <li key={u.ingredient} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule py-2">
                  <span className="font-bold">{u.ingredient}</span>
                  <span>
                    {perUnit(u.oldCost, unitOf[u.ingredient] ?? "g")} →{" "}
                    <span className={`font-bold ${same ? "" : up ? "text-loss" : "text-margin"}`}>
                      {perUnit(u.newCost, unitOf[u.ingredient] ?? "g")} {same ? "no change" : up ? "▲ up" : "▼ down"}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          {result.skipped.length > 0 && (
            <div>
              <h3 className="text-xl font-bold">Skipped</h3>
              <ul className="list-disc pl-6 text-base">
                {result.skipped.map((s, i) => <li key={i}><span className="font-bold">{s.description || "(no description)"}</span>: {s.reason}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
