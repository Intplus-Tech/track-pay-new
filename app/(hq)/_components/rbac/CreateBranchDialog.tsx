"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBranchesQuery } from "@/hooks/rbac/useBranchesQuery";
import { useCreateBranchMutation } from "@/hooks/rbac/useCreateBranchMutation";

const branchTypeOptions = [
  { value: "PHYSICAL", label: "Physical" },
  { value: "VIRTUAL", label: "Virtual" },
] as const;

const branchStatusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING_ACTIVATION", label: "Pending activation" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "CLOSED", label: "Closed" },
] as const;

const createBranchSchema = z.object({
  name: z.string().trim().min(1, "Branch name is required"),
  location: z.string().trim().optional(),
  addressLabel: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  regionalZone: z.string().trim().optional(),
  type: z.enum(["PHYSICAL", "VIRTUAL"]).default("PHYSICAL"),
  status: z.enum(["ACTIVE", "PENDING_ACTIVATION", "SUSPENDED", "CLOSED"]).default("ACTIVE"),
  parentBranchId: z.string().trim().optional(),
  isHeadOffice: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type CreateBranchValues = z.infer<typeof createBranchSchema>;

interface CreateBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (response?: any) => Promise<void> | void;
}

export function CreateBranchDialog({ open, onOpenChange, onCreated }: CreateBranchDialogProps) {
  const createBranchMutation = useCreateBranchMutation();
  const branchesQuery = useBranchesQuery();
  const branchOptions = branchesQuery.data ?? [];

  const form = useForm<CreateBranchValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      name: "",
      location: "",
      addressLabel: "",
      city: "",
      state: "",
      country: "",
      regionalZone: "",
      type: "PHYSICAL",
      status: "ACTIVE",
      parentBranchId: "",
      isHeadOffice: false,
      isActive: true,
    },
  });

  async function handleCreateBranch(values: CreateBranchValues) {
    try {
      const payload = {
        name: values.name.trim(),
        location: values.location?.trim() || undefined,
        addressLabel: values.addressLabel?.trim() || undefined,
        city: values.city?.trim() || undefined,
        state: values.state?.trim() || undefined,
        country: values.country?.trim() || undefined,
        regionalZone: values.regionalZone?.trim() || undefined,
        type: values.type || undefined,
        status: values.status || "ACTIVE",
        parentBranchId: values.parentBranchId?.trim() || undefined,
        isHeadOffice: values.isHeadOffice,
        isActive: values.isActive,
      };

      const response = await createBranchMutation.mutateAsync(payload);
      await onCreated?.(response);
      toast.success("Branch created.");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create branch.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          form.reset();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="bg-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create new branch</DialogTitle>
          <DialogDescription>Add a branch to your institution&apos;s network.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateBranch)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Branch name</FormLabel>
                    <FormControl><Input placeholder="Main Branch" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input placeholder="Lagos Mainland" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="regionalZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regional zone</FormLabel>
                    <FormControl><Input placeholder="South West" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLabel"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address label</FormLabel>
                    <FormControl><Input placeholder="1 Marina Road, Lekki Phase 1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="Lagos" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl><Input placeholder="Lagos State" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl><Input placeholder="Nigeria" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentBranchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent branch</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      value={field.value || "none"}
                      disabled={branchesQuery.isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={branchesQuery.isLoading ? "Loading branches..." : "Select a parent branch"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="none">No parent branch</SelectItem>
                        {branchOptions.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {branchTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {branchStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <FormField
                control={form.control}
                name="isHeadOffice"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">This is the head office</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Branch is active</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createBranchMutation.isPending}>
                {createBranchMutation.isPending ? "Creating..." : "Create branch"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}