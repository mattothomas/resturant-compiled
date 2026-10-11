import Link from "next/link";

const TABS = [["Dashboard", "/owner"], ["Invoices", "/owner/invoices"], ["Ingredients", "/owner/ingredients"], ["Menu", "/owner/menu"]];
const tab = "flex min-h-14 shrink-0 items-center rounded-xl px-5 text-lg font-bold";

// auth lives in each page, not here: layouts don't re-run on client navigation
export default function OwnerLayout({ children }) {
  return (
    <>
      <nav className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0" aria-label="Owner">
        {TABS.map(([label, href]) => (
          <Link key={href} href={href} className={`${tab} bg-white shadow`}>{label}</Link>
        ))}
        <form action="/api/auth/logout" method="post" className="ml-auto shrink-0">
          <button className={`${tab} border-2 border-navy`}>Log out</button>
        </form>
      </nav>
      {children}
    </>
  );
}
