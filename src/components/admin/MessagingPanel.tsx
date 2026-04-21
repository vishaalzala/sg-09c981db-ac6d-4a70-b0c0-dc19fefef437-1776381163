import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MessagingData } from "@/services/adminService";

export function MessagingPanel({ data }: { data: MessagingData | null }) {
  if (!data) {
    return <div className="text-sm text-muted-foreground">No messaging data available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Twilio Configured" value={data.health.twilioConfigured ? "Yes" : "No"} />
        <Metric title="Numbers" value={String(data.summary.numberCount)} />
        <Metric title="Messages 7d" value={String(data.summary.messagesLast7Days)} />
        <Metric title="Inbound 7d" value={String(data.summary.inboundLast7Days)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Twilio Numbers</CardTitle>
          <CardDescription>Company routing foundation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.numbers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No Twilio numbers saved yet.</p>
            ) : (
              data.numbers.map((number) => (
                <div key={number.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{number.phoneNumber}</p>
                    <p className="text-sm text-muted-foreground">{number.companyName || "Unassigned"}</p>
                  </div>
                  <Badge variant={number.isActive ? "default" : "secondary"}>{number.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent SMS</CardTitle>
          <CardDescription>Latest inbound and outbound messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No SMS messages yet.</p>
            ) : (
              data.messages.map((message) => (
                <div key={message.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{message.companyName || "Unknown company"}</p>
                      <p className="text-sm text-muted-foreground">{message.fromNumber} → {message.toNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{message.direction}</Badge>
                      <Badge variant={message.status === "failed" ? "destructive" : "secondary"}>{message.status}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{message.body}</p>
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
