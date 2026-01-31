import { CalendarView } from '@/components/calendar/calendar-view';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Calendrier</h1>
      </div>
      <CalendarView />
    </div>
  );
}
