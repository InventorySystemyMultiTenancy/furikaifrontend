import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    redirect("/entrar");
  }

  return (
    <div className="pt-28 pb-16 px-6 lg:px-10 min-h-screen bg-furikai-black">
      <div className="mx-auto max-w-[1600px] flex flex-col lg:flex-row gap-8">
        <AdminNav />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
