"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import InvoiceUpload from "@/components/InvoiceUpload";
import { Card, Money } from "@/components/ui";

export default function Page() {
  const [rows, setRows] = useState(null);
  const load = useCallback(async () => {
    const res = await fetch("/api/invoices", { cache: "no-store" });
    if (res.status === 401) return void (window.location.href = "/login");
    setRows(await res.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-10">
      <section className="border-b border-rule pb-8"><p className="eyebrow">Owner desk / purchasing</p><h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">Invoices.</h1><p className="mt-3 text-lg text-ink">A record of what the kitchen is paying, and when it changed.</p></section>
      <InvoiceUpload onSaved={load} />
      {rows && !rows.length && <p className="text-lg">No invoices yet. Upload your first one above.</p>}
      <ul className="space-y-3">
        {rows?.map((r) => (
          <li key={r._id}>
            <Link href={`/owner/invoices/${r._id}`}>
              <Card className="flex flex-wrap items-center justify-between gap-2 hover:border-ink">
                <span>
                  <span className="eyebrow">{r.date.slice(0, 10)} / {r.lineCount} line{r.lineCount === 1 ? "" : "s"}</span>
                  <span className="mt-1 block text-xl font-bold">{r.vendor || "(no vendor)"}</span>
                </span>
                <Money cents={r.total} className="mono text-3xl font-bold" />
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
