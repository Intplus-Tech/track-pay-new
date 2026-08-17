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
import { useCreatePermissionMutation } from "@/hooks/rbac/useCreatePermissionMutation";

export const createPermissionSchema = z.object({
  name: z.string().min(1, "Permission name is required"),
  description: z.string().optional(),
});

export type CreatePermissionValues = z.infer<typeof createPermissionSchema>;

interface CreatePermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePermissionDialog({ open, onOpenChange }: CreatePermissionDialogProps) {
  const createPermissionMutation = useCreatePermissionMutation();

  const form = useForm<CreatePermissionValues>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function handleCreatePermission(values: CreatePermissionValues) {
    try {
      await createPermissionMutation.mutateAsync(values);
      toast.success("Permission created.");
      form.reset({ name: "", description: "" });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create permission.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card">
        <DialogHeader>
          <DialogTitle>Create permission</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreatePermission)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permission name</FormLabel>
                  <FormControl>
                    <Input placeholder="CREATE_USER" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this permission unlocks"
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
              <Button type="submit" disabled={createPermissionMutation.isPending}>
                {createPermissionMutation.isPending ? "Creating..." : "Create permission"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
