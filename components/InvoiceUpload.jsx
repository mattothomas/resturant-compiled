"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Badge } from "@/components/ui";
import { TO_BASE, unitKind } from "@/lib/cost";

const UNITS = Object.keys(TO_BASE);

const blankLine = { description: "", ingredient: null, suggested: null, packCount: "", packSize: "", packUnit: "lb", linePrice: "" };

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

const input = "min-h-12 w-full border border-rule bg-white px-2 text-lg";

// `file` comes from the dashboard's "Upload invoice" button; a new File object starts a new read
export default function InvoiceUpload({ file, onSaved }) {
  const panelRef = useRef(null);
  const [ingredients, setIngredients] = useState([]);
  const [lines, setLines] = useState(null);
  const [busy, setBusy] = useState(""); // "" | "reading" | "saving"
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState("");
  const [meta, setMeta] = useState({}); // { vendor, date, fileName }
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetch("/api/ingredients", { cache: "no-store" }).then((r) => r.json()).then(setIngredients).catch(() => {});
  }, []);
  const unitOf = Object.fromEntries(ingredients.map((i) => [i.name, i.unit]));

  const started = useRef(null); // strict mode runs effects twice; read each file once
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    if (started.current !== file) {
      started.current = file;
      upload(file);
      panelRef.current?.scrollIntoView({ block: "start" });
    }
    return () => URL.revokeObjectURL(url);
  }, [file]); // eslint-disable-line react-hooks/exhaustive-deps

  async function upload(file) {
    setBusy("reading"); setError(null); setRaw(""); setLines(null);
    setMeta({ vendor: "", date: new Date().toLocaleDateString("en-CA"), fileName: file.name }); // en-CA = YYYY-MM-DD, local day
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
        setLines(data.lines.map((l) => ({ ...blankLine, ...l, suggested: l.ingredient ?? null })));
      }
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setBusy("");
    }
  }

  const edit = (i, key, value) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [key]: value } : l)));
  const misfit = (l) => l.ingredient && unitOf[l.ingredient] && unitKind(l.packUnit) !== unitKind(unitOf[l.ingredient]);
  const needLook = lines?.filter(misfit).length ?? 0;

  async function save() {
    setBusy("saving"); setError(null);
    try {
      const res = await fetch("/api/invoice/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...meta, lines }),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setLines(null);
      setRaw("");
      onSaved?.(result);
    } catch {
      setError("Save failed. Try again.");
    } finally {
      setBusy("");
    }
  }

  if (!busy && !lines && !error) return <div ref={panelRef} />;
  const isPdf = file?.type === "application/pdf";

  return (
    <section ref={panelRef} className="scroll-mt-4 space-y-5 border border-rule bg-surface p-4 md:p-6">
      {busy === "reading" && <p className="text-lg font-bold" role="status">Reading every line — about 20 seconds…</p>}
      {error && <p className="border-2 border-ink bg-paper px-4 py-3 text-lg font-bold" role="alert">{error}</p>}
      {raw && (
        <details className="text-lg">
          <summary className="cursor-pointer font-bold">What the AI saw (type the numbers below)</summary>
          <pre className="mono mt-2 overflow-x-auto whitespace-pre-wrap border border-rule bg-paper p-3 text-base">{raw}</pre>
        </details>
      )}

      {lines && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold md:text-3xl">Check the lines, then save</h2>
            <span className={`rounded-full border-2 border-ink px-3 py-1 text-base font-bold ${needLook ? "bg-action" : ""}`} role="status">
              {needLook ? `${needLook} line${needLook === 1 ? " needs" : "s need"} a look` : "✓ Ready"}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
            {preview && (isPdf ? (
              <p className="mono self-start border border-rule bg-paper px-3 py-2 text-base">PDF · {file.name}</p>
            ) : (
              <>
                <img src={preview} alt="Uploaded invoice" className="hidden max-h-[85vh] w-full border border-rule object-contain object-top md:sticky md:top-4 md:block" />
                <details className="md:hidden">
                  <summary className="flex cursor-pointer items-center gap-3 text-lg font-bold">
                    <img src={preview} alt="" className="h-16 w-12 border border-rule object-cover object-top" />
                    View invoice
                  </summary>
                  <img src={preview} alt="Uploaded invoice" className="mt-3 w-full border border-rule" />
                </details>
              </>
            ))}

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-base font-bold">Vendor
                  <input className={`${input} mt-1`} value={meta.vendor} onChange={(e) => setMeta((m) => ({ ...m, vendor: e.target.value }))} />
                </label>
                <label className="block text-base font-bold">Invoice date
                  <input type="date" required className={`${input} mt-1`} value={meta.date} onChange={(e) => setMeta((m) => ({ ...m, date: e.target.value }))} />
                </label>
              </div>
              <ol className="space-y-3">
                {lines.map((l, i) => <LineRow key={i} l={l} set={(k, v) => edit(i, k, v)} ingredients={ingredients} misfit={misfit(l)} />)}
              </ol>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <Button onClick={save} disabled={!!busy}>{busy === "saving" ? "Saving…" : "Save costs"}</Button>
                <button type="button" className="min-h-12 px-2 text-lg font-bold underline underline-offset-4 hover:no-underline" onClick={() => setLines((ls) => [...ls, { ...blankLine }])}>
                  Add line
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function LineRow({ l, set, ingredients, misfit }) {
  const unmatched = !l.ingredient;
  const unit = ingredients.find((g) => g.name === l.ingredient)?.unit;
  return (
    <li data-line className={`space-y-2 border p-3 ${unmatched ? "border-rule bg-paper" : misfit ? "border-2 border-ink bg-white" : "border-rule bg-white"}`}>
      <p className="mono break-words text-base text-ink/70">{l.description || "Added by hand"}</p>
      <div className="flex flex-wrap items-center gap-2">
        <select className={`${input} flex-1 font-bold ${unmatched ? "text-ink/60" : ""}`} value={l.ingredient ?? ""} onChange={(e) => set("ingredient", e.target.value || null)} aria-label="Ingredient">
          <option value="">Not one of your ingredients</option>
          {ingredients.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
        </select>
        {l.suggested && l.ingredient === l.suggested && <Badge>Suggested</Badge>}
      </div>
      {unmatched && <p className="text-base text-ink/70">Skipped — not one of your ingredients</p>}
      {misfit && <p className="text-base font-bold">{l.ingredient} is counted by {unitKind(unit)}, so &ldquo;{l.packUnit}&rdquo; won&apos;t work. Pick a {unitKind(unit)} unit.</p>}
      <div className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${unmatched ? "opacity-60" : ""}`}>
        <Field label="Packs"><input className={input} type="number" min="0" step="any" inputMode="decimal" value={l.packCount ?? ""} onChange={(e) => set("packCount", e.target.value)} aria-label="Pack count" /></Field>
        <Field label="Size"><input className={input} type="number" min="0" step="any" inputMode="decimal" value={l.packSize ?? ""} onChange={(e) => set("packSize", e.target.value)} aria-label="Pack size" /></Field>
        <Field label="Unit">
          <select className={input} value={l.packUnit ?? ""} onChange={(e) => set("packUnit", e.target.value)} aria-label="Unit">
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </Field>
        <Field label="Price ($)"><input className={input} type="number" min="0" step="0.01" inputMode="decimal" value={l.linePrice ?? ""} onChange={(e) => set("linePrice", e.target.value)} aria-label="Line price in dollars" /></Field>
      </div>
    </li>
  );
}

function Field({ label, children }) {
  return <label className="block text-base">{label}<span className="mt-1 block">{children}</span></label>;
}
