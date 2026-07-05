import axios from "axios";
import { BosMember } from "./types";

const API = `${process.env.REACT_APP_API_URL}/bos`;

export const getAllBos = () => axios.get<BosMember[]>(API);

export const createBos = (data: BosMember) =>
  axios.post("/bos", data);

export const updateBos = (id: number, data: BosMember) =>
  axios.put(`${API}/${id}`, data);

export const deleteBos = (id: number) =>
  axios.delete(`${API}/${id}`);
