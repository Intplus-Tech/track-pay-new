"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const notificationData = [
  {
    branchId: "LN-8589",
    all: true,
    accountCreation: true,
    loanPayment: true,
    loanOverdue: true,
  },
  {
    branchId: "LN-1908",
    all: false,
    accountCreation: true,
    loanPayment: false,
    loanOverdue: false,
  },
  {
    branchId: "LN-1933",
    all: false,
    accountCreation: true,
    loanPayment: false,
    loanOverdue: true,
  },
  {
    branchId: "LN-1898",
    all: true,
    accountCreation: true,
    loanPayment: true,
    loanOverdue: true,
  },
];

export function NotificationSMS() {
  const [notifications, setNotifications] = useState(notificationData);
  const [sendReport, setSendReport] = useState(false);

  const updateNotification = (index: number, field: string, value: boolean) => {
    setNotifications((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  return (
    <Card className="w-full border-none shadow-none p-0">
      <CardHeader className="p-0">
        <CardTitle>Notification (SMS)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-0">
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Branch ID</TableHead>
              <TableHead>All</TableHead>
              <TableHead>Account Creation</TableHead>
              <TableHead>Loan Payment Confirmation</TableHead>
              <TableHead>Loan Overdue Reminder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((notification, index) => (
              <TableRow key={notification.branchId}>
                <TableCell className="font-medium">
                  {notification.branchId}
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={notification.all}
                    onCheckedChange={(checked) =>
                      updateNotification(index, "all", checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="flex items-center justify-center">
                  <Checkbox
                    checked={notification.accountCreation}
                    onCheckedChange={(checked) =>
                      updateNotification(
                        index,
                        "accountCreation",
                        checked as boolean,
                      )
                    }
                  />
                </TableCell>
                <TableCell className="flex items-center justify-center">
                  <Checkbox
                    checked={notification.loanPayment}
                    onCheckedChange={(checked) =>
                      updateNotification(
                        index,
                        "loanPayment",
                        checked as boolean,
                      )
                    }
                  />
                </TableCell>
                <TableCell className="">
                  <div className="w-full flex items-center justify-center">
                    <Checkbox
                      checked={notification.loanOverdue}
                      onCheckedChange={(checked) =>
                        updateNotification(
                          index,
                          "loanOverdue",
                          checked as boolean,
                        )
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Email (Turn monthly reports on/off)
            </Label>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="send-report" className="text-sm font-normal">
              Send Report
            </Label>
            <Switch
              id="send-report"
              checked={sendReport}
              onCheckedChange={setSendReport}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
