import { AxiosInstance, AxiosRequestConfig } from "axios";
import { NeverRekt } from "./types";

async function api<Response, Params>(
  axios: AxiosInstance,
  method: NeverRekt.Method,
  endpoint: string,
  params: Params,
  config: AxiosRequestConfig
) {
  const axiosReducer = {
    async GET() {
      try {
        return await axios.get<Response>(endpoint, { ...config, params });
      } catch (e) {
        throw e;
      }
    },
    async PUT() {
      try {
        return await axios.put<Response>(endpoint, params, config);
      } catch (e) {
        throw e;
      }
    },
    async POST() {
      try {
        return await axios.post<Response>(endpoint, params, config);
      } catch (e) {
        throw e;
      }
    },
    async DELETE() {
      try {
        return await axios.delete<Response>(endpoint, { ...config, params });
      } catch (e) {
        throw e;
      }
    },
  };

  const axiosAction = axiosReducer[method];

  if (!axiosAction) {
    throw `Invalid method: ${method}.`;
  }

  const res = await axiosAction();

  if (!res) {
    throw "Invalid Response";
  }

  return res.data;
}

export { api };
