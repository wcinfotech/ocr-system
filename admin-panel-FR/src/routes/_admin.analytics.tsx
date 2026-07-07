import { createFileRoute } from "@tanstack/react-router";
import Icon from "@mui/icons-material/InsightsOutlined";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/_admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin Panel" }] }),
  component: () => (
    <ModulePlaceholder
      title="Analytics"
      subtitle="Users, revenue, bills, OCR, subscriptions and growth."
      icon={Icon}
    />
  ),
});
