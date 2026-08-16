/** Status is a free-form name matched against the admin-configurable EnquiryStatus catalog — no longer a fixed set. */
export type EnquiryStatus = string;

export interface RecentEnquiry {
  id: string;
  reference: string;
  subject: string;
  student: string;
  status: EnquiryStatus;
  submittedDate: string;
  words: number;
  estimatedTotal: number;
  currency: string;
  discountPercentage: number | null;
  discountRuleName: string | null;
  assignedToUserId: string | null;
  assignedToName: string | null;
  attachmentUrl: string | null;
  attachmentFileName: string | null;
}

export interface EnquiryStatusHistoryEntry {
  id: string;
  fromStatus: EnquiryStatus | null;
  toStatus: EnquiryStatus;
  changedByName: string | null;
  changedAt: string;
}

export interface DashboardStats {
  totalEnquiries: number;
  activeUsers: number;
  estimatedRevenueLast30Days: number;
  currency: string;
  newEnquiriesLast7Days: number;
}
