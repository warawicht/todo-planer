export interface DashboardWidget {
  id: string;
  userId: string;
  widgetType: 'completion-chart' | 'time-tracking-chart' | 'trend-chart' | 'task-summary' | 'time-summary';
  position: number;
  config: any; // JSON configuration for the widget
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  data?: any; // Aggregated data for the widget
}

export interface DashboardConfigDto {
  userId: string;
  widgetType: 'completion-chart' | 'time-tracking-chart' | 'trend-chart' | 'task-summary' | 'time-summary';
  position?: number;
  config?: any;
  isVisible?: boolean;
}

export interface CompletionChartData {
  period: 'daily' | 'weekly' | 'monthly';
  data: {
    date: string;
    completionRate: number;
    tasksCompleted: number;
    tasksCreated: number;
  }[];
}

export interface TimeTrackingChartData {
  totalTimeTracked: number;
  totalTimeTrackedHours: number;
  dailyData: {
    date: string;
    duration: number;
    durationHours: number;
  }[];
}

export interface TrendChartData {
  data: {
    period: string;
    productivityScore: number;
    tasksCompleted: number;
    timeTracked: number;
  }[];
}

export interface TaskSummaryData {
  tasksCompleted: number;
  tasksCreated: number;
  completionRate: number;
  overdueTasks: number;
}

export interface TimeSummaryData {
  totalTimeTracked: number;
  totalTimeTrackedHours: number;
}