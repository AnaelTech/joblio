import {
	AlertCircle,
	Bell,
	Check,
	Database,
	ExternalLink,
	Loader2,
	Lock,
	Monitor,
	Moon,
	Palette,
	Shield,
	Sun,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UserSettings } from "@/features/settings/api";
import { fetchSettings } from "@/features/settings/api";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import {
	useChangePassword,
	useUpdateNotificationPreferences,
	useUpdateProfile,
} from "@/features/settings/hooks";
import {
	subscribeToPush,
	unsubscribeFromPush,
} from "@/features/notifications/components/PushSetup";

type Theme = "system" | "light" | "dark";

function getSystemTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function getStoredTheme(): Theme {
	if (typeof window === "undefined") return "system";
	return (localStorage.getItem("theme") as Theme) ?? "system";
}

function applyTheme(resolved: "light" | "dark") {
	document.documentElement.classList.toggle("dark", resolved === "dark");
}

const themes = [
	{ value: "system" as const, label: "Système", icon: Monitor },
	{ value: "light" as const, label: "Clair", icon: Sun },
	{ value: "dark" as const, label: "Sombre", icon: Moon },
];

interface Props {
	user: {
		id: string;
		name: string;
		email: string;
	};
	dbVersion: string;
}

function SettingsPageInner({ user, dbVersion }: Props) {
	const updateProfileMutation = useUpdateProfile();
	const changePasswordMutation = useChangePassword();
	const updateNotificationsMutation = useUpdateNotificationPreferences();

	const [settings, setSettings] = useState<UserSettings | null>(null);
	const [loadingSettings, setLoadingSettings] = useState(true);

	const [profileName, setProfileName] = useState(user.name);
	const [profileEmail, setProfileEmail] = useState(user.email);
	const [profileSaving, setProfileSaving] = useState(false);
	const [profileFeedback, setProfileFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordSaving, setPasswordSaving] = useState(false);
	const [passwordFeedback, setPasswordFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const [notifyFollowUp, setNotifyFollowUp] = useState(false);
	const [notifyInterview, setNotifyInterview] = useState(false);
	const [notifSaving, setNotifSaving] = useState(false);
	const [notifFeedback, setNotifFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const [pushEnabled, setPushEnabled] = useState(false);
	const [pushSaving, setPushSaving] = useState(false);

	const [theme, setThemeState] = useState<Theme>(getStoredTheme);
	const [resolved, setResolved] = useState<"light" | "dark">(() => {
		const t = getStoredTheme();
		return t === "system" ? getSystemTheme() : t;
	});

	useEffect(() => {
		fetchSettings()
			.then((s) => {
				setSettings(s);
				setNotifyFollowUp(s.notifyFollowUp);
				setNotifyInterview(s.notifyInterview);
			})
			.catch(() => {})
			.finally(() => setLoadingSettings(false));
	}, []);

	useEffect(() => {
		if (!("Notification" in window)) return;
		setPushEnabled(Notification.permission === "granted");
	}, []);

	const setTheme = (t: Theme) => {
		localStorage.setItem("theme", t);
		setThemeState(t);
		const r = t === "system" ? getSystemTheme() : t;
		setResolved(r);
		applyTheme(r);
	};

	useEffect(() => {
		if (theme !== "system") return;
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => {
			const r = getSystemTheme();
			setResolved(r);
			applyTheme(r);
		};
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, [theme]);

	const handleProfileSave = () => {
		setProfileSaving(true);
		setProfileFeedback(null);

		const data: Record<string, unknown> = {};
		if (profileName !== user.name) data.name = profileName;
		if (profileEmail !== user.email) data.email = profileEmail;

		if (Object.keys(data).length === 0) {
			setProfileSaving(false);
			return;
		}

		updateProfileMutation.mutate(data, {
			onSettled: () => setProfileSaving(false),
			onSuccess: () => {
				setProfileFeedback({ type: "success", message: "Profil mis à jour" });
				setTimeout(() => setProfileFeedback(null), 4000);
			},
			onError: (e) =>
				setProfileFeedback({
					type: "error",
					message: e instanceof Error ? e.message : "Erreur réseau",
				}),
		});
	};

	const handlePasswordChange = () => {
		if (newPassword !== confirmPassword) {
			setPasswordFeedback({
				type: "error",
				message: "Les mots de passe ne correspondent pas",
			});
			return;
		}
		if (newPassword.length < 6) {
			setPasswordFeedback({
				type: "error",
				message: "Le mot de passe doit contenir au moins 6 caractères",
			});
			return;
		}

		setPasswordSaving(true);
		setPasswordFeedback(null);

		changePasswordMutation.mutate(
			{ currentPassword, newPassword },
			{
				onSettled: () => setPasswordSaving(false),
				onSuccess: () => {
					setPasswordFeedback({
						type: "success",
						message: "Mot de passe modifié",
					});
					setCurrentPassword("");
					setNewPassword("");
					setConfirmPassword("");
					setTimeout(() => setPasswordFeedback(null), 4000);
				},
				onError: (e) =>
					setPasswordFeedback({
						type: "error",
						message: e instanceof Error ? e.message : "Erreur réseau",
					}),
			},
		);
	};

	const handleNotificationChange = (
		key: "notifyFollowUp" | "notifyInterview",
		value: boolean,
	) => {
		const update = { notifyFollowUp, notifyInterview, [key]: value };
		setNotifSaving(true);
		setNotifFeedback(null);

		if (key === "notifyFollowUp") setNotifyFollowUp(value);
		else setNotifyInterview(value);

		updateNotificationsMutation.mutate(update, {
			onSettled: () => setNotifSaving(false),
			onSuccess: () => {
				setNotifFeedback({
					type: "success",
					message: "Préférences mises à jour",
				});
				setTimeout(() => setNotifFeedback(null), 4000);
			},
			onError: () => {
				if (key === "notifyFollowUp") setNotifyFollowUp(!value);
				else setNotifyInterview(!value);
				setNotifFeedback({
					type: "error",
					message: "Erreur lors de la mise à jour",
				});
			},
		});
	};

	const handlePushToggle = async (enabled: boolean) => {
		setPushSaving(true);
		try {
			if (enabled) {
				await subscribeToPush();
				fetch("/api/push/test", { method: "POST" }).catch(() => {});
			} else {
				await unsubscribeFromPush();
			}
			setPushEnabled(enabled);
		} catch {
			setPushEnabled(!enabled);
		}
		setPushSaving(false);
	};

	const checkboxClass =
		"relative h-5 w-9 cursor-pointer rounded-full transition-colors bg-muted has-[input:checked]:bg-primary";

	const thumbClass =
		"pointer-events-none h-5 w-5 rounded-full bg-card shadow-sm transition-transform translate-x-0 has-[input:checked]:translate-x-4";

	return (
		<div class="mx-auto max-w-3xl">
			<div class="mb-8">
				<h1 class="text-2xl font-bold tracking-tight">Paramètres</h1>
				<p class="text-muted-foreground">
					Gérez votre compte et vos préférences
				</p>
			</div>

			<div class="space-y-10">
				<Card>
					<CardHeader>
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
								<User class="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle>Profil</CardTitle>
								<CardDescription>
									Informations personnelles et email
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{profileFeedback && (
							<div
								class={`mb-4 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${
									profileFeedback.type === "success"
										? "bg-green-500/10 text-green-600"
										: "bg-red-500/10 text-red-600"
								}`}
							>
								{profileFeedback.type === "success" ? (
									<Check class="h-3.5 w-3.5" />
								) : (
									<AlertCircle class="h-3.5 w-3.5" />
								)}
								{profileFeedback.message}
							</div>
						)}
						<div class="space-y-4">
							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label class="mb-1.5 block text-sm font-medium">Nom</label>
									<input
										type="text"
										value={profileName}
										onChange={(e) => setProfileName(e.target.value)}
										disabled={profileSaving}
										class="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
									/>
								</div>
								<div>
									<label class="mb-1.5 block text-sm font-medium">Email</label>
									<input
										type="email"
										value={profileEmail}
										onChange={(e) => setProfileEmail(e.target.value)}
										disabled={profileSaving}
										class="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
									/>
								</div>
							</div>
							<div class="flex justify-end">
								<Button
									size="sm"
									disabled={
										profileSaving ||
										(profileName === user.name && profileEmail === user.email)
									}
									onClick={handleProfileSave}
								>
									{profileSaving ? (
										<Loader2 class="h-3.5 w-3.5 animate-spin" />
									) : (
										<Check class="h-3.5 w-3.5" />
									)}
									Enregistrer
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
								<Lock class="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle>Mot de passe</CardTitle>
								<CardDescription>Modifier votre mot de passe</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{passwordFeedback && (
							<div
								class={`mb-4 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${
									passwordFeedback.type === "success"
										? "bg-green-500/10 text-green-600"
										: "bg-red-500/10 text-red-600"
								}`}
							>
								{passwordFeedback.type === "success" ? (
									<Check class="h-3.5 w-3.5" />
								) : (
									<AlertCircle class="h-3.5 w-3.5" />
								)}
								{passwordFeedback.message}
							</div>
						)}
						<div class="space-y-4">
							<div>
								<label class="mb-1.5 block text-sm font-medium">
									Mot de passe actuel
								</label>
								<input
									type="password"
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									disabled={passwordSaving}
									class="h-8 w-full max-w-xs min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
								/>
							</div>
							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label class="mb-1.5 block text-sm font-medium">
										Nouveau mot de passe
									</label>
									<input
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										disabled={passwordSaving}
										class="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
									/>
								</div>
								<div>
									<label class="mb-1.5 block text-sm font-medium">
										Confirmer le mot de passe
									</label>
									<input
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										disabled={passwordSaving}
										class="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
									/>
								</div>
							</div>
							<div class="flex justify-end">
								<Button
									size="sm"
									disabled={
										passwordSaving ||
										!currentPassword ||
										!newPassword ||
										!confirmPassword
									}
									onClick={handlePasswordChange}
								>
									{passwordSaving ? (
										<Loader2 class="h-3.5 w-3.5 animate-spin" />
									) : (
										<Check class="h-3.5 w-3.5" />
									)}
									Modifier le mot de passe
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
								<Palette class="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle>Apparence</CardTitle>
								<CardDescription>
									Thème et préférences visuelles
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div>
								<label class="mb-1.5 block text-sm font-medium">Thème</label>
								<div class="flex flex-col gap-2 sm:flex-row sm:gap-2">
									{themes.map((t) => {
										const Icon = t.icon;
										const selected = theme === t.value;
										return (
											<button
												key={t.value}
												onClick={() => setTheme(t.value)}
												class={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
													selected
														? "border-primary bg-primary/5 text-primary"
														: "border-input text-foreground hover:border-foreground/30"
												}`}
											>
												<Icon class="h-4 w-4" />
												{t.label}
											</button>
										);
									})}
								</div>
								<p class="mt-2 text-xs text-muted-foreground">
									{resolved === "dark"
										? "🌙 Thème sombre actif"
										: "☀️ Thème clair actif"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
								<Bell class="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle>Notifications</CardTitle>
								<CardDescription>Alertes et rappels</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{notifFeedback && (
							<div
								class={`mb-4 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${
									notifFeedback.type === "success"
										? "bg-green-500/10 text-green-600"
										: "bg-red-500/10 text-red-600"
								}`}
							>
								{notifFeedback.type === "success" ? (
									<Check class="h-3.5 w-3.5" />
								) : (
									<AlertCircle class="h-3.5 w-3.5" />
								)}
								{notifFeedback.message}
							</div>
						)}
						<div class="space-y-3">
							<label class="flex items-center justify-between rounded-lg border p-3">
								<div>
									<p class="text-sm font-medium">Relances automatiques</p>
									<p class="text-xs text-muted-foreground">
										Recevoir un rappel pour les candidatures à relancer
									</p>
								</div>
								<div class={checkboxClass}>
									<input
										type="checkbox"
										role="switch"
										class="sr-only"
										checked={notifyFollowUp}
										disabled={notifSaving || loadingSettings}
										onChange={(e) =>
											handleNotificationChange(
												"notifyFollowUp",
												e.target.checked,
											)
										}
									/>
									<div class={thumbClass} />
								</div>
							</label>
							<label class="flex items-center justify-between rounded-lg border p-3">
								<div>
									<p class="text-sm font-medium">Entretiens à venir</p>
									<p class="text-xs text-muted-foreground">
										Notification la veille d'un entretien planifié
									</p>
								</div>
								<div class={checkboxClass}>
									<input
										type="checkbox"
										role="switch"
										class="sr-only"
										checked={notifyInterview}
										disabled={notifSaving || loadingSettings}
										onChange={(e) =>
											handleNotificationChange(
												"notifyInterview",
												e.target.checked,
											)
										}
									/>
									<div class={thumbClass} />
								</div>
							</label>
							<label class="flex items-center justify-between rounded-lg border p-3">
								<div>
									<p class="text-sm font-medium">Notifications push</p>
									<p class="text-xs text-muted-foreground">
										Recevoir des notifications même en dehors du navigateur
									</p>
								</div>
								<div class={checkboxClass}>
									<input
										type="checkbox"
										role="switch"
										class="sr-only"
										checked={pushEnabled}
										disabled={pushSaving}
										onChange={(e) => handlePushToggle(e.target.checked)}
									/>
									<div class={thumbClass} />
								</div>
							</label>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
								<Database class="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle>Base de données</CardTitle>
								<CardDescription>Informations sur la connexion</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<dl class="space-y-2 text-sm">
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Type</dt>
								<dd class="font-medium">PostgreSQL</dd>
							</div>
							<Separator />
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Version</dt>
								<dd class="font-medium">{dbVersion}</dd>
							</div>
						</dl>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
								<Shield class="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle>À propos</CardTitle>
								<CardDescription>Joblio - ATS open source</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Joblio est un Applicant Tracking System moderne, auto-hébergé et
							respectueux de la vie privée. Construit avec Astro, React,
							PostgreSQL et TailwindCSS.
						</p>
						<div class="mt-4 flex gap-3">
							<a
								href="https://github.com"
								target="_blank"
								class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
								rel="noopener"
							>
								GitHub <ExternalLink class="h-3.5 w-3.5" />
							</a>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default function SettingsPage({ user, dbVersion }: Props) {
	return (
		<QueryClientProvider client={queryClient}>
			<SettingsPageInner user={user} dbVersion={dbVersion} />
		</QueryClientProvider>
	);
}
