import type { LeadStatus } from "@/types/lead";

interface StatusBadgeProps {
  status: LeadStatus;
}

const statusStyles: Record<LeadStatus, { bg: string; text: string }> = {
  NEW: { bg: "bg-blue-100", text: "text-blue-700" },
  CONTACTED: { bg: "bg-amber-100", text: "text-amber-700" },
  QUALIFIED: { bg: "bg-purple-100", text: "text-purple-700" },
  CONVERTED: { bg: "bg-green-100", text: "text-green-700" },
  LOST: { bg: "bg-red-100", text: "text-red-700" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles.bg} ${styles.text}`}
    >
      {status}
    </span>
  );
}