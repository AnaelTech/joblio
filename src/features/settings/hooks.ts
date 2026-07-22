import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	changePasswordApi,
	updateNotificationPreferencesApi,
	updateProfileApi,
} from "./api";

export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Record<string, unknown>) => updateProfileApi(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["companies"] });
		},
	});
}

export function useChangePassword() {
	return useMutation({
		mutationFn: (data: { currentPassword: string; newPassword: string }) =>
			changePasswordApi(data),
	});
}

export function useUpdateNotificationPreferences() {
	return useMutation({
		mutationFn: (data: {
			notifyFollowUp?: boolean;
			notifyInterview?: boolean;
		}) => updateNotificationPreferencesApi(data),
	});
}
