"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRoleMutation } from "@/hooks/rbac/useCreateRoleMutation";

export const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
});

export type RoleValues = z.infer<typeof roleSchema>;

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoleDialog({ open, onOpenChange }: CreateRoleDialogProps) {
  const createRoleMutation = useCreateRoleMutation();

  const createForm = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function handleCreateRole(values: RoleValues) {
    try {
      await createRoleMutation.mutateAsync(values);
      toast.success("Role created.");
      createForm.reset({ name: "", description: "" });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create role.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card">
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>
        </DialogHeader>
        <Form {...createForm}>
          <form onSubmit={createForm.handleSubmit(handleCreateRole)} className="space-y-5">
            <FormField
              control={createForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role name</FormLabel>
                  <FormControl>
                    <Input placeholder="Operations Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this role is allowed to do"
                      className="min-h-28"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRoleMutation.isPending}>
                {createRoleMutation.isPending ? "Creating..." : "Create role"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
