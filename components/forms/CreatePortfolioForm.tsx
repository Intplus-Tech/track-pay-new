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
import type { InterestType, PortfolioStatus } from "@/types/loan";

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

export function CreatePortfolioForm({
  loaneeId,
  onSuccess,
}: CreatePortfolioFormProps) {
  const createMutation = useCreatePortfolioMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      loaneeId: loaneeId ?? "",
      principal: "",
      tenureMonths: undefined,
      interestRate: "",
      interestType: undefined,
      loanOfficerId: "",
      nextDueDate: "",
    },
  });

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
        ...(values.loanOfficerId ? { loanOfficerId: values.loanOfficerId } : {}),
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
                  <Input type="number" min={1} placeholder="e.g. 12" {...field} />
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

          <FormField
            control={form.control}
            name="loanOfficerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Officer ID</FormLabel>
                <FormControl>
                  <Input placeholder="Officer ID (optional)" {...field} />
                </FormControl>
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
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
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
