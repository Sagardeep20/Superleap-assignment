import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Lead } from "@/types/lead";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";

interface LeadCardProps {
  lead: Lead;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  isDragging?: boolean;
}

export function LeadCard({ lead, onView, onEdit, onDelete, isDragging }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-card border rounded-lg p-3 cursor-grab active:cursor-grabbing
        hover:shadow-md transition-shadow
        ${dragging ? "opacity-50 ring-2 ring-primary" : ""}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm truncate">{lead.name}</h4>
      </div>
      
      <p className="text-xs text-muted-foreground mb-2 truncate">{lead.email}</p>
      
      <div className="flex items-center gap-1 mb-2">
        <StatusBadge status={lead.status} />
      </div>
      
      <p className="text-xs text-muted-foreground">
        {format(new Date(lead.updated_at), "MMM d, h:mm a")}
      </p>

      <div className="flex items-center gap-1 mt-2 pt-2 border-t">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onView(lead);
          }}
        >
          <Eye className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(lead);
          }}
        >
          <Pencil className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(lead);
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}