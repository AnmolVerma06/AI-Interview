export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export type ApiOptions = RequestInit & { cookiesHeader?: string };

export async function api(path: string, options: ApiOptions = {}) {
	const url = `${API_BASE_URL}${path}`;
	const headers: HeadersInit = {
		"Content-Type": "application/json",
		...(options.headers || {}),
	};
	if (options.cookiesHeader) {
		(headers as Record<string, string>)["Cookie"] = options.cookiesHeader;
	}

	try {
		const res = await fetch(url, {
			method: options.method || "GET",
			credentials: "include",
			headers,
			body: options.body,
			next: { revalidate: 0 },
		});

		// Handle 401 Unauthorized specifically
		if (res.status === 401) {
			// Clear any existing session
			if (typeof document !== 'undefined') {
				document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			}
			throw new Error("Unauthorized");
		}

		if (!res.ok) {
			const text = await res.text().catch(() => "");
			throw new Error(text || `API error ${res.status}`);
		}

		// try to parse json, fallback to null
		try {
			return await res.json();
		} catch {
			return null;
		}
	} catch (error) {
		// Re-throw the error to be handled by the caller
		throw error;
	}
}
