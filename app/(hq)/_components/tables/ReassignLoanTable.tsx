/**
 * ReassignLoanTable is no longer used for direct officer-to-officer reassignment.
 * That workflow is now handled by ReassignLoansDialog which fetches live officer
 * loans and targets from the API. This stub is kept to avoid breaking any existing
 * import references while the codebase is migrated.
 */
import React from "react";

const ReassignLoanTable = () => {
  return (
    <div className="p-4 text-sm text-muted-foreground text-center">
      Use the Reassign Loans button in the Loan Officers table to reassign loans.
    </div>
  );
};

export default ReassignLoanTable;
