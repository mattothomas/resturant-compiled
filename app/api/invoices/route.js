import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;
  const rows = await (await getDb()).collection("invoices")
    .find({ restaurantId: owner.restaurantId }).sort({ date: -1, createdAt: -1 }).toArray();
  return Response.json(rows.map((r) => ({
    _id: r._id, vendor: r.vendor, date: r.date, lineCount: r.lines.length,
    total: Math.round(r.lines.reduce((s, l) => s + (Number(l.linePrice) || 0), 0) * 100), // cents
  })));
}
