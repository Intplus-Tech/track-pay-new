"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmountInput } from "@/components/ui/amount-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useCreateRepaymentMutation } from "@/hooks/loan/useCreateRepaymentMutation";
import { zodAmount } from "@/lib/utils";

const schema = z.object({
  amount: zodAmount,
  currency: z.string().optional(),
  paidAt: z.string().optional(),
  provider: z.string().optional(),
  providerReference: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface RecordRepaymentFormProps {
  portfolioId: string;
  onSuccess?: () => void;
}

export function RecordRepaymentForm({
  portfolioId,
  onSuccess,
}: RecordRepaymentFormProps) {
  const createMutation = useCreateRepaymentMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "",
      currency: "NGN",
      paidAt: "",
      provider: "",
      providerReference: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(
      {
        portfolioId,
        amount: values.amount,
        ...(values.currency ? { currency: values.currency } : {}),
        ...(values.paidAt ? { paidAt: values.paidAt } : {}),
        ...(values.provider ? { provider: values.provider } : {}),
        ...(values.providerReference
          ? { providerReference: values.providerReference }
          : {}),
      },
      {
        onSuccess: () => {
          form.reset({ currency: "NGN" });
          onSuccess?.();
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-5">
        <h2 className="text-xl font-semibold">Record Repayment</h2>

        {createMutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {createMutation.error.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Amount (₦) <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <AmountInput placeholder="e.g. 25000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input placeholder="NGN" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paidAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Paystack" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="providerReference"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Provider Reference</FormLabel>
                <FormControl>
                  <Input placeholder="Transaction reference" {...field} />
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
            Record Repayment
          </Button>
        </div>
      </form>
    </Form>
  );
}
