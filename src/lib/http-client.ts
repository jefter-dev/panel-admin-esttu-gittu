"use client";

import axios from "axios";
import { SessionAdapter } from "@/lib/session-adapter";

/**
 * @summary Creates a pre-configured Axios instance for API requests.
 * @description Using a dedicated instance ensures interceptors do not affect
 * other Axios calls in third-party libraries.
 */
export const apiClient = axios.create({
  /**
   * @description Base URL for all requests using this client.
   * Allows calling `apiClient.get('/users')` instead of full path `/api/users`.
   */
  baseURL: "/api",
});

/**
 * @summary Axios request interceptor to attach access token to requests.
 * @param config {import('axios').AxiosRequestConfig} The Axios request configuration object.
 * @returns {Promise<import('axios').AxiosRequestConfig>} Modified config with Authorization header if token exists.
 */
apiClient.interceptors.request.use(
  async (config) => {
    // 1. Get access token from cookie using SessionAdapter.
    const accessToken = await SessionAdapter.getAccessToken();

    // 2. Attach token to Authorization header if present.
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // 3. Return modified or original config to continue the request.
    return config;
  },
  (error) => {
    // Reject the promise if any error occurs while setting up the request.
    return Promise.reject(error);
  }
);
