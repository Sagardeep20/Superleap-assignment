import { create } from "zustand";
import type { LeadStatus } from "@/types/lead";

interface FilterStore {
  searchQuery: string;
  selectedStatus: LeadStatus | "ALL";
  setSearchQuery: (q: string) => void;
  setSelectedStatus: (s: LeadStatus | "ALL") => void;
  reset: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  searchQuery: "",
  selectedStatus: "ALL",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
  reset: () => set({ searchQuery: "", selectedStatus: "ALL" }),
}));