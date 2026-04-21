import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LeadsData } from "@/services/adminService";

export function LeadsPanel({ data }: { data: LeadsData | null }) {
  if (!data) {
    return <div className="text-sm text-muted-foreground">No leads data available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="New" value={data.summary.newLeads} />
        <Metric title="Qualified" value={data.summary.qualifiedLeads} />
        <Metric title="Converted" value={data.summary.convertedLeads} />
        <Metric title="Unassigned" value={data.summary.unassignedLeads} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Queue</CardTitle>
          <CardDescription>Website lead capture and sales handoff foundation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.leads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads yet.</p>
            ) : (
              data.leads.map((lead) => (
                <div key={lead.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                      <p className="text-xs text-muted-foreground">{lead.companyName || "No company"} • {lead.source || "unknown"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{lead.status}</Badge>
                      <Badge variant={lead.assignedToName ? "secondary" : "destructive"}>{lead.assignedToName ? lead.assignedToName : "Unassigned"}</Badge>
                    </div>
                  </div>
                  {lead.message && <p className="text-sm text-muted-foreground">{lead.message}</p>}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
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
