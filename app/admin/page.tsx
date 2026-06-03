import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth";

export default function AdminPage() {
  if (isAdminAuthenticated()) {
    return <AdminDashboard />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
