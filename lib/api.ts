// Default to the backend's development port if no environment variable is provided
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5124/api";
