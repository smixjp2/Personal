import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { DailyBriefing } from "@/components/dashboard/daily-briefing";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <WelcomeBanner />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DailyBriefing />
        <UpcomingEvents />
      </div>
    </div>
  );
}
