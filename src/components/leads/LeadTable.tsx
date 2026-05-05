import type { Lead } from "@/types/lead";
import { LeadRow } from "./LeadRow";
import { SkeletonRows } from "@/components/ui/SkeletonRows";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeadTableProps {
  leads: Lead[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onDelete: (lead: Lead) => void;
  onView: (lead: Lead) => void;
  showEmpty: boolean;
  onClearFilters?: () => void;
}

export function LeadTable({
  leads,
  isLoading,
  isError,
  onRetry,
  onDelete,
  onView,
  showEmpty,
  onClearFilters,
}: LeadTableProps) {
  if (isLoading) {
    return <SkeletonRows />;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">
          Failed to load leads. Check server at localhost:4000
        </p>
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (showEmpty) {
    return (
      <EmptyState
        message="No leads found"
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads?.map((lead) => (
          <LeadRow key={lead.id} lead={lead} onDelete={onDelete} onView={onView} />
        ))}
      </TableBody>
    </Table>
  );
}