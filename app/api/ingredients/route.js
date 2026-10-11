import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const rows = await db.collection("ingredients")
    .find({}, { projection: { _id: 0, name: 1, unit: 1, costPerUnit: 1 } })
    .sort({ name: 1 }).toArray();
  return Response.json(rows);
}
