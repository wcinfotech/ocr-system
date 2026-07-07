import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { logsService, type SystemSettings } from "@/services/logs.service";
import { queryKeys } from "@/hooks/queries/queryKeys";
import type { ListParams } from "@/types";
import toast from "react-hot-toast";

export const useActivityLogs = (params: ListParams) =>
  useQuery({
    queryKey: queryKeys.activityLogs.list(params),
    queryFn: () => logsService.listActivityLogs(params),
    placeholderData: keepPreviousData,
  });

export const useAuditLogs = (params: ListParams) =>
  useQuery({
    queryKey: queryKeys.auditLogs.list(params),
    queryFn: () => logsService.listAuditLogs(params),
    placeholderData: keepPreviousData,
  });

export const useSettings = () =>
  useQuery({
    queryKey: queryKeys.settings.all,
    queryFn: () => logsService.getSettings(),
  });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: SystemSettings) => logsService.updateSettings(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.all });
      toast.success("System settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update system settings");
    },
  });
};
