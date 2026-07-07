import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { toQuery } from "@/services/api/query";
import type { ListParams, Paginated, Plan, Subscription, Bill } from "@/types";

export interface PlanPayload {
  name: string;
  price: number;
  currency: string;
  ocrLimit: number;
  storageMb: number;
  durationDays: number;
  benefits: string[];
  status: Plan["status"];
}

export const plansService = {
  list: async (params: ListParams): Promise<Paginated<Plan>> => {
    const { data } = await apiClient.get<Paginated<Plan>>(ENDPOINTS.plans.list, {
      params: toQuery(params),
    });
    return data;
  },
  create: async (payload: PlanPayload): Promise<Plan> => {
    const { data } = await apiClient.post<Plan>(ENDPOINTS.plans.list, payload);
    return data;
  },
  update: async (id: string, payload: PlanPayload): Promise<Plan> => {
    const { data } = await apiClient.put<Plan>(ENDPOINTS.plans.detail(id), payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.plans.detail(id));
  },
};

export const subscriptionsService = {
  list: async (params: ListParams): Promise<Paginated<Subscription>> => {
    const { data } = await apiClient.get<Paginated<Subscription>>(ENDPOINTS.subscriptions.list, {
      params: toQuery(params),
    });
    return data;
  },
  assign: async (payload: { userId: string; planId: string }): Promise<Subscription> => {
    const { data } = await apiClient.post<Subscription>(ENDPOINTS.subscriptions.assign, payload);
    return data;
  },
  renew: async (id: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.subscriptions.renew(id));
  },
  expire: async (id: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.subscriptions.expire(id));
  },
  cancel: async (id: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.subscriptions.cancel(id));
  },
};

export const billsService = {
  list: async (params: ListParams): Promise<Paginated<Bill>> => {
    const { data } = await apiClient.get<Paginated<Bill>>(ENDPOINTS.bills.list, {
      params: toQuery(params),
    });
    return data;
  },
  detail: async (id: string): Promise<Bill> => {
    const { data } = await apiClient.get<Bill>(ENDPOINTS.bills.detail(id));
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.bills.detail(id));
  },
  restore: async (id: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.bills.restore(id));
  },
};
