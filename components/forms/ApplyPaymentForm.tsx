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
import { useApplyPaymentMutation } from "@/hooks/loan/useApplyPaymentMutation";
import { zodAmount } from "@/lib/utils";
import { toast } from "sonner";

const schema = z.object({
  amount: zodAmount,
});

type FormValues = z.infer<typeof schema>;

interface ApplyPaymentFormProps {
  portfolioId: string;
  onSuccess?: () => void;
}

export function ApplyPaymentForm({
  portfolioId,
  onSuccess,
}: ApplyPaymentFormProps) {
  const applyMutation = useApplyPaymentMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "" },
  });

  const onSubmit = (values: FormValues) => {
    applyMutation.mutate(
      { portfolioId, payload: { amount: values.amount } },
      {
        onSuccess: () => {
          toast.success("Payment applied successfully");
          form.reset();
          onSuccess?.();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to apply payment");
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-5">
        <h2 className="text-xl font-semibold">Apply Payment</h2>
        <p className="text-sm text-muted-foreground">
          Directly reduces the outstanding portfolio balance.
        </p>

        {applyMutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {applyMutation.error.message}
          </div>
        )}

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

        <div className="flex justify-end">
          <Button type="submit" disabled={applyMutation.isPending}>
            {applyMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Apply Payment
          </Button>
        </div>
      </form>
    </Form>
  );
}
