import { getDb } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.restaurantName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!name) return Response.json({ error: "Enter your restaurant's name" }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter a valid email" }, { status: 400 });
  if (password.length < 8) return Response.json({ error: "Password needs at least 8 characters" }, { status: 400 });

  let insertedId;
  try {
    ({ insertedId } = await (await getDb()).collection("restaurants")
      .insertOne({ name, email, ...(await hashPassword(password)) }));
  } catch (e) {
    if (e.code === 11000) return Response.json({ error: "That email already has an account. Log in instead." }, { status: 409 });
    throw e;
  }
  await createSession(insertedId);
  return Response.json({ name });
}
