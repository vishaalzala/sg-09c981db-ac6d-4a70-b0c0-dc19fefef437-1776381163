import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LeadsData } from "@/services/adminService";
import { assignLead, updateLeadStatus } from "@/services/adminService";

type AdminUserOption = {
  id: string;
  full_name: string | null;
  email?: string | null;
};

type LeadItem = LeadsData["leads"][number];

export function LeadsPanel({
  data,
  users = [],
  onRefresh,
}: {
  data: LeadsData | null;
  users?: AdminUserOption[];
  onRefresh?: () => Promise<void> | void;
}) {
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusValue, setStatusValue] = useState("new");
  const [assignedValue, setAssignedValue] = useState<string>("");

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
  }, [users]);

  const openLead = (lead: LeadItem) => {
    setSelectedLead(lead);
    setStatusValue(lead.status || "new");
    setAssignedValue(lead.assignedToId || "");
  };

  const handleSave = async () => {
    if (!selectedLead) return;

    try {
      setSaving(true);
      await updateLeadStatus(selectedLead.id, statusValue);
      await assignLead(selectedLead.id, assignedValue || null);
      await onRefresh?.();
      setSelectedLead(null);
    } catch (error: any) {
      alert(error?.message || "Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

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
                      <p className="text-xs text-muted-foreground">
                        {lead.companyName || "No company"} • {lead.source || "unknown"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{lead.status}</Badge>
                      <Badge variant={lead.assignedToName ? "secondary" : "destructive"}>
                        {lead.assignedToName ? lead.assignedToName : "Unassigned"}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => openLead(lead)}>
                        View
                      </Button>
                    </div>
                  </div>
                  {lead.message && <p className="line-clamp-2 text-sm text-muted-foreground">{lead.message}</p>}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>Review lead information and update assignment or status.</DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Detail label="Name" value={selectedLead.name} />
                <Detail label="Email" value={selectedLead.email} />
                <Detail label="Phone" value={selectedLead.phone || "-"} />
                <Detail label="Company" value={selectedLead.companyName || "-"} />
                <Detail label="Source" value={selectedLead.source || "-"} />
                <Detail label="Created" value={selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleString() : "-"} />
              </div>

              <div>
                <p className="mb-1 text-sm font-medium">Message</p>
                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                  {selectedLead.message || "No message provided"}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Status</label>
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={statusValue} onChange={(e) => setStatusValue(e.target.value)}>
                    <option value="new">new</option>
                    <option value="qualified">qualified</option>
                    <option value="converted">converted</option>
                    <option value="lost">lost</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Assign To</label>
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={assignedValue} onChange={(e) => setAssignedValue(e.target.value)}>
                    <option value="">Unassigned</option>
                    {sortedUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.email || user.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedLead(null)} disabled={saving}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
