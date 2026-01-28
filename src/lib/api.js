/**
 * API fetch helper for VITE_API_URL requests.
 * Centralizes base URL usage, JSON headers, optional Authorization,
 * and normalized error handling.
 */
export const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

/**
 * apiFetch - wrapper around fetch that prefixes the API base, sets JSON
 * headers, optionally injects a Bearer token, and throws on non-OK responses.
 *
 * @param {string} path - Path w '/' (e.g. '/puzzles') or a full URL
 * @param {object} options - fetch options (method, body, headers...+)
 * @param {string} [token] - Bearer token to include in Authorization header (not required)
 */
export async function apiFetch(path, options = {}, token) {
  const url = /^https?:\/\//i.test(path) ? path : `${API_BASE}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  // Read text to avoid JSON.parse throwing on empty responses
  const text = await res.text().catch(() => "");
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // If body isn't JSON, keep raw text
    data = text;
  }

  if (!res.ok) {
    (data && (data.error || data.message)) ||
      (text && text.trim()) ||
      `Request failed (${res.status})`;

    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}
