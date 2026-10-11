import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import DealForm from "./DealForm";

export default async function Page() {
  const owner = await getOwner();
  if (!owner) redirect("/login");
  return <DealForm restaurantName={owner.name} />;
}
