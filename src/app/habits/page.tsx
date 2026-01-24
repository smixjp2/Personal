import { HabitTracker } from "@/components/habits/habit-tracker";
import { habits } from "@/lib/placeholder-data";

export default function HabitsPage() {
  return (
    <div className="container mx-auto max-w-5xl">
      <HabitTracker initialHabits={habits} />
    </div>
  );
}
