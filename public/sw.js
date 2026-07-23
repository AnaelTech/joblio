const CACHE = "joblio-v1";

self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
		),
	);
	self.clients.claim();
});

self.addEventListener("message", (event) => {
	if (event.data?.type === "SHOW_NOTIFICATION") {
		const { title, options } = event.data.payload;
		self.registration.showNotification(title, options);
	}
});

self.addEventListener("push", (event) => {
	if (!event.data) return;

	const data = event.data.json();
	const title = data.title || "Joblio";
	const options = {
		body: data.body || "",
		icon: "/pwa-icons/icon-192x192.png",
		badge: "/pwa-icons/maskable-192x192.png",
		data: data.url ? { url: data.url } : undefined,
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	const url = event.notification.data?.url;
	if (url) {
		event.waitUntil(clients.openWindow(url));
	}
});
