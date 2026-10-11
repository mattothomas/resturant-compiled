"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Money } from "@/components/ui";
import { TO_BASE, OVER_TARGET, unitKind } from "@/lib/cost";

const UNITS = Object.keys(TO_BASE);
const input = "min-h-14 w-full rounded-xl border-2 border-navy bg-white px-3 text-lg";
const blank = () => ({ ingredient: "", qty: "", unit: "g" });

export default function Page({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState(""); // dollars
  const [rows, setRows] = useState([blank()]);
  const [ings, setIngs] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  // every call bounces to /login on 401 (auth is checked by the API)
  const api = async (url, opts) => {
    const res = await fetch(url, opts);
    if (res.status === 401) router.push("/login");
    return { res, body: await res.json().catch(() => null) };
  };

  useEffect(() => {
    (async () => {
      try {
        const { body: list } = await api("/api/ingredients");
        const all = Array.isArray(list) ? list : [];
        setIngs(all);
        if (id === "new") return;
        const { res, body } = await api(`/api/dishes/${id}`);
        if (!res.ok) return setErr(body?.error ?? "Couldn't load this plate");
        setName(body.name);
        setPrice((body.price / 100).toFixed(2));
        // saved quantities are in the ingredient's base unit, so show them in it
        if (body.lines.length)
          setRows(body.lines.map((l) => ({
            ingredient: l.ingredient,
            qty: String(+l.qty.toFixed(2)),
            unit: all.find((i) => i.name === l.ingredient)?.unit ?? "g",
          })));
      } catch { setErr("Couldn't reach the server"); }
    })();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const setRow = (i, patch) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  // picking an ingredient of a different unit kind resets the unit to its own
  const pick = (i, ingredient) => {
    const ing = ings.find((x) => x.name === ingredient);
    setRow(i, { ingredient, ...(ing && unitKind(rows[i].unit) !== unitKind(ing.unit) && { unit: ing.unit }) });
  };

  // live numbers, all in cents
  const cents = Math.round(parseFloat(price) * 100) || 0;
  const plate = rows.reduce((sum, r) => {
    const ing = ings.find((x) => x.name === r.ingredient);
    return sum + (ing ? (parseFloat(r.qty) || 0) * TO_BASE[r.unit] * (ing.costPerUnit ?? 0) : 0);
  }, 0);
  const pct = cents ? plate / cents : 0;
  const target = Math.ceil(plate / OVER_TARGET / 25) * 25;
  const over = cents > 0 && pct > OVER_TARGET;

  async function send(method, url, data) {
    setErr(""); setBusy(true);
    try {
      const { res, body } = await api(url, {
        method, ...(data && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
      });
      if (res.ok) return router.push("/owner/menu");
      setErr(body?.error ?? "That didn't work. Try again.");
    } catch { setErr("Couldn't reach the server. Try again."); }
    setBusy(false);
  }

  const isNew = id === "new";
  const save = () => send(isNew ? "POST" : "PUT", isNew ? "/api/dishes" : `/api/dishes/${id}`, { name, price: cents, lines: rows });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl md:text-5xl">{isNew ? "Add a plate" : "Edit plate"}</h1>
      <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
        <div className="space-y-4">
          <label className="block font-bold">Plate name
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block font-bold">Menu price ($)
            <input className={input} type="number" inputMode="decimal" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </label>
          <h2 className="text-2xl font-bold">Recipe</h2>
          {rows.map((r, i) => (
            <Card key={i} className="space-y-3">
              <label className="block font-bold">Ingredient
                <select className={input} value={r.ingredient} onChange={(e) => pick(i, e.target.value)}>
                  <option value="">Pick one…</option>
                  {ings.map((x) => <option key={x.name} value={x.name}>{x.name}</option>)}
                </select>
              </label>
              <div className="flex gap-3">
                <label className="block flex-1 font-bold">Quantity
                  <input className={input} type="number" inputMode="decimal" min="0" step="any" value={r.qty} onChange={(e) => setRow(i, { qty: e.target.value })} />
                </label>
                <label className="block flex-1 font-bold">Unit
                  <select className={input} value={r.unit} onChange={(e) => setRow(i, { unit: e.target.value })}>
                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </label>
              </div>
              <button type="button" className="min-h-14 w-full rounded-xl border-2 border-navy text-lg font-bold disabled:opacity-50"
                disabled={rows.length === 1} onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>
                Remove
              </button>
            </Card>
          ))}
          <button type="button" className="min-h-14 w-full rounded-xl border-2 border-navy text-xl font-bold"
            onClick={() => setRows((rs) => [...rs, blank()])}>
            + Add ingredient
          </button>
        </div>

        <div className="md:sticky md:top-4 md:self-start">
          <Card className="space-y-3" aria-live="polite">
            <h2 className="text-2xl font-bold">Live numbers</h2>
            <div><p>Plate cost</p><Money cents={Math.round(plate)} className="text-4xl font-bold md:text-5xl" /></div>
            <div><p>Margin</p><Money cents={Math.round(cents - plate)} className={`text-4xl font-bold md:text-5xl ${cents - plate < 0 ? "text-loss" : "text-margin"}`} /></div>
            <div>
              <p>Food cost</p>
              <p className={`text-4xl font-bold md:text-5xl ${over ? "text-loss" : "text-margin"}`}>
                {(pct * 100).toFixed(0)}% {over && <span className="text-xl">Over cost target</span>}
              </p>
            </div>
            <div><p>Price to hit 35%</p><Money cents={target} className="text-4xl font-bold md:text-5xl" /></div>
          </Card>
        </div>
      </div>

      {err && <p role="alert" className="rounded-xl bg-loss p-4 text-lg font-bold text-white">{err}</p>}
      <Button onClick={save} disabled={busy}>Save plate</Button>
      {!isNew && (confirmDel ? (
        <div className="flex flex-col gap-3 md:flex-row">
          <button className="min-h-14 w-full rounded-xl bg-loss px-6 text-xl font-bold text-white disabled:opacity-50 md:w-auto" disabled={busy} onClick={() => send("DELETE", `/api/dishes/${id}`)}>Yes, delete it</button>
          <button className="min-h-14 w-full rounded-xl border-2 border-navy px-6 text-xl font-bold md:w-auto" onClick={() => setConfirmDel(false)}>Keep it</button>
        </div>
      ) : (
        <button className="min-h-14 w-full rounded-xl border-2 border-loss px-6 text-xl font-bold text-loss md:w-auto" onClick={() => setConfirmDel(true)}>Delete</button>
      ))}
    </div>
  );
}
