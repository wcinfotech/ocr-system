import { createFileRoute, redirect } from "@tanstack/react-router";

// The admin panel entry — redirect straight to the dashboard.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
