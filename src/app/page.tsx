import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { WeeklyReview } from "@/components/dashboard/weekly-review";
import { DailyBriefing } from "@/components/dashboard/daily-briefing";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <WelcomeBanner />
      <DailyBriefing />
      <StatsCards />
      <WeeklyReview />
    </div>
  );
}
