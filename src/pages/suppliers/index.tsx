import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";

export default function Suppliers() {
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) {
        setCompanyId(c.id);
        loadSuppliers(c.id);
      }
    });
  }, []);

  const loadSuppliers = async (cId: string) => {
    const { data } = await supabase
      .from("suppliers")
      .select("*")
      .eq("company_id", cId)
      .order("name");
    setSuppliers(data || []);
  };

  const handleCreate = async () => {
    if (!companyId) return;

    const { error } = await supabase
      .from("suppliers")
      .insert([{ ...newSupplier, company_id: companyId }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create supplier",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Supplier created successfully"
    });

    setShowNewDialog(false);
    setNewSupplier({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      notes: ""
    });
    loadSuppliers(companyId);
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">Suppliers</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Supplier
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NAME</TableHead>
                  <TableHead>CONTACT PERSON</TableHead>
                  <TableHead>EMAIL</TableHead>
                  <TableHead>PHONE</TableHead>
                  <TableHead>ADDRESS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contact_person}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  value={newSupplier.contact_person}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contact_person: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreate} className="flex-1">Save</Button>
              <Button onClick={() => setShowNewDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}