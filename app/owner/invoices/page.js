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
    <div className="space-y-6">
      <h1 className="font-display text-3xl md:text-5xl">Invoices</h1>
      <InvoiceUpload onSaved={load} />
      {rows && !rows.length && <p className="text-lg">No invoices yet. Upload your first one above.</p>}
      <ul className="space-y-3">
        {rows?.map((r) => (
          <li key={r._id}>
            <Link href={`/owner/invoices/${r._id}`}>
              <Card className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  <span className="block text-xl font-bold">{r.vendor || "(no vendor)"}</span>
                  <span className="text-base">{r.date.slice(0, 10)} · {r.lineCount} line{r.lineCount === 1 ? "" : "s"}</span>
                </span>
                <Money cents={r.total} className="text-3xl font-bold md:text-4xl" />
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
