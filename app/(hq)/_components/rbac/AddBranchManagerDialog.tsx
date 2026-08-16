"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBranchManagerMutation } from "@/hooks/rbac/useBranchManagerMutation";
import { DEFAULT_USER_DIRECTORY_QUERY, useUsersQuery } from "@/hooks/rbac/useUsersQuery";
import type { RbacBranch } from "@/types/rbac";

const addBranchManagerSchema = z.object({
  userId: z.string().min(1, "Select a user"),
  transferFromCurrentBranch: z.boolean(),
  allowMultipleBranches: z.boolean(),
  reason: z.string().trim().optional(),
});

type AddBranchManagerValues = z.infer<typeof addBranchManagerSchema>;

interface AddBranchManagerDialogProps {
  branch: RbacBranch | null;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => Promise<void> | void;
}

export function AddBranchManagerDialog({
  branch,
  onOpenChange,
  onCreated,
}: AddBranchManagerDialogProps) {
  const assignManagerMutation = useBranchManagerMutation();
  const usersQuery = useUsersQuery({
    ...DEFAULT_USER_DIRECTORY_QUERY,
    isActive: "true",
  });
  const eligibleUsers = (usersQuery.data?.data ?? []).filter((user) => {
    const roleName = user.role?.name?.toUpperCase();
    return !roleName || roleName === "ADMIN" || roleName === "MANAGER";
  });
  const form = useForm<AddBranchManagerValues>({
    resolver: zodResolver(addBranchManagerSchema),
    defaultValues: {
      userId: "",
      transferFromCurrentBranch: false,
      allowMultipleBranches: false,
      reason: "",
    },
  });

  async function handleSubmit(values: AddBranchManagerValues) {
    const branchId = branch?.id || branch?._id;
    if (!branchId) {
      toast.error("This branch does not have a valid ID.");
      return;
    }

    try {
      await assignManagerMutation.mutateAsync({
        branchId,
        userId: values.userId,
        transferFromCurrentBranch: values.transferFromCurrentBranch,
        allowMultipleBranches: values.allowMultipleBranches,
        reason: values.reason,
      });
      await onCreated?.();
      toast.success("Branch manager assigned.");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to assign branch manager.");
    }
  }

  return (
    <Dialog
      open={Boolean(branch)}
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="bg-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign branch manager</DialogTitle>
          <DialogDescription>
            Select an existing active manager or administrator for {branch?.name ?? "this branch"}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={usersQuery.isLoading ? "Loading users..." : "Select a user"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      {eligibleUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName || user.name} · {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <FormField
                control={form.control}
                name="transferFromCurrentBranch"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} /></FormControl>
                    <FormLabel className="font-normal">Transfer the user from their current branch</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allowMultipleBranches"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} /></FormControl>
                    <FormLabel className="font-normal">Allow the user to manage multiple branches</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={assignManagerMutation.isPending || !(branch?.id || branch?._id)}>
                {assignManagerMutation.isPending ? "Assigning..." : "Assign manager"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}