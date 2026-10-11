import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;
  const db = await getDb();
  const rows = await db.collection("ingredients")
    .find({ restaurantId: owner.restaurantId }, { projection: { _id: 0, name: 1, unit: 1, costPerUnit: 1 } })
    .sort({ name: 1 }).toArray();
  return Response.json(rows);
}
