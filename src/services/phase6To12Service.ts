export type RevenueOpsSummary = {
  trialsEndingSoon: number;
  renewalsNext14Days: number;
  failedPayments: number;
};

export type SmsBillingSummary = {
  activeCompaniesWithUsage: number;
  estimatedMonthAmount: number;
};

export const phase6To12ServiceNotes = {
  revenueOps: "Implement read-only operational summaries first.",
  smsBilling: "Calculate estimates before posting charges.",
  companyControl: "Use soft-locks and audit trails.",
  userLifecycle: "Gate all actions by internal role.",
  internalRoles: "Default deny. Explicit permission grants.",
  analytics: "Prefer read-only views/materialized views.",
  automations: "Start in dry-run mode."
};
