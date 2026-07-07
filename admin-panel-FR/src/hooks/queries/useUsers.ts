import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { usersService } from "@/services/dashboard.service";
import { queryKeys } from "@/hooks/queries/queryKeys";
import type { ListParams, User } from "@/types";
import { isApiError } from "@/services/api/client";

const errMsg = (e: unknown, fallback: string) => (isApiError(e) ? e.message : fallback);

export const useUsers = (params: ListParams) =>
  useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersService.list(params),
    placeholderData: keepPreviousData,
  });

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) =>
      usersService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User updated");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to update user")),
  });
};

export const useSuspendUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.suspend(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User suspended");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to suspend user")),
  });
};

export const useActivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User activated");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to activate user")),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User deleted");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to delete user")),
  });
};
