import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useLeadsQuery, usePatchLeadStatus } from "@/hooks/useLeads";
import { useFilterStore } from "@/stores/filterStore";
import { getValidTransitions, isTerminal } from "@/lib/statusMachine";
import type { Lead, LeadStatus } from "@/types/lead";
import { Navbar } from "@/components/layout/Navbar";
import { LeadCard } from "@/components/leads/LeadCard";
import { LeadForm } from "@/components/forms/LeadForm";
import { DeleteConfirmDialog } from "@/components/forms/DeleteConfirmDialog";
import { LeadViewDialog } from "@/components/leads/LeadViewDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const COLUMNS: { id: LeadStatus; title: string; color: string }[] = [
  { id: "NEW", title: "NEW", color: "bg-blue-100" },
  { id: "CONTACTED", title: "CONTACTED", color: "bg-amber-100" },
  { id: "QUALIFIED", title: "QUALIFIED", color: "bg-purple-100" },
  { id: "CONVERTED", title: "CONVERTED", color: "bg-green-100" },
  { id: "LOST", title: "LOST", color: "bg-red-100" },
];

function Column({
  id,
  title,
  color,
  leads,
  onView,
  onEdit,
  onDelete,
}: {
  id: LeadStatus;
  title: string;
  color: string;
  leads: Lead[];
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const locked = isTerminal(id);

  return (
    <div className="flex flex-col">
      <div className={`rounded-t-lg p-3 ${color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full">
            {leads.length}
          </span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`
          flex-1 bg-muted/30 rounded-b-lg p-2 min-h-[400px] max-h-[70vh] overflow-y-auto
          ${locked ? "opacity-60" : ""}
          ${isOver && !locked ? "ring-2 ring-primary ring-inset bg-primary/10" : ""}
        `}
      >
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {leads.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Drop leads here
          </p>
        )}
      </div>
    </div>
  );
}

export function BoardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchQuery, selectedStatus, setSearchQuery, setSelectedStatus, reset } = useFilterStore();
  const queryClient = useQueryClient();

  const { data: leads, isLoading, isError, refetch } = useLeadsQuery();
  const patchStatus = usePatchLeadStatus();

  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [leadToView, setLeadToView] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const q = searchParams.get("q");
    const status = searchParams.get("status");
    if (q !== null) setSearchQuery(q);
    if (status !== null && (status === "ALL" || COLUMNS.some(c => c.id === status))) {
      setSelectedStatus(status as LeadStatus | "ALL");
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedStatus !== "ALL") params.set("status", selectedStatus);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedStatus]);

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter((lead) => {
      const matchesSearch =
        searchQuery === "" ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "ALL" || lead.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, selectedStatus]);

  const getLeadsByStatus = (status: LeadStatus) =>
    filteredLeads.filter((lead) => lead.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads?.find((l) => l.id === event.active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) {
      return;
    }

    const draggedLead = leads?.find((l) => String(l.id) === String(active.id));
    if (!draggedLead) return;

    const overId = over.id as string;
    let newStatus: LeadStatus | null = null;

    if (COLUMNS.some(c => c.id === overId)) {
      newStatus = overId as LeadStatus;
    } else {
      for (const col of COLUMNS) {
        const columnLeads = getLeadsByStatus(col.id);
        if (columnLeads.some(l => l.id === overId)) {
          newStatus = col.id;
          break;
        }
      }
    }

    if (!newStatus) {
      return;
    }

    if (draggedLead.status === newStatus) {
      return;
    }

    const validTransitions = getValidTransitions(draggedLead.status);

    if (!validTransitions.includes(newStatus)) {
      toast.error(`Cannot move a ${draggedLead.status} lead to ${newStatus}`);
      return;
    }

    if (isTerminal(draggedLead.status)) {
      toast.error(`Cannot change status - lead is locked`);
      return;
    }

    const originalStatus = draggedLead.status;

    queryClient.setQueryData(["leads"], (oldLeads: Lead[] | undefined) => {
      if (!oldLeads) return oldLeads;
      return oldLeads.map((l) =>
        String(l.id) === String(active.id)
          ? { ...l, status: newStatus as LeadStatus }
          : l
      );
    });

    try {
      await patchStatus.mutateAsync({ id: draggedLead.id, status: newStatus as LeadStatus });
      toast.success(`Lead moved to ${newStatus}`);
    } catch {
      queryClient.setQueryData(["leads"], (oldLeads: Lead[] | undefined) => {
        if (!oldLeads) return oldLeads;
        return oldLeads.map((l) =>
          String(l.id) === String(active.id)
            ? { ...l, status: originalStatus }
            : l
        );
      });
      toast.error("Failed to update lead status. Change reverted.");
    }
  };

  const handleViewClick = (lead: Lead) => {
    setLeadToView(lead);
    setViewDialogOpen(true);
  };

  const handleEditClick = (lead: Lead) => {
    setEditId(lead.id);
    setShowForm(true);
  };

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditId(null);
    navigate("/board");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-5 gap-4">
            {COLUMNS.map((col) => (
              <div key={col.id} className="bg-muted rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-4 text-center py-12">
          <p className="text-destructive mb-4">Failed to load leads</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as LeadStatus | "ALL")}
            className="px-3 py-2 border rounded-md"
          >
            <option value="ALL">All Statuses</option>
            {COLUMNS.map((col) => (
              <option key={col.id} value={col.id}>{col.title}</option>
            ))}
          </select>
          {(searchQuery || selectedStatus !== "ALL") && (
            <button
              onClick={() => reset()}
              className="text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-5 gap-4">
            {COLUMNS.map((column) => (
              <Column
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                leads={getLeadsByStatus(column.id)}
                onView={handleViewClick}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? (
              <div className="bg-card border rounded-lg p-3 shadow-lg opacity-90 w-48">
                <h4 className="font-medium text-sm truncate">{activeLead.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{activeLead.email}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <LeadForm open={showForm} onOpenChange={handleFormClose} editId={editId} />

      <DeleteConfirmDialog
        lead={leadToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />

      <LeadViewDialog
        lead={leadToView}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
    </div>
  );
}