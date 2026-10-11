"use client";
import Link from "next/link";
import { useState } from "react";
import { Button, Card } from "@/components/ui";

const field = "mt-1 block min-h-14 w-full rounded-xl border-2 border-navy bg-white px-3 text-xl";

export default function AuthForm({ signup }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/auth/${signup ? "signup" : "login"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.target))),
      });
      if (res.ok) return location.assign("/owner");
      setError((await res.json().catch(() => null))?.error ?? "Something went wrong. Try again.");
    } catch { setError("Couldn't reach the server. Try again."); }
    setBusy(false);
  }

  return (
    <Card className="mx-auto max-w-md">
      <form onSubmit={submit} className="space-y-5">
        <h1 className="font-display text-3xl md:text-5xl">{signup ? "Sign up" : "Log in"}</h1>
        {signup && (
          <label className="block font-bold">Restaurant name
            <input name="restaurantName" required autoComplete="organization" className={field} />
          </label>
        )}
        <label className="block font-bold">Email
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>
        <label className="block font-bold">Password
          <input name="password" type="password" required minLength={signup ? 8 : undefined}
            autoComplete={signup ? "new-password" : "current-password"} className={field} />
        </label>
        {error && <p className="rounded-lg bg-loss px-4 py-3 font-bold text-white" role="alert">{error}</p>}
        <Button type="submit" disabled={busy} className="md:w-full">
          {busy ? "One sec…" : signup ? "Create account" : "Log in"}
        </Button>
        <p className="text-center">
          {signup ? "Already have an account? " : "New here? "}
          <Link href={signup ? "/login" : "/signup"} className="font-bold underline">{signup ? "Log in" : "Sign up"}</Link>
        </p>
      </form>
    </Card>
  );
}
