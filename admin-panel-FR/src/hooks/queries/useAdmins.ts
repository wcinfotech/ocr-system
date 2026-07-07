import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminsService, type AdminPayload } from "@/services/admin.service";
import { queryKeys } from "@/hooks/queries/queryKeys";
import type { ListParams } from "@/types";
import { isApiError } from "@/services/api/client";

const errMsg = (e: unknown, fallback: string) => (isApiError(e) ? e.message : fallback);

export const useAdmins = (params: ListParams) =>
  useQuery({
    queryKey: queryKeys.admins.list(params),
    queryFn: () => adminsService.list(params),
    placeholderData: keepPreviousData,
  });

export const useCreateAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminPayload) => adminsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admins.all });
      toast.success("Admin account created successfully");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to create admin")),
  });
};

export const useUpdateAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminPayload> }) =>
      adminsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admins.all });
      toast.success("Admin account updated successfully");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to update admin")),
  });
};

export const useDeleteAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admins.all });
      toast.success("Admin account deleted");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to delete admin")),
  });
};

export const useRoles = () =>
  useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: () => adminsService.listRoles(),
  });

export const usePermissions = () =>
  useQuery({
    queryKey: queryKeys.permissions.all,
    queryFn: () => adminsService.listPermissions(),
  });
