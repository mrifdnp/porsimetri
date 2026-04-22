import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import MobileNav from "@/components/MobileNav";

export const runtime = "nodejs";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as any).role || "user";

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen">
        {children}
        <MobileNav role={role} />
      </div>
    </SessionProvider>
  );
}
