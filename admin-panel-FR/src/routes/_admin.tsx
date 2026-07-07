import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminProviders } from "@/components/layout/AdminProviders";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/common/States";

// Client-only: MUI (Emotion) + localStorage-based auth run in the browser.
export const Route = createFileRoute("/_admin")({
  ssr: false,
  component: AdminLayout,
});

/** Auth guard: redirects to /login when there is no active session. */
function Guard() {
  const { isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [isInitializing, isAuthenticated, navigate]);

  if (isInitializing || !isAuthenticated) return <Loader label="Checking session…" minHeight={400} />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function AdminLayout() {
  return (
    <AdminProviders>
      <Guard />
    </AdminProviders>
  );
}
