import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function NakesLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Periksa apakah nakes sudah diverifikasi
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!dbUser) redirect("/login");

  // Cek apakah nakes ini diverifikasi
  // (Jika profile.isVerified === false, lempar ke pending)
  const profile = dbUser.profile as { isVerified?: boolean } | null;
  
  if (profile?.isVerified === false) {
    redirect("/dashboard/pending-nakes");
  }

  return <>{children}</>;
}
