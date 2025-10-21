export default function useApi() {
	const base = useRuntimeConfig().public.apiBase

	async function csrf() {
		await $fetch('/sanctum/csrf-cookie', { baseURL: base, credentials: 'include' })
	}
	function xsrfHeader() {
		return { 'X-XSRF-TOKEN': decodeURIComponent(useCookie('XSRF-TOKEN').value || '') }
	}

	async function get<T>(url: string, opts: any = {}, credentials: RequestCredentials = 'omit') {
		return await $fetch<T>(url, { baseURL: base, credentials, ...opts })
	  }

	async function post<T>(url: string, body?: any) {
		await csrf()
		const token = decodeURIComponent(useCookie('XSRF-TOKEN').value || '');
		return await $fetch<T>(url, {
			method: 'POST',
			body,
			baseURL: base,
			credentials: 'include',
			headers: {
				'X-XSRF-TOKEN': token,
				'Accept': 'application/json',
			}
		})
		}

	return { get, post, csrf }
}