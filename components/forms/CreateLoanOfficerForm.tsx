"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { useBranchesQuery } from "@/hooks/rbac/useBranchesQuery";
import { useCreateLoanOfficerMutation } from "@/hooks/loan-officers/useCreateLoanOfficerMutation";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  branchId: z.string().optional(),
  maxAssignedLoans: z.coerce
    .number()
    .int()
    .positive("Must be a positive number")
    .optional()
    .or(z.literal("")),
  monthlyCollectionTarget: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateLoanOfficerFormProps {
  onSuccess?: () => void;
}

export function CreateLoanOfficerForm({ onSuccess }: CreateLoanOfficerFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);
  const branchesQuery = useBranchesQuery();
  const createMutation = useCreateLoanOfficerMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      branchId: "",
      maxAssignedLoans: "",
      monthlyCollectionTarget: "",
    },
  });

  const generatePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += charset[Math.floor(Math.random() * charset.length)];
    }
    form.setValue("password", pwd);
    setCopiedPassword(null);
  };

  const copyPassword = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedPassword(password);
    } catch {
      // Clipboard access can be unavailable in some browser contexts.
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (copiedPassword !== values.password) {
      await copyPassword(values.password);
    }

    createMutation.mutate(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        ...(values.middleName ? { middleName: values.middleName } : {}),
        ...(values.phoneNumber ? { phoneNumber: values.phoneNumber } : {}),
        ...(values.branchId && values.branchId !== "none"
          ? { branchId: values.branchId }
          : {}),
        ...(values.maxAssignedLoans
          ? { maxAssignedLoans: Number(values.maxAssignedLoans) }
          : {}),
        ...(values.monthlyCollectionTarget
          ? { monthlyCollectionTarget: values.monthlyCollectionTarget }
          : {}),
      },
      {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <h2 className="text-xl font-semibold">Add New Loan Officer</h2>

        {createMutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {createMutation.error.message}
          </div>
        )}

        {/* Identity */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input placeholder="Middle name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+234 …" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="email" placeholder="officer@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {branchesQuery.data?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>



        {/* Assignment */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <FormField
            control={form.control}
            name="maxAssignedLoans"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Assigned Loans</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="monthlyCollectionTarget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Target (₦)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 500000" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-2 text-muted-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    aria-label="Copy password"
                    className="absolute right-9 top-2 text-muted-foreground"
                    onClick={() => void copyPassword(field.value)}
                  >
                    {copiedPassword === field.value ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generatePassword}
                  className="shrink-0 self-start mt-0"
                >
                  Suggest
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Officer
          </Button>
        </div>
      </form>
    </Form>
  );
}
