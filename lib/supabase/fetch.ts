/** Prevent Next.js from caching Supabase REST responses in Server Components. */
export function supabaseFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  return fetch(input, {
    ...init,
    cache: "no-store",
  });
}
