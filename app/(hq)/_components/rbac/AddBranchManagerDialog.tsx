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
import { Input } from "@/components/ui/input";
import { useCreateUserMutation } from "@/hooks/rbac/useCreateUserMutation";
import type { RbacBranch } from "@/types/rbac";

const addBranchManagerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
  const createUserMutation = useCreateUserMutation();
  const form = useForm<AddBranchManagerValues>({
    resolver: zodResolver(addBranchManagerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
  });

  async function handleSubmit(values: AddBranchManagerValues) {
    if (!branch?.id) {
      toast.error("This branch does not have a valid ID.");
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        branchId: branch.id,
        roleName: "Branch Manager",
        isActive: true,
      });
      await onCreated?.();
      toast.success("Branch manager added.");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add branch manager.");
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
          <DialogTitle>Add branch manager</DialogTitle>
          <DialogDescription>
            Create a manager account for {branch?.name ?? "this branch"}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl><Input placeholder="Amina" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl><Input placeholder="Yusuf" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl><Input type="email" placeholder="manager@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl><Input placeholder="+2348012345678" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temporary password</FormLabel>
                  <FormControl><Input type="password" placeholder="Minimum 8 characters" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending || !branch?.id}>
                {createUserMutation.isPending ? "Adding..." : "Add manager"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}