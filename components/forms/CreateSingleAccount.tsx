"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateSingleAccount() {
  const [loanId, setLoanId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [amount, setAmount] = useState("");
  const [repaymentPeriod, setRepaymentPeriod] = useState("");
  const [loanOfficer, setLoanOfficer] = useState("");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="loan-id">Loan ID</Label>
        <Input
          id="loan-id"
          placeholder="Enter the Loan ID"
          value={loanId}
          onChange={(e) => setLoanId(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first-name">First Name</Label>
          <Input
            id="first-name"
            placeholder="Enter First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="middle-name">Middle Name</Label>
          <Input
            id="middle-name"
            placeholder="Enter Middle Name"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last-name">Last Name</Label>
          <Input
            id="last-name"
            placeholder="Enter Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="loan-amount">Loan Amount</Label>
        <Input
          id="loan-amount"
          placeholder="₦600,000"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          placeholder="₦600,000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="repayment">Repayment Period</Label>
        <Select value={repaymentPeriod} onValueChange={setRepaymentPeriod}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Daily, Weekly..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="loan-officer">Loan Officer</Label>
        <Select value={loanOfficer} onValueChange={setLoanOfficer}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select the name of the loan officer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="officer1">Officer 1</SelectItem>
            <SelectItem value="officer2">Officer 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button className="w-full">Create Account</Button>
    </div>
  );
}
