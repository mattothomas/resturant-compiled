import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { parseDish } from "../route";

export const dynamic = "force-dynamic";

// → { owner, filter } or { res }; a bad or foreign id is a 404
async function scope(params) {
  const owner = await requireOwner();
  if (owner instanceof Response) return { res: owner };
  const { id } = await params;
  if (!ObjectId.isValid(id)) return { res: Response.json({ error: "Not found" }, { status: 404 }) };
  return { owner, filter: { _id: new ObjectId(id), restaurantId: owner.restaurantId } };
}

export async function GET(_req, { params }) {
  const { res, filter } = await scope(params);
  if (res) return res;
  const dish = await (await getDb()).collection("dishes").findOne(filter, { projection: { restaurantId: 0 } });
  return dish ? Response.json(dish) : Response.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req, { params }) {
  const { res, owner, filter } = await scope(params);
  if (res) return res;
  const { dish, error } = await parseDish(req, owner.restaurantId);
  if (error) return Response.json({ error }, { status: 400 });
  const { matchedCount } = await (await getDb()).collection("dishes").updateOne(filter, { $set: dish });
  return matchedCount ? Response.json({ _id: filter._id, ...dish }) : Response.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(_req, { params }) {
  const { res, filter } = await scope(params);
  if (res) return res;
  const { deletedCount } = await (await getDb()).collection("dishes").deleteOne(filter);
  return deletedCount ? Response.json({ ok: true }) : Response.json({ error: "Not found" }, { status: 404 });
}
