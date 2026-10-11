import { requireOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;
  return Response.json(owner);
}
