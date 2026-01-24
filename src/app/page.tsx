import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <WelcomeBanner />
      <StatsCards />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProgressChart />
        </div>
        <div className="lg:col-span-1">
          <UpcomingTasks />
        </div>
      </div>
    </div>
  );
}
