import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { NotificationsData } from "@/services/adminService";

export function NotificationsPanel({ data }: { data: NotificationsData | null }) {
  if (!data) {
    return <div className="text-sm text-muted-foreground">No notifications data available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="SMTP Configured" value={data.health.smtpConfigured ? "Yes" : "No"} />
        <Metric title="Templates" value={String(data.summary.templateCount)} />
        <Metric title="Sent 7d" value={String(data.summary.sentLast7Days)} />
        <Metric title="Failed 7d" value={String(data.summary.failedLast7Days)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Templates</CardTitle>
          <CardDescription>Safe foundation only. No sending changes until you switch flows.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.templates.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No templates found.
              </div>
            ) : (
              data.templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">{template.templateKey} • {template.channel}</p>
                  </div>
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notification Logs</CardTitle>
          <CardDescription>Last 10 events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No logs yet.</p>
            ) : (
              data.logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{log.subject || log.templateKey || log.channel}</p>
                    <p className="text-sm text-muted-foreground">{log.recipient || "No recipient"}</p>
                  </div>
                  <Badge variant={log.status === "failed" ? "destructive" : "outline"}>{log.status}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
