import { getDb } from "@/lib/db";
import { checkPassword, createSession, hashPassword } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const r = await (await getDb()).collection("restaurants").findOne({ email });
  // hash even when the email is unknown so both failures take the same time
  const ok = r ? await checkPassword(password, r) : (await hashPassword(password), false);
  if (!ok) return Response.json({ error: "Wrong email or password" }, { status: 401 });
  await createSession(r._id);
  return Response.json({ name: r.name });
}
