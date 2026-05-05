import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message: string;
  onClearFilters?: () => void;
}

export function EmptyState({ message, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-muted-foreground mb-4">{message}</p>
      {onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}