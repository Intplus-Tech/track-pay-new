// components/portfolio-snapshot-card.tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProblemLoan {
  name: string;
  daysOverdue?: number;
  balance?: string;
  type: string;
}

interface PortfolioCardProps {
  title: string;
  assignedLoans: {
    current: number;
    capacity: number;
  };
  currentMonth: {
    collected: string;
    target: string;
  };
  problemLoans: ProblemLoan[];
}

export function PortfolioCard({
  title,
  assignedLoans,
  currentMonth,
  problemLoans,
}: PortfolioCardProps) {
  const capacityPercentage = Math.round(
    (assignedLoans.current / assignedLoans.capacity) * 100
  );

  return (
    <div className="w-full max-w-md border-0">
      <div className="pb-2">
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Assigned Loans:</p>
            <p className="font-medium">
              {assignedLoans.current}/{assignedLoans.capacity} ({capacityPercentage}% capacity)
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Current Month:</p>
            <div className="space-y-1">
              <div>
                <span className="text-sm">Collected</span>
                <p className="font-bold">{currentMonth.collected}</p>
              </div>
              <div>
                <span className="text-sm">Target</span>
                <p className="font-bold">{currentMonth.target}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-bold mb-2">Problem Loans:</h4>

          <div className="space-y-3">
            <div>
              <Badge variant="destructive" className="mb-1">Overdue loans</Badge>
              <ul className="space-y-1">
                {problemLoans
                  .filter(loan => loan.type === "overdue")
                  .map((loan, index) => (
                    <li key={index} className="text-sm">
                      • {loan.name} ({loan.daysOverdue} Days)
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <Badge className="mb-1">Partial Payments</Badge>
              <ul className="space-y-1">
                {problemLoans
                  .filter(loan => loan.type === "partial")
                  .map((loan, index) => (
                    <li key={index} className="text-sm">
                      • {loan.name} ({loan.balance} Bal.)
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}