import { GoalBoard } from "@/components/goals/goal-board";
import { goals } from "@/lib/placeholder-data";

export default function GoalsPage() {
  return <GoalBoard initialGoals={goals} />;
}
