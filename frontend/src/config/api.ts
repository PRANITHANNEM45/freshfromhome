// In production, when NEXT_PUBLIC_API_URL is set, requests go directly to the cloud backend API.
// When unset (or in local dev), requests use relative /api paths which are proxied via Next.js rewrites.
const rawUrl = process.env.NEXT_PUBLIC_API_URL || '';
export const API_URL = rawUrl ? rawUrl.replace(/\/$/, '') : '';
