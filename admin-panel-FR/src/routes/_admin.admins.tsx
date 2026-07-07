import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SearchInput } from "@/components/common/Filters";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PermissionGate } from "@/permissions/PermissionGate";
import { PERMISSIONS, ROLES, ROLE_PERMISSION_FALLBACK, type Role } from "@/permissions/permissions";
import { useAuth } from "@/contexts/AuthContext";
import { useListParams } from "@/hooks/useListParams";
import {
  useAdmins,
  useCreateAdmin,
  useUpdateAdmin,
  useDeleteAdmin,
  usePermissions,
} from "@/hooks/queries/useAdmins";
import { initialsOf, formatDate } from "@/utils/format";
import type { Admin } from "@/types";

export const Route = createFileRoute("/_admin/admins")({
  head: () => ({ meta: [{ title: "Admins — Admin Panel" }] }),
  component: AdminsPage,
});

function AdminsPage() {
  const { user: currentAdmin } = useAuth();
  const lp = useListParams({ sortBy: "createdAt", sortDir: "desc" });
  const { data, isLoading, isError, refetch, isFetching } = useAdmins(lp.params);
  const { data: allPermissions = [] } = usePermissions();

  const createAdminMutation = useCreateAdmin();
  const updateAdminMutation = useUpdateAdmin();
  const deleteAdminMutation = useDeleteAdmin();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [toDelete, setToDelete] = useState<Admin | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("ADMIN");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const rows = data?.data ?? [];

  // Reset form when dialog opens/closes or when editingAdmin changes
  useEffect(() => {
    if (editingAdmin) {
      setName(editingAdmin.name);
      setEmail(editingAdmin.email);
      setPassword(""); // Don't show password
      setRole(editingAdmin.role);
      setSelectedPermissions(editingAdmin.permissions || []);
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole("ADMIN");
      // Pre-select fallback permissions for ADMIN role
      setSelectedPermissions(ROLE_PERMISSION_FALLBACK["ADMIN"] as string[]);
    }
  }, [editingAdmin, dialogOpen]);

  // Handle role change to pre-fill template permissions
  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    const defaults = ROLE_PERMISSION_FALLBACK[newRole] || [];
    setSelectedPermissions(defaults as string[]);
  };

  const handleTogglePermission = (permissionKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const handleSave = () => {
    if (!name || !email || (!editingAdmin && !password)) {
      return;
    }

    const payload = {
      name,
      email,
      role,
      permissions: selectedPermissions,
      ...(password ? { password } : {}),
    };

    if (editingAdmin) {
      updateAdminMutation.mutate(
        { id: editingAdmin.id, payload },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingAdmin(null);
          },
        }
      );
    } else {
      createAdminMutation.mutate(payload, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  const columns: Column<Admin>[] = [
    {
      key: "name",
      label: "Admin User",
      sortable: true,
      render: (a) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: "secondary.main", fontSize: "0.8rem" }}>
            {initialsOf(a.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {a.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
              {a.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (a) => {
        let color: "primary" | "secondary" | "success" | "warning" | "default" | "error" = "default";
        if (a.role === "SUPER_ADMIN") color = "error";
        else if (a.role === "ADMIN") color = "primary";
        else if (a.role === "MANAGER") color = "warning";
        else if (a.role === "SUPPORT") color = "success";
        else if (a.role === "ACCOUNTANT") color = "secondary";
        return <Chip label={a.role} size="small" color={color} variant="outlined" sx={{ fontWeight: 700, borderRadius: 1.5 }} />;
      },
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (a) => {
        if (a.permissions?.includes("*")) {
          return <Chip label="All Permissions (*)" size="small" color="error" sx={{ fontWeight: 600, fontSize: "0.7rem", borderRadius: 1.5 }} />;
        }
        const count = a.permissions?.length ?? 0;
        return (
          <Tooltip title={a.permissions?.join(", ") || "None"}>
            <Chip label={`${count} custom rules`} size="small" variant="filled" color="default" sx={{ fontWeight: 600, fontSize: "0.7rem", borderRadius: 1.5 }} />
          </Tooltip>
        );
      },
    },
    { key: "createdAt", label: "Created", sortable: true, render: (a) => formatDate(a.createdAt) },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (a) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
          <PermissionGate permission={PERMISSIONS.ADMINS_MANAGE}>
            <Tooltip title="Edit Staff Member">
              <IconButton
                size="small"
                onClick={() => {
                  setEditingAdmin(a);
                  setDialogOpen(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Account">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={currentAdmin?.id === a.id}
                  onClick={() => setToDelete(a)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </PermissionGate>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Admin Staff Accounts"
        subtitle="Manage administrative accounts, assign roles, and configure specific page permission restrictions."
        actions={
          <PermissionGate permission={PERMISSIONS.ADMINS_MANAGE}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingAdmin(null);
                setDialogOpen(true);
              }}
            >
              Add Staff Member
            </Button>
          </PermissionGate>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(a) => a.id}
        total={data?.total ?? 0}
        page={lp.page}
        pageSize={lp.pageSize}
        onPageChange={lp.setPage}
        onPageSizeChange={lp.setPageSize}
        sortBy={lp.sortBy}
        sortDir={lp.sortDir}
        onSortChange={lp.setSort}
        loading={isLoading || isFetching}
        error={isError}
        onRetry={refetch}
        emptyTitle="No staff members found"
        emptyDescription="Create administrative staff members to configure specific roles."
        toolbar={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <SearchInput value={lp.search} onChange={lp.setSearch} placeholder="Search admin accounts…" />
          </Box>
        }
      />

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingAdmin ? "Edit Staff Member Details" : "Create Administrative Account"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2.5}>
                <TextField
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  type="email"
                  variant="outlined"
                  size="small"
                  disabled={!!editingAdmin}
                />
                <TextField
                  label={editingAdmin ? "Change Password (Leave blank to keep current)" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required={!editingAdmin}
                  type="password"
                  variant="outlined"
                  size="small"
                />
                <FormControl fullWidth size="small">
                  <InputLabel>System Role</InputLabel>
                  <Select
                    value={role}
                    label="System Role"
                    onChange={(e) => handleRoleChange(e.target.value as Role)}
                  >
                    {Object.values(ROLES).map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            {/* Permissions Panel */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Assign Route & Component Permissions
              </Typography>
              <Box sx={{ maxHeight: 320, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, bgcolor: "grey.50" }}>
                {role === "SUPER_ADMIN" ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 5 }}>
                    <Chip label="Full Admin Wildcard (*)" color="error" variant="filled" sx={{ fontWeight: 800 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, textAlign: "center" }}>
                      Super Admin has absolute system override credentials and receives wildcard permissions.
                    </Typography>
                  </Box>
                ) : (
                  <FormGroup>
                    {allPermissions.map((perm) => (
                      <FormControlLabel
                        key={perm.key}
                        control={
                          <Checkbox
                            checked={selectedPermissions.includes(perm.key) || selectedPermissions.includes("*")}
                            disabled={selectedPermissions.includes("*")}
                            onChange={() => handleTogglePermission(perm.key)}
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {perm.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Category: {perm.category} ({perm.key})
                            </Typography>
                          </Box>
                        }
                        sx={{ mb: 1.5, alignItems: "flex-start" }}
                      />
                    ))}
                  </FormGroup>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!name || !email || (!editingAdmin && !password) || createAdminMutation.isPending || updateAdminMutation.isPending}
          >
            {editingAdmin ? "Save Changes" : "Create Account"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!toDelete}
        title="Delete admin staff account?"
        description={`This will permanently delete administrative access for ${toDelete?.name} (${toDelete?.email}).`}
        confirmLabel="Delete Account"
        destructive
        loading={deleteAdminMutation.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            deleteAdminMutation.mutate(toDelete.id, {
              onSuccess: () => setToDelete(null),
            });
          }
        }}
      />
    </Box>
  );
}
