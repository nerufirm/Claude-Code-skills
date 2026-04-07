import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "本日の予約" },
  { href: "/dashboard/patients", label: "患者一覧" },
  { href: "/dashboard/settings", label: "設定" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r bg-white">
        {/* Doctor header */}
        <div className="border-b px-6 py-5">
          <p className="text-xs font-medium text-muted-foreground">医師</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            田中 太郎 先生
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <p className="text-xs text-muted-foreground">Medvi Japan</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
