const raw = (import.meta.env.VITE_DEFAULT_STREAM_URL as string) || "http://127.0.0.1:8889/cam/index.m3u8";
// Normalize common mistaken hostnames (0.0.0.0 / 0.0.0.1) to localhost
export const DEFAULT_STREAM_URL = raw.replace(/^https?:\/\/0\.0\.0\.1/, s => s.replace('0.0.0.1', '127.0.0.1')).replace(/^https?:\/\/0\.0\.0\.0/, s => s.replace('0.0.0.0', '127.0.0.1'));
