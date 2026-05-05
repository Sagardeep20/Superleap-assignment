export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: LeadStatus;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export type LeadFormData = {
  name: string;
  email: string;
  phone?: string;
  source?: string;
};

export const SOURCE_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "campaign", label: "Campaign" },
  { value: "cold-outreach", label: "Cold Outreach" },
  { value: "event", label: "Event" },
] as const;

export type SourceValue = (typeof SOURCE_OPTIONS)[number]["value"];