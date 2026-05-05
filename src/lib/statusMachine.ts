import type { LeadStatus } from "@/types/lead";

const TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  NEW: ["CONTACTED", "LOST"],
  CONTACTED: ["QUALIFIED", "LOST"],
  QUALIFIED: ["CONVERTED", "LOST"],
  CONVERTED: [],
  LOST: [],
};

export function getValidTransitions(status: LeadStatus): LeadStatus[] {
  return TRANSITIONS[status];
}

export function isTerminal(status: LeadStatus): boolean {
  return TRANSITIONS[status].length === 0;
}