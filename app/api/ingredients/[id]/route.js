import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { costPerUnit, unitKind } from "@/lib/cost";
import { recomputeCosts } from "@/lib/prices";

export async function PUT(req, { params }) {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;
  const { restaurantId } = owner;
  const { id } = await params;
  const db = await getDb();
  const ing = ObjectId.isValid(id) && await db.collection("ingredients").findOne({ _id: new ObjectId(id), restaurantId });
  if (!ing) return Response.json({ error: "Not found" }, { status: 404 });

  const b = await req.json();
  const line = { linePrice: Number(b.linePrice), packCount: Number(b.packCount), packSize: Number(b.packSize), packUnit: b.packUnit };
  if (![line.linePrice, line.packCount, line.packSize].every((n) => Number.isFinite(n) && n > 0)) {
    return Response.json({ error: "Enter a price, pack count and pack size" }, { status: 400 });
  }
  if (!unitKind(line.packUnit) || unitKind(line.packUnit) !== unitKind(ing.unit)) {
    return Response.json({ error: `"${line.packUnit}" doesn't fit ${ing.name} (stored per ${ing.unit})` }, { status: 400 });
  }
  const today = new Date(new Date().toISOString().slice(0, 10)); // UTC midnight; ties go to the later entry
  await db.collection("prices").insertOne({ restaurantId, ingredient: ing.name, costPerUnit: costPerUnit(line), source: "manual", date: today });
  await recomputeCosts(restaurantId, [ing.name]);
  return Response.json(await db.collection("ingredients").findOne({ _id: ing._id }));
}
