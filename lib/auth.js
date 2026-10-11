import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

const scryptAsync = promisify(scrypt);
const WEEK = 7 * 24 * 60 * 60 * 1000;
const sha256 = (s) => createHash("sha256").update(s).digest("hex");

// scripts/seed.mjs repeats this (scrypt, 64-byte key, hex) — keep them in step
export async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  return { salt, passwordHash: (await scryptAsync(password, salt, 64)).toString("hex") };
}

export async function checkPassword(password, { salt, passwordHash }) {
  const { passwordHash: got } = await hashPassword(password, salt);
  return timingSafeEqual(Buffer.from(got, "hex"), Buffer.from(passwordHash, "hex"));
}

export async function createSession(restaurantId) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + WEEK);
  await (await getDb()).collection("sessions").insertOne({ tokenHash: sha256(token), restaurantId, expiresAt });
  (await cookies()).set("session", token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get("session")?.value;
  if (token) await (await getDb()).collection("sessions").deleteOne({ tokenHash: sha256(token) });
  jar.delete("session");
}

// → { restaurantId (ObjectId), name } or null
export async function getOwner() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  const db = await getDb();
  const s = await db.collection("sessions").findOne({ tokenHash: sha256(token), expiresAt: { $gt: new Date() } });
  if (!s) return null;
  const r = await db.collection("restaurants").findOne({ _id: s.restaurantId }, { projection: { name: 1 } });
  return r && { restaurantId: r._id, name: r.name };
}

// API routes: const owner = await requireOwner(); if (owner instanceof Response) return owner;
export async function requireOwner() {
  return (await getOwner()) ?? Response.json({ error: "Log in first" }, { status: 401 });
}
