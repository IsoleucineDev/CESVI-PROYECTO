import axios from "axios";
import { API_URL } from "../config/env";

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token) {
  if (token) http.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete http.defaults.headers.common.Authorization;
}
