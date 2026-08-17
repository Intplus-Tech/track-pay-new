"use client";

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
import { Loader2 } from "lucide-react";
import { useCreatePortfolioMutation } from "@/hooks/loan/useCreatePortfolioMutation";
import { useLoanOfficersQuery } from "@/hooks/loan-officers/useLoanOfficersQuery";
import type { InterestType, PortfolioStatus } from "@/types/loan";
import { formatCurrency } from "@/lib/utils";

const schema = z.object({
  loaneeId: z.string().min(1, "Loanee is required"),
  principal: z.string().min(1, "Principal is required"),
  tenureMonths: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .positive("Must be a positive integer"),
  interestRate: z.string().min(1, "Interest rate is required"),
  interestType: z.enum(["FIXED", "FLOAT", "REDUCING"]).optional(),
  loanOfficerId: z.string().optional(),
  nextDueDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreatePortfolioFormProps {
  /** Pre-fill loaneeId and lock the field when accessed from a loanee detail page */
  loaneeId?: string;
  onSuccess?: () => void;
}

function getNextMonthDateStr() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

export function CreatePortfolioForm({
  loaneeId,
  onSuccess,
}: CreatePortfolioFormProps) {
  const createMutation = useCreatePortfolioMutation();
  const officersQuery = useLoanOfficersQuery({
    page: 1,
    limit: 100,
    search: "",
    branchId: "all",
    availabilityStatus: "ACTIVE",
    order: "ASC"
  });
  const officers = officersQuery.data?.data ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      loaneeId: loaneeId ?? "",
      principal: "",
      tenureMonths: undefined,
      interestRate: "",
      interestType: "FIXED",
      loanOfficerId: "unassigned",
      nextDueDate: getNextMonthDateStr(),
    },
  });

  const principalVal = form.watch("principal");
  const tenureVal = form.watch("tenureMonths");
  const rateVal = form.watch("interestRate");

  const principal = parseFloat(principalVal) || 0;
  const tenure = parseInt(String(tenureVal)) || 0;
  const rate = parseFloat(rateVal) || 0;

  const totalInterest = (principal * rate * tenure) / 100;
  const totalExpected = principal + totalInterest;
  const monthlyInstalment = tenure > 0 ? totalExpected / tenure : 0;

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(
      {
        loaneeId: values.loaneeId,
        principal: values.principal,
        tenureMonths: values.tenureMonths,
        interestRate: values.interestRate,
        ...(values.interestType
          ? { interestType: values.interestType as InterestType }
          : {}),
        ...(values.loanOfficerId && values.loanOfficerId !== "unassigned"
          ? { loanOfficerId: values.loanOfficerId }
          : {}),
        ...(values.nextDueDate ? { nextDueDate: values.nextDueDate } : {}),
      },
      {
        onSuccess: () => {
          form.reset({ loaneeId: loaneeId ?? "" });
          onSuccess?.();
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <h2 className="text-xl font-semibold">New Loan Portfolio</h2>

        {createMutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {createMutation.error.message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Principal</p>
            <p className="text-sm font-semibold">{formatCurrency(principal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Expected</p>
            <p className="text-sm font-semibold">{formatCurrency(totalExpected)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly Instalment</p>
            <p className="text-sm font-semibold text-primary">{formatCurrency(monthlyInstalment)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Loan Terms</h3>
          
          {/* Loanee ID — hidden if pre-filled */}
          {!loaneeId && (
            <FormField
              control={form.control}
              name="loaneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Loanee ID <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Loanee ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Principal (₦) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 500000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tenureMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tenure (months) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min={1} placeholder="e.g. 12" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Interest Rate (%) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 5.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FIXED">Fixed</SelectItem>
                      <SelectItem value="FLOAT">Float</SelectItem>
                      <SelectItem value="REDUCING">Reducing</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Assignment & Schedule</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="loanOfficerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Officer</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={officersQuery.isLoading ? "Loading officers..." : "Assign an officer"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">No assigned officer</SelectItem>
                      {officers.map((officer) => (
                        <SelectItem key={officer.id} value={officer.id}>
                          {officer.fullName || `${officer.firstName} ${officer.lastName}`.trim() || officer.email}
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
              name="nextDueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Portfolio
          </Button>
        </div>
      </form>
    </Form>
  );
}
