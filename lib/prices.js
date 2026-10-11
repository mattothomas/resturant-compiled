import { getDb } from "@/lib/db";

// each ingredient's costPerUnit = its newest prices row by date; no rows → left alone
export async function recomputeCosts(restaurantId, ingredientNames) {
  const db = await getDb();
  for (const ingredient of new Set(ingredientNames)) {
    const p = await db.collection("prices").findOne({ restaurantId, ingredient }, { sort: { date: -1, _id: -1 } });
    if (p) await db.collection("ingredients").updateOne({ restaurantId, name: ingredient }, { $set: { costPerUnit: p.costPerUnit } });
  }
}
