"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateBranchMutation } from "@/hooks/rbac/useCreateBranchMutation";

const createBranchSchema = z.object({
  name: z.string().trim().min(1, "Branch name is required"),
  location: z.string().trim().optional(),
});

type CreateBranchValues = z.infer<typeof createBranchSchema>;

interface CreateBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (response?: any) => Promise<void> | void;
}

export function CreateBranchDialog({ open, onOpenChange, onCreated }: CreateBranchDialogProps) {
  const createBranchMutation = useCreateBranchMutation();
  const form = useForm<CreateBranchValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: { name: "", location: "" },
  });

  async function handleCreateBranch(values: CreateBranchValues) {
    try {
      const response = await createBranchMutation.mutateAsync({
        name: values.name,
        location: values.location || undefined,
        isActive: true,
      });
      await onCreated?.(response);
      toast.success("Branch created.");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create branch.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new branch</DialogTitle>
          <DialogDescription>Add a branch to your institution&apos;s network.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateBranch)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
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
                  <FormLabel>Location <span className="font-normal text-slate-400">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="Lagos Mainland" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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