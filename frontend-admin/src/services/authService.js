// src/services/authService.js
import { publicApi } from "../config/api";

export const getAllUsers = async () => {
  const response = await publicApi.get("/auth/users");
  return response.data;
};

export const createNewUser = async (userData) => {
  const response = await publicApi.post("/auth/create-user", userData);
  return response.data;
};