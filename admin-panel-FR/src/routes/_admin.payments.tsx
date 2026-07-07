import { createFileRoute } from "@tanstack/react-router";
import Icon from "@mui/icons-material/CreditCardOutlined";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/_admin/payments")({
  head: () => ({ meta: [{ title: "Payments — Admin Panel" }] }),
  component: () => (
    <ModulePlaceholder
      title="Payments"
      subtitle="Payment history, transactions, invoices and refunds."
      icon={Icon}
    />
  ),
});
