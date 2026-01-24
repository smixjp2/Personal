import { EventCalendar } from "@/components/calendar/event-calendar";
import { tasks } from "@/lib/placeholder-data";

export default function CalendarPage() {
  return (
    <div>
      <EventCalendar tasks={tasks} />
    </div>
  );
}
