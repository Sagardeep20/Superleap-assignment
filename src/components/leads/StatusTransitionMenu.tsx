import { useState } from "react";
import { MoreHorizontal, Lock } from "lucide-react";
import { usePatchLeadStatus } from "@/hooks/useLeads";
import { getValidTransitions, isTerminal } from "@/lib/statusMachine";
import type { Lead, LeadStatus } from "@/types/lead";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface StatusTransitionMenuProps {
  lead: Lead;
}

export function StatusTransitionMenu({ lead }: StatusTransitionMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const patchStatus = usePatchLeadStatus();
  const validTransitions = getValidTransitions(lead.status);
  const terminal = isTerminal(lead.status);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setIsLoading(true);
    try {
      await patchStatus.mutateAsync({ id: lead.id, status: newStatus });
      toast.success(`Status changed to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  if (terminal) {
    return (
      <span className="flex items-center text-muted-foreground text-sm">
        <Lock className="w-3 h-3 mr-1" />
        Locked
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <MoreHorizontal className="w-4 h-4" />
          )}
          Move to ▾
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {validTransitions.map((status) => (
          <DropdownMenuItem
            key={status}
            onSelect={() => handleStatusChange(status)}
          >
            {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}