import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  plansService,
  subscriptionsService,
  billsService,
  type PlanPayload,
} from "@/services/catalog.service";
import { queryKeys } from "@/hooks/queries/queryKeys";
import { isApiError } from "@/services/api/client";
import type { ListParams } from "@/types";

const errMsg = (e: unknown, fallback: string) => (isApiError(e) ? e.message : fallback);

/* ---------------- Plans ---------------- */
export const usePlans = (params: ListParams) =>
  useQuery({
    queryKey: queryKeys.plans.list(params),
    queryFn: () => plansService.list(params),
    placeholderData: keepPreviousData,
  });

export const useCreatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlanPayload) => plansService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.plans.all });
      toast.success("Plan created");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to create plan")),
  });
};

export const useUpdatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PlanPayload }) =>
      plansService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.plans.all });
      toast.success("Plan updated");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to update plan")),
  });
};

export const useDeletePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.plans.all });
      toast.success("Plan deleted");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to delete plan")),
  });
};

/* ---------------- Subscriptions ---------------- */
export const useSubscriptions = (params: ListParams) =>
  useQuery({
    queryKey: queryKeys.subscriptions.list(params),
    queryFn: () => subscriptionsService.list(params),
    placeholderData: keepPreviousData,
  });

export const useSubscriptionAction = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
  return {
    renew: useMutation({
      mutationFn: (id: string) => subscriptionsService.renew(id),
      onSuccess: () => {
        invalidate();
        toast.success("Subscription renewed");
      },
      onError: (e) => toast.error(errMsg(e, "Failed to renew")),
    }),
    expire: useMutation({
      mutationFn: (id: string) => subscriptionsService.expire(id),
      onSuccess: () => {
        invalidate();
        toast.success("Subscription expired");
      },
      onError: (e) => toast.error(errMsg(e, "Failed to expire")),
    }),
    cancel: useMutation({
      mutationFn: (id: string) => subscriptionsService.cancel(id),
      onSuccess: () => {
        invalidate();
        toast.success("Subscription canceled");
      },
      onError: (e) => toast.error(errMsg(e, "Failed to cancel")),
    }),
  };
};

/* ---------------- Bills ---------------- */
export const useBills = (params: ListParams) =>
  useQuery({
    queryKey: queryKeys.bills.list(params),
    queryFn: () => billsService.list(params),
    placeholderData: keepPreviousData,
  });

export const useDeleteBill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bills.all });
      toast.success("Bill deleted");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to delete bill")),
  });
};

export const useRestoreBill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billsService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bills.all });
      toast.success("Bill restored");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to restore bill")),
  });
};
