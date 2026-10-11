"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [["Dashboard", "/owner"], ["Invoices", "/owner/invoices"], ["Ingredients", "/owner/ingredients"], ["Menu", "/owner/menu"]];
const tab = "flex min-h-12 shrink-0 items-center border-b-4 px-4 text-lg font-bold text-ink";

export default function OwnerNav() {
  const path = usePathname();
  return (
    <nav className="-mx-5 mb-10 flex gap-2 overflow-x-auto border-b border-rule px-5 md:mx-0 md:px-0" aria-label="Owner">
      {TABS.map(([label, href]) => {
        const active = href === "/owner" ? path === href : path.startsWith(href);
        return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`${tab} ${active ? "border-ink" : "border-transparent hover:border-rule"}`}>{label}</Link>;
      })}
      <form action="/api/auth/logout" method="post" className="ml-auto shrink-0">
        <button className={`${tab} border-transparent hover:underline`}>Log out</button>
      </form>
    </nav>
  );
}
