import { destroySession } from "@/lib/auth";

// 303 so the tab bar's plain <form method="post"> lands on /login
export async function POST() {
  await destroySession();
  return new Response(null, { status: 303, headers: { Location: "/login" } });
}
