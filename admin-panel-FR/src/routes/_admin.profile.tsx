import { createFileRoute } from "@tanstack/react-router";
import Icon from "@mui/icons-material/PersonOutlineOutlined";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/_admin/profile")({
  head: () => ({ meta: [{ title: "Profile — Admin Panel" }] }),
  component: () => (
    <ModulePlaceholder
      title="Profile"
      subtitle="Your account details and preferences."
      icon={Icon}
    />
  ),
});
