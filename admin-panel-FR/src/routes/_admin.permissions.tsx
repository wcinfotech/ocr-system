import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Box, Typography, Button, TextField, Chip } from "@mui/material";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SearchInput } from "@/components/common/Filters";
import { usePermissions } from "@/hooks/queries/useAdmins";
import type { PermissionModel } from "@/types";

export const Route = createFileRoute("/_admin/permissions")({
  head: () => ({ meta: [{ title: "Permissions — Admin Panel" }] }),
  component: PermissionsPage,
});

function PermissionsPage() {
  const { data: permissions = [], isLoading, isError, refetch } = usePermissions();
  const [search, setSearch] = useState("");

  const filtered = permissions.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<PermissionModel>[] = [
    {
      key: "key",
      label: "Rule Key",
      sortable: true,
      render: (p) => (
        <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700, color: "primary.main" }}>
          {p.key}
        </Typography>
      ),
    },
    {
      key: "name",
      label: "Permission Name",
      sortable: true,
      render: (p) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {p.name}
        </Typography>
      ),
    },
    {
      key: "category",
      label: "Category Module",
      sortable: true,
      render: (p) => {
        let color: "primary" | "secondary" | "success" | "warning" | "default" | "error" | "info" = "default";
        if (p.category === "RBAC") color = "error";
        else if (p.category === "Users") color = "primary";
        else if (p.category === "Subscriptions" || p.category === "Plans") color = "info";
        else if (p.category === "Support") color = "success";
        else if (p.category === "Settings") color = "warning";
        return <Chip label={p.category} size="small" color={color} variant="filled" sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: "0.65rem" }} />;
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Permission Catalog"
        subtitle="Manage the system capability registry. These keys guard back-end controllers and front-end navigation routers."
      />

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.key}
        total={filtered.length}
        page={1}
        pageSize={filtered.length}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        emptyTitle="No permissions found"
        emptyDescription="Try clearing your search filters."
        toolbar={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search permission registry…" />
          </Box>
        }
      />
    </Box>
  );
}
