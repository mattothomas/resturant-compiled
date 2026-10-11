import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import DealForm from "./DealForm";

export default async function Page() {
  if (!(await getOwner())) redirect("/login");
  return <DealForm />;
}
