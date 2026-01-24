import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "lucide-react";

export function FirebaseConfigWarning() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
          <div className="flex items-center gap-4">
              <div className="bg-destructive/20 p-3 rounded-md">
                  <Code className="w-8 h-8 text-destructive" />
              </div>
              <div>
                  <CardTitle className="text-2xl text-destructive">Action Required: Firebase Configuration Missing</CardTitle>
                  <CardDescription>
                      Your app cannot connect to Firebase because the configuration is missing.
                  </CardDescription>
              </div>
          </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <p>To fix this, you must perform these manual steps:</p>
        <ol className="list-decimal list-inside space-y-3 bg-muted/50 p-4 rounded-md">
          <li>
            In the file explorer, create a new file named <code className="font-bold bg-primary/10 text-primary p-1 rounded">.env.local</code> in the root of the project.
          </li>
          <li>
            Copy the content from <code className="font-bold bg-primary/10 text-primary p-1 rounded">.env.local.example</code> into your new file.
          </li>
          <li>
            Fill in the values in <code className="font-bold bg-primary/10 text-primary p-1 rounded">.env.local</code> with your real Firebase project keys.
          </li>
          <li>
            **Restart the development server** for the changes to apply.
          </li>
        </ol>
        <p className="text-muted-foreground text-xs">
          As an AI, I cannot perform these steps for you as they involve your secret keys. This is a security measure.
        </p>
      </CardContent>
    </Card>
  );
}
