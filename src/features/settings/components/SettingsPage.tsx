import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Palette,
  Bell,
  Database,
  ExternalLink,
  Shield,
  Monitor,
  Sun,
  Moon,
} from "lucide-react";

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

export default function SettingsPage() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [resolved, setResolved] = useState<"light" | "dark">(() => {
    const t = getStoredTheme();
    return t === "system" ? getSystemTheme() : t;
  });

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

  return (
    <div class="mx-auto max-w-3xl">
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p class="text-muted-foreground">Gérez votre compte et vos préférences</p>
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
                <CardDescription>Informations personnelles et email</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-sm font-medium">Email</label>
                  <input type="email" value="admin@joblio.app" disabled
                    class="h-8 w-full min-w-0 rounded-lg border border-input bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground" />
                </div>
              </div>
              <p class="text-xs text-muted-foreground">
                L'authentification sera disponible dans une version future.
              </p>
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
                <CardDescription>Thème et préférences visuelles</CardDescription>
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
                  {resolved === "dark" ? "🌙 Thème sombre actif" : "☀️ Thème clair actif"}
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
            <div class="space-y-3">
              <label class="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p class="text-sm font-medium">Relances automatiques</p>
                  <p class="text-xs text-muted-foreground">Recevoir un rappel pour les candidatures à relancer</p>
                </div>
                <div class="relative h-5 w-9 rounded-full bg-muted transition-colors has-[input:checked]:bg-primary">
                  <input type="checkbox" role="switch" class="sr-only" />
                  <div class="h-5 w-5 rounded-full bg-card shadow-sm transition-transform translate-x-0 has-[input:checked]:translate-x-4" />
                </div>
              </label>
              <label class="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p class="text-sm font-medium">Entretiens à venir</p>
                  <p class="text-xs text-muted-foreground">Notification la veille d'un entretien planifié</p>
                </div>
                <div class="relative h-5 w-9 rounded-full bg-muted transition-colors has-[input:checked]:bg-primary">
                  <input type="checkbox" role="switch" class="sr-only" />
                  <div class="h-5 w-5 rounded-full bg-card shadow-sm transition-transform translate-x-0 has-[input:checked]:translate-x-4" />
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
                <dd class="font-medium">1.0.0</dd>
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
              Joblio est un Applicant Tracking System moderne, auto-hébergé et respectueux de la vie privée.
              Construit avec Astro, React, PostgreSQL et TailwindCSS.
            </p>
            <div class="mt-4 flex gap-3">
              <a href="https://github.com" target="_blank" class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input px-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
                GitHub <ExternalLink class="h-3.5 w-3.5" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
