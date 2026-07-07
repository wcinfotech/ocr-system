import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { toQuery } from "@/services/api/query";
import type { ListParams, Paginated, Ticket } from "@/types";

export interface ReplyTicketPayload {
  reply: string;
  close?: boolean;
}

export const supportService = {
  list: async (params: ListParams): Promise<Paginated<Ticket>> => {
    const { data } = await apiClient.get<Paginated<Ticket>>(ENDPOINTS.support.list, {
      params: toQuery(params),
    });
    return data;
  },
  detail: async (id: string): Promise<Ticket> => {
    const { data } = await apiClient.get<Ticket>(ENDPOINTS.support.detail(id));
    return data;
  },
  reply: async (id: string, payload: ReplyTicketPayload): Promise<void> => {
    await apiClient.post(ENDPOINTS.support.reply(id), payload);
  },
};
