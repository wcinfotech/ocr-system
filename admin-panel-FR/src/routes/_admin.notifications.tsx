import { createFileRoute } from "@tanstack/react-router";
import Icon from "@mui/icons-material/NotificationsNoneOutlined";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/_admin/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Admin Panel" }] }),
  component: () => (
    <ModulePlaceholder
      title="Notifications"
      subtitle="Send announcements and reminders, view history."
      icon={Icon}
    />
  ),
});
