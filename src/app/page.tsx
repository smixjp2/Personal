import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { DailyBriefing } from "@/components/dashboard/daily-briefing";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <WelcomeBanner />
      <DailyBriefing />
    </div>
  );
}
