import { AiPrioritizer } from "@/components/tasks/ai-prioritizer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Inbox</CardTitle>
          <CardDescription>All your tasks in one place. Use AI to prioritize your day.</CardDescription>
        </CardHeader>
        <CardContent>
            <AiPrioritizer />
        </CardContent>
      </Card>
    </div>
  );
}
