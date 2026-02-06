import axios from "axios";
import type { NextRequest } from "next/server";
import { API_BASE_URL } from "./config";

/**
 * Create an Axios client for use inside Next.js route handlers.
 * It forwards the Authorization header from the incoming request
 * to the FastAPI backend.
 */
export function createApiClientFromRequest(req: NextRequest) {
  const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
  });

  // Forward bearer token if present
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    api.defaults.headers.common["Authorization"] = authHeader;
  }

  return api;
}
