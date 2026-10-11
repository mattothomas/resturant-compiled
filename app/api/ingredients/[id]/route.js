import { requireOwner } from "@/lib/auth";

// placeholder: owned by a lane branch, see CONTRACT.md
async function notBuilt() {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;
  return Response.json({ error: "Not built yet" }, { status: 501 });
}
export const PUT = notBuilt;
