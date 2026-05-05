import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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

export function BoardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchQuery, selectedStatus, setSearchQuery, setSelectedStatus, reset } = useFilterStore();

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

    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;

    const lead = leads?.find((l) => l.id === leadId);
    if (!lead) return;

    const validTransitions = getValidTransitions(lead.status);
    
    if (!validTransitions.includes(newStatus)) {
      toast.error(`Invalid transition from ${lead.status} to ${newStatus}`);
      return;
    }

    if (isTerminal(newStatus)) {
      toast.error(`Cannot transition to ${newStatus} - status is locked`);
      return;
    }

    try {
      await patchStatus.mutateAsync({ id: leadId, status: newStatus });
      toast.success(`Status changed to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
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
            {COLUMNS.map((column) => {
              const columnLeads = getLeadsByStatus(column.id);
              const locked = isTerminal(column.id);

              return (
                <div key={column.id} className="flex flex-col">
                  <div className={`rounded-t-lg p-3 ${column.color}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{column.title}</h3>
                      <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full">
                        {columnLeads.length}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`
                      flex-1 bg-muted/30 rounded-b-lg p-2 min-h-[400px] max-h-[70vh] overflow-y-auto
                      ${locked ? "opacity-60" : ""}
                    `}
                    data-status={column.id}
                  >
                    {columnLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onView={handleViewClick}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                    {columnLeads.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No leads
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
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