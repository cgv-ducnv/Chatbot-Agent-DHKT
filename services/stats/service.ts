import apiClient from "@/lib/api-client";

export interface StatOverviewTimeRangeParams {
  year: number;
  month: number;
  day?: number;
}

export interface GetStatOverviewResponse {
  time_range: {
    year: number;
    month: number;
    day: number | null;
    start_utc: string;
    end_utc: string;
  };
  sockets: {
    active_sessions: number;
  };
  chat_contacts: {
    total_in_system: number;
  };
  conversations: {
    total_in_range: number;
    ai_active: number;
    ai_inactive: number;
  };
  messages: {
    total_in_range: number;
    ai_messages: number;
    staff_messages: number;
    user_messages: number;
  };
}

export interface StatOverview {
  timeRange: {
    year: number;
    month: number;
    day: number | null;
    startUtc: string;
    endUtc: string;
  };
  sockets: {
    activeSessions: number;
  };
  chatContacts: {
    totalInSystem: number;
  };
  conversations: {
    totalInRange: number;
    aiActive: number;
    aiInactive: number;
  };
  messages: {
    totalInRange: number;
    aiMessages: number;
    staffMessages: number;
    userMessages: number;
  };
}

export const getStatOverview = async (
  params: StatOverviewTimeRangeParams,
): Promise<GetStatOverviewResponse> => {
  const response = await apiClient.get<GetStatOverviewResponse>(
    "/stats/overview",
    { params },
  );
  return response.data;
};
