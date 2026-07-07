import { createFileRoute } from "@tanstack/react-router";
import Icon from "@mui/icons-material/SettingsOutlined";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/_admin/settings")({
  head: () => ({ meta: [{ title: "System Settings — Admin Panel" }] }),
  component: () => (
    <ModulePlaceholder
      title="System Settings"
      subtitle="Company details, SMTP, OCR, JWT, API keys, maintenance."
      icon={Icon}
    />
  ),
});
