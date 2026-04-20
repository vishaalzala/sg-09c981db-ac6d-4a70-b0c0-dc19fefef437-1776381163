import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { reminderTypeService } from "@/services/reminderTypeService";
import { Trash2, Edit2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ReminderType {
  id: string;
  name: string;
  is_system: boolean;
  company_id: string;
  created_at: string;
}

export default function RemindersSettings() {
  const [reminderTypes, setReminderTypes] = useState<ReminderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const { toast } = useToast();

  const companyId = "00000000-0000-0000-0000-000000000000"; // TODO: Get from auth context

  useEffect(() => {
    loadReminderTypes();
  }, []);

  async function loadReminderTypes() {
    try {
      setLoading(true);
      const data = await reminderTypeService.getReminderTypes(companyId);
      setReminderTypes(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reminder types",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formName.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingId) {
        await reminderTypeService.updateReminderType(editingId, formName);
        toast({ title: "Success", description: "Reminder type updated" });
      } else {
        await reminderTypeService.createReminderType({
          name: formName,
          is_system: false,
          company_id: companyId,
        });
        toast({ title: "Success", description: "Reminder type created" });
      }
      setDialogOpen(false);
      setFormName("");
      setEditingId(null);
      loadReminderTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save reminder type",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this reminder type?")) return;

    try {
      await reminderTypeService.deleteReminderType(id);
      toast({ title: "Success", description: "Reminder type deleted" });
      loadReminderTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reminder type",
        variant: "destructive",
      });
    }
  }

  function openEditDialog(type: ReminderType) {
    setEditingId(type.id);
    setFormName(type.name);
    setDialogOpen(true);
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormName("");
    setDialogOpen(true);
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Reminder Types</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage reminder types that sync across invoices, quotes, and the reminders page
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "New"} Reminder Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Brake Inspection"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reminder Types</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : reminderTypes.length === 0 ? (
              <p className="text-muted-foreground">No reminder types found. Create one to get started.</p>
            ) : (
              <div className="space-y-2">
                {reminderTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{type.name}</p>
                      {type.is_system && (
                        <p className="text-xs text-muted-foreground">System type</p>
                      )}
                    </div>
                    {!type.is_system && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(type)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(type.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}