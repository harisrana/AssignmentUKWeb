export interface RecentEnquiry {
  id: string;
  reference: string;
  subject: string;
  student: string;
  status: 'Pending' | 'InProgress' | 'Review' | 'Delivered';
  submittedDate: string;
}

export interface DashboardStats {
  totalEnquiries: number;
  activeUsers: number;
  estimatedRevenueLast30Days: number;
  currency: string;
  newEnquiriesLast7Days: number;
  recentEnquiries: RecentEnquiry[];
}
