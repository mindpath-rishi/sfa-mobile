export interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend?: number;
}

export interface StatsOverviewSectionProps {
  todayVisits: number;
  totalVisits: number;
  pendingOrders: number;
  collections: string;
  incentives: string;
}
