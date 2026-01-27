'use client';

import { EventCalendar } from "@/components/calendar/event-calendar";

export default function CalendarPage() {
  // Use negative margins to occupy the full space provided by the main layout
  return (
    <div className="-m-4 sm:-m-6 lg:-m-8">
      <EventCalendar />
    </div>
  );
}
