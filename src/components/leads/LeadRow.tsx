import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Lead } from "@/types/lead";
import { StatusBadge } from "./StatusBadge";
import { StatusTransitionMenu } from "./StatusTransitionMenu";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

interface LeadRowProps {
  lead: Lead;
  onDelete: (lead: Lead) => void;
  onView: (lead: Lead) => void;
}

export function LeadRow({ lead, onDelete, onView }: LeadRowProps) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/leads/${lead.id}/edit`);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{lead.name}</TableCell>
      <TableCell>{lead.email}</TableCell>
      <TableCell>
        <StatusBadge status={lead.status} />
      </TableCell>
      <TableCell>{lead.source || "-"}</TableCell>
      <TableCell>
        {format(new Date(lead.updated_at), "MMM d, yyyy h:mm a")}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onView(lead)}>
            <Eye className="w-4 h-4" />
          </Button>
          <StatusTransitionMenu lead={lead} />
          <Button variant="ghost" size="icon" onClick={handleEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(lead)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}