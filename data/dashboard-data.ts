export interface DashboardData {
  id: string;
  time: string;
  loanId: string;
  loanee: string;
  branchOfficer: string;
  amountPaid: number;
  outstandingLoan: number;
  status: "On-Time" | "Partial" | "Overdue";
}

export const dashboardData: DashboardData[] = [
  {
    id: "1",
    time: "10:15 AM",
    loanId: "LN-3259",
    loanee: "Adebola Seun",
    branchOfficer: "Lagos Mainland/Akin",
    amountPaid: 442500,
    outstandingLoan: 945500,
    status: "On-Time",
  },
  {
    id: "2",
    time: "10:16 AM",
    loanId: "LN-1928",
    loanee: "Chika Obi",
    branchOfficer: "Abuja/Kingsley",
    amountPaid: 918000,
    outstandingLoan: 945500,
    status: "Partial",
  },
  {
    id: "3",
    time: "10:17 AM",
    loanId: "LN-1633",
    loanee: "Fatima Yusuf",
    branchOfficer: "Kano/Habeeb",
    amountPaid: 928000,
    outstandingLoan: 945500,
    status: "Overdue",
  },
  {
    id: "4",
    time: "10:18 AM",
    loanId: "LN-1808",
    loanee: "Emeka Okonkwo",
    branchOfficer: "Opebi/Benedicta",
    amountPaid: 982300,
    outstandingLoan: 1224600,
    status: "On-Time",
  },
];

export const chartData = [
  { month: "Jan", approved: 4000, disbursed: 2400, overdue: 1800 },
  { month: "Feb", approved: 3000, disbursed: 1398, overdue: 2200 },
  { month: "Mar", approved: 2000, disbursed: 2800, overdue: 1400 },
  { month: "Apr", approved: 2780, disbursed: 3908, overdue: 1600 },
  { month: "May", approved: 1890, disbursed: 4800, overdue: 1200 },
  { month: "Jun", approved: 2390, disbursed: 3800, overdue: 1800 },
  { month: "Jul", approved: 3490, disbursed: 4300, overdue: 2100 },
  { month: "Aug", approved: 3000, disbursed: 2400, overdue: 1500 },
  { month: "Sep", approved: 4200, disbursed: 3200, overdue: 1900 },
  { month: "Oct", approved: 3800, disbursed: 3600, overdue: 1700 },
  { month: "Nov", approved: 4100, disbursed: 3900, overdue: 1400 },
  { month: "Dec", approved: 4500, disbursed: 4200, overdue: 1600 },
];
