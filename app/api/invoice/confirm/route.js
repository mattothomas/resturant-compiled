import { getDb } from "@/lib/db";
import { costPerUnit, unitKind } from "@/lib/cost";

export async function POST(req) {
  const { lines = [] } = await req.json();
  const col = (await getDb()).collection("ingredients");
  const updated = [], skipped = [];

  for (const raw of lines) {
    if (!raw.ingredient) continue; // owner left it unmatched
    const line = { ...raw, packCount: Number(raw.packCount), packSize: Number(raw.packSize), linePrice: Number(raw.linePrice) };
    const skip = (reason) => skipped.push({ description: line.description, reason });

    const ing = await col.findOne({ name: line.ingredient });
    if (!ing) { skip(`No ingredient named "${line.ingredient}"`); continue; }
    if (![line.packCount, line.packSize, line.linePrice].every((n) => Number.isFinite(n) && n > 0)) {
      skip("Missing pack count, size, or price"); continue;
    }
    if (!unitKind(line.packUnit) || unitKind(line.packUnit) !== unitKind(ing.unit)) {
      skip(`Unit "${line.packUnit}" doesn't fit ${ing.name} (stored per ${ing.unit})`); continue;
    }

    const newCost = costPerUnit(line);
    await col.updateOne({ _id: ing._id }, { $set: { costPerUnit: newCost } });
    updated.push({ ingredient: ing.name, oldCost: ing.costPerUnit, newCost });
  }
  return Response.json({ updated, skipped });
}
