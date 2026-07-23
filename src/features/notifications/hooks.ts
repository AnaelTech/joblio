import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	fetchNotifications,
	fetchUnreadCount,
	markAllNotificationsRead,
	markNotificationRead,
} from "./api";

const NOTIFICATIONS_KEY = "notifications";

export function useNotifications() {
	return useQuery({
		queryKey: [NOTIFICATIONS_KEY],
		queryFn: fetchNotifications,
	});
}

export function useUnreadCount() {
	return useQuery({
		queryKey: [NOTIFICATIONS_KEY, "unread-count"],
		queryFn: fetchUnreadCount,
		refetchInterval: 30000,
	});
}

export function useMarkRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => markNotificationRead(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
		},
	});
}

export function useMarkAllRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: markAllNotificationsRead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
		},
	});
}
