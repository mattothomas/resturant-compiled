import OwnerNav from "@/components/OwnerNav";

// auth lives in each page, not here: layouts don't re-run on client navigation
export default function OwnerLayout({ children }) {
  return (
    <>
      <OwnerNav />
      {children}
    </>
  );
}
