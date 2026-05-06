import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { leadSchema, type LeadFormValues } from "@/lib/validators";
import { SOURCE_OPTIONS } from "@/types/lead";
import { useCreateLead, useUpdateLead, useLeadsQuery } from "@/hooks/useLeads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  redirectTo?: string;
}

export function LeadForm({ open, onOpenChange, editId, redirectTo = "/leads" }: LeadFormProps) {
  const navigate = useNavigate();
  const params = useParams();
  const editLeadId = editId || params.id;
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: leads } = useLeadsQuery();
  const editLead = editLeadId ? leads?.find((l) => l.id === editLeadId) : null;

  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const isEditing = Boolean(editLeadId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      source: "",
    },
  });

  const selectedSource = watch("source");

  useEffect(() => {
    if (editLead && open) {
      setValue("name", editLead.name);
      setValue("email", editLead.email);
      setValue("phone", editLead.phone || "");
      setValue("source", editLead.source || "");
    } else if (!open) {
      reset();
    }
  }, [editLead, open, setValue, reset]);

  const onSubmit = async (data: LeadFormValues) => {
    setServerError(null);
    try {
      const submitData = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        source: data.source || undefined,
      };

      if (isEditing && editLeadId) {
        await updateLead.mutateAsync({ id: editLeadId, input: submitData });
        toast.success("Lead updated successfully");
      } else {
        await createLead.mutateAsync(submitData);
        toast.success("Lead created successfully");
      }

      onOpenChange(false);
      navigate(redirectTo);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const message = err.response?.data?.error || (isEditing ? "Failed to update lead" : "Failed to create lead");
      setServerError(message);
    }
  };

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      navigate(redirectTo);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Lead" : "Create New Lead"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input {...register("name")} placeholder="Enter name" />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input {...register("email")} placeholder="Enter email" type="email" />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Phone (optional)</label>
            <Input {...register("phone")} placeholder="Enter phone" />
          </div>

          <div>
            <label className="text-sm font-medium">Source (optional)</label>
            <Select
              value={selectedSource}
              onValueChange={(value) => setValue("source", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                ? "Save"
                : "Add Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}