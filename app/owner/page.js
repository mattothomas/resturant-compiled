import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import Dashboard from "./Dashboard";

export default async function Page() {
  if (!(await getOwner())) redirect("/login");
  return <Dashboard />;
}
