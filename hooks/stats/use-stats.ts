import {
  useQuery,
  type UseQueryResult,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getStatOverview,
  GetStatOverviewResponse,
  StatOverviewTimeRangeParams,
  StatOverview,
} from "@/services/stats/service";

export const useStatOverview = (
  params: StatOverviewTimeRangeParams,
): UseQueryResult<StatOverview> => {
  return useQuery<StatOverview>({
    queryKey: ["stat-overview", params],
    queryFn: async () => {
      const data: GetStatOverviewResponse = await getStatOverview(params);

      return {
        timeRange: {
          year: data.time_range.year,
          month: data.time_range.month,
          day: data.time_range.day,
          startUtc: data.time_range.start_utc,
          endUtc: data.time_range.end_utc,
        },
        sockets: {
          activeSessions: data.sockets.active_sessions,
        },
        chatContacts: {
          totalInSystem: data.chat_contacts.total_in_system,
        },
        conversations: {
          totalInRange: data.conversations.total_in_range,
          aiActive: data.conversations.ai_active,
          aiInactive: data.conversations.ai_inactive,
        },
        messages: {
          totalInRange: data.messages.total_in_range,
          aiMessages: data.messages.ai_messages,
          staffMessages: data.messages.staff_messages,
          userMessages: data.messages.user_messages,
        },
      };
    },
    staleTime: 1 * 60 * 1000,
    retry: false,
    placeholderData: keepPreviousData,
  });
};
