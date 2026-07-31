import { AccountNav } from "@/components/account/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 min-h-[70vh]">
      <div className="mx-auto max-w-5xl flex flex-col lg:flex-row gap-10">
        <AccountNav />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
