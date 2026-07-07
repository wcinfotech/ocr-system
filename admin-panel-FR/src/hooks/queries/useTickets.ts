import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { supportService, type ReplyTicketPayload } from "@/services/support.service";
import { queryKeys } from "@/hooks/queries/queryKeys";
import type { ListParams } from "@/types";
import { isApiError } from "@/services/api/client";

const errMsg = (e: unknown, fallback: string) => (isApiError(e) ? e.message : fallback);

export const useTickets = (params: ListParams) =>
  useQuery({
    queryKey: queryKeys.tickets.list(params),
    queryFn: () => supportService.list(params),
    placeholderData: keepPreviousData,
  });

export const useTicketDetail = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: () => supportService.detail(id),
    enabled: !!id && enabled,
  });

export const useReplyTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReplyTicketPayload }) =>
      supportService.reply(id, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.tickets.all });
      toast.success(variables.payload.close ? "Ticket updated and closed" : "Reply submitted");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to reply to ticket")),
  });
};
