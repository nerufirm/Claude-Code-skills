"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/patients", label: "患者管理" },
  { href: "/admin/doctors", label: "医師管理" },
  { href: "/admin/consultations", label: "診察一覧" },
  { href: "/admin/prescriptions", label: "処方一覧" },
  { href: "/admin/revenue", label: "売上レポート" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-gray-900 text-gray-100">
        {/* Header */}
        <div className="px-6 py-5">
          <h1 className="text-lg font-bold tracking-tight text-white">
            Medvi Admin
          </h1>
          <p className="mt-0.5 text-xs text-gray-400">管理コンソール</p>
        </div>

        <Separator className="bg-gray-700" />

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-700 px-6 py-4">
          <p className="text-xs text-gray-500">Medvi Japan v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
