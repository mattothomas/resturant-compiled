import Link from "next/link";

const TABS = [["Dashboard", "/owner"], ["Invoices", "/owner/invoices"], ["Ingredients", "/owner/ingredients"], ["Menu", "/owner/menu"]];
const tab = "flex min-h-12 shrink-0 items-center border-b-2 px-4 text-base font-bold";

// auth lives in each page, not here: layouts don't re-run on client navigation
export default function OwnerLayout({ children }) {
  return (
    <>
      <nav className="-mx-5 mb-10 flex gap-2 overflow-x-auto border-b border-rule px-5 md:mx-0 md:px-0" aria-label="Owner">
        {TABS.map(([label, href]) => (
          <Link key={href} href={href} className={`${tab} border-transparent text-ink hover:border-action hover:text-ink`}>{label}</Link>
        ))}
        <form action="/api/auth/logout" method="post" className="ml-auto shrink-0">
          <button className={`${tab} border-transparent text-loss hover:border-loss`}>Log out</button>
        </form>
      </nav>
      {children}
    </>
  );
}
