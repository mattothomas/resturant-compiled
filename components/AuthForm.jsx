"use client";
import Link from "next/link";
import { useState } from "react";
import { Button, Card } from "@/components/ui";

const field = "mt-2 block min-h-12 w-full border border-rule bg-white px-3 text-base";

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
    <Card className="mx-auto max-w-md border-ink">
      <form onSubmit={submit} className="space-y-5">
        <div><p className="eyebrow">Keep College Ave cooking</p><h1 className="mt-2 text-4xl font-bold tracking-tight">{signup ? "Set up your owner desk." : "Welcome back."}</h1><p className="mt-3 text-ink">Manage real costs, then move what needs a good home tonight.</p></div>
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
