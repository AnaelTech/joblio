import { defineMiddleware } from "astro:middleware";
import { getSession, hasUsers } from "@/features/auth/actions";

const PUBLIC_ROUTES = new Set(["/login", "/setup"]);

export const onRequest = defineMiddleware(async (context, next) => {
	const { url, cookies, redirect } = context;
	const pathname = url.pathname;

	if (pathname.startsWith("/_astro") || pathname.startsWith("/uploads") || pathname.startsWith("/favicon")) {
		return next();
	}

	const usersExist = await hasUsers();

	if (!usersExist && pathname !== "/setup") {
		return redirect("/setup");
	}

	if (PUBLIC_ROUTES.has(pathname)) {
		return next();
	}

	const token = cookies.get("session")?.value;
	const user = await getSession(token);

	if (!user) {
		return redirect("/login");
	}

	context.locals.user = user;

	return next();
});
