export interface DashboardStats {
  totalOrders: number;
  activeWriters: number;
  revenue: number;
  satisfaction: number;
}

export interface RecentOrder {
  id: string;
  subject: string;
  student: string;
  status: 'In Progress' | 'Delivered' | 'Review' | 'Pending';
  dueDate: string;
}
