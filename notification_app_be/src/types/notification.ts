export type NotificationType = "Placement" | "Result" | "Event";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  viewed: boolean;
};

export type NotificationInput = {
  title: string;
  message: string;
  type: NotificationType;
};

export type NotificationQuery = {
  type?: NotificationType;
  page: number;
  limit: number;
};
