import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function POST(_req, { params }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) return Response.json({ error: "Sold out" }, { status: 409 });
  const db = await getDb();
  const deal = await db.collection("deals").findOneAndUpdate(
    { _id: new ObjectId(id), qtyLeft: { $gt: 0 }, expiresAt: { $gt: new Date() } },
    { $inc: { qtyLeft: -1 } },
    { returnDocument: "after" }
  );
  if (!deal) return Response.json({ error: "Sold out" }, { status: 409 });
  return Response.json({ qtyLeft: deal.qtyLeft });
}
