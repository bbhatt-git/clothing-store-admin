import type { Metadata } from "next";
import { AdminAuthProvider } from "./_lib/auth-context";
import AdminShell from "./_components/AdminShell";

export const metadata: Metadata = {
  title: "StyleZone Admin",
  description: "StyleZone store admin dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
