export const loanOfficerKeys = {
  all: ["loan-officers"] as const,
  lists: () => [...loanOfficerKeys.all, "list"] as const,
  list: (params?: unknown) =>
    [...loanOfficerKeys.lists(), params ?? {}] as const,
  snapshot: (id: string) => [...loanOfficerKeys.all, "snapshot", id] as const,
  loans: (id: string, params?: unknown) =>
    [...loanOfficerKeys.all, "loans", id, params ?? {}] as const,
};
