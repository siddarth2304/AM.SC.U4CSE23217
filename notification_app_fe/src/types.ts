export type NotificationType = "Placement" | "Result" | "Event";
export type FilterType = NotificationType | "All";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  viewed: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    type?: string;
    responseTimeMs?: number;
  };
  error?: {
    code: string;
    message: string;
  };
};
