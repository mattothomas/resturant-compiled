import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";

export default async function Page() {
  if (!(await getOwner())) redirect("/login");
  return <h1 className="font-display text-3xl md:text-5xl">Coming soon</h1>;
}
