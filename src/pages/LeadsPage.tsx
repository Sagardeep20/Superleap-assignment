import { useState, useMemo } from "react";
import { useSearchParams, useLocation, useParams } from "react-router-dom";
import { useLeadsQuery } from "@/hooks/useLeads";
import { useFilterStore } from "@/stores/filterStore";
import type { Lead, LeadStatus } from "@/types/lead";
import { Navbar } from "@/components/layout/Navbar";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadForm } from "@/components/forms/LeadForm";
import { DeleteConfirmDialog } from "@/components/forms/DeleteConfirmDialog";
import { LeadViewDialog } from "@/components/leads/LeadViewDialog";
import { Input } from "@/components/ui/input";

const STATUS_OPTIONS: (LeadStatus | "ALL")[] = [
  "ALL",
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "LOST",
];

export function LeadsPage() {
  const location = useLocation();
  const params = useParams();
  const [, setSearchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [leadToView, setLeadToView] = useState<Lead | null>(null);

  const { searchQuery, selectedStatus, setSearchQuery, setSelectedStatus, reset } =
    useFilterStore();

  const { data: leads, isLoading, isError, refetch } = useLeadsQuery();

  const isCreateMode = location.pathname === "/leads/new";
  const editId = params.id || null;

  const showForm = Boolean(isCreateMode || editId);

  const filteredLeads = useMemo(() => {
    if (!leads) return [];

    return leads.filter((lead) => {
      const matchesSearch =
        searchQuery === "" ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" || lead.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, selectedStatus]);

  const showEmpty =
    !isLoading && filteredLeads.length === 0 && (Boolean(searchQuery) || selectedStatus !== "ALL");

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const handleViewClick = (lead: Lead) => {
    setLeadToView(lead);
    setViewDialogOpen(true);
  };

  const handleStatusClick = (status: LeadStatus | "ALL") => {
    setSelectedStatus(status);
  };

  const handleClearFilters = () => {
    reset();
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      setSearchParams({});
      window.history.replaceState(null, "", "/leads");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <LeadTable
            leads={filteredLeads}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            onDelete={handleDeleteClick}
            onView={handleViewClick}
            showEmpty={showEmpty}
            onClearFilters={handleClearFilters}
          />
        </div>
      </main>

      <LeadForm open={showForm} onOpenChange={handleFormOpenChange} editId={editId} />

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