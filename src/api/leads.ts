import axios from "axios";
import type { Lead, LeadFormData, LeadStatus } from "@/types/lead";

const api = axios.create({
  baseURL: "http://localhost:4000",
});

export async function getLeads(): Promise<Lead[]> {
  const { data } = await api.get<Lead[]>("/leads");
  return data;
}

export async function getLead(id: string): Promise<Lead> {
  const { data } = await api.get<Lead>(`/leads/${id}`);
  return data;
}

export async function createLead(input: LeadFormData): Promise<Lead> {
  const { data } = await api.post<Lead>("/leads", input);
  return data;
}

export async function updateLead(id: string, input: LeadFormData): Promise<Lead> {
  const { data } = await api.put<Lead>(`/leads/${id}`, input);
  return data;
}

export async function patchLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  const { data } = await api.patch<Lead>(`/leads/${id}/status`, { status });
  return data;
}

export async function deleteLead(id: string): Promise<void> {
  await api.delete(`/leads/${id}`);
}