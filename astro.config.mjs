// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import { VitePWA } from "vite-plugin-pwa";

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [
			tailwindcss(),
			VitePWA({
				strategies: "injectManifest",
				srcDir: "src",
				filename: "sw.ts",
				registerType: "autoUpdate",
				injectRegister: null,
				devOptions: {
					enabled: true,
					type: "module",
				},
				manifest: {
					name: "Joblio",
					short_name: "Joblio",
					description: "Suivi de candidatures — ATS moderne et auto-hébergé",
					start_url: "/",
					scope: "/",
					display: "standalone",
					orientation: "any",
					theme_color: "#059669",
					background_color: "#fafaf9",
					categories: ["productivity", "business"],
					lang: "fr",
					icons: [
						{
							src: "/pwa-icons/icon-192x192.png",
							sizes: "192x192",
							type: "image/png",
						},
						{
							src: "/pwa-icons/icon-512x512.png",
							sizes: "512x512",
							type: "image/png",
						},
						{
							src: "/pwa-icons/maskable-192x192.png",
							sizes: "192x192",
							type: "image/png",
							purpose: "maskable",
						},
						{
							src: "/pwa-icons/maskable-512x512.png",
							sizes: "512x512",
							type: "image/png",
							purpose: "maskable",
						},
					],
				},
				injectManifest: {},
			}),
		],
	},

	integrations: [react()],
});
