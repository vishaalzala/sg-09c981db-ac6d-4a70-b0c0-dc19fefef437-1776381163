import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, Building2, User as UserIcon, Car, FileText, MoreVertical } from "lucide-react";
import { customerService } from "@/services/customerService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

export default function Customers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    email: "",
    mobile: "",
    phone: "",
    is_company: false,
    company_name: "",
    postal_address: "",
    physical_address: "",
  });

  const handleAddCustomer = async () => {
    if (!newCustomer.full_name) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const company = await companyService.getCurrentCompany();
      if (!company) throw new Error("No company context found");

      await customerService.createCustomer({
        ...newCustomer,
        company_id: company.id,
      } as any);

      toast({ title: "Success", description: "Customer created successfully" });
      setShowAddDialog(false);
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadData = async () => {
    const company = await companyService.getCurrentCompany();
    if (company) {
      // Load recent customers by default
      const results = await customerService.searchCustomers("", company.id, 50);
      setCustomers(results);
    }
    setLoading(false);
  };

  const searchCustomers = async () => {
    if (companyId) {
      const results = await customerService.searchCustomers(searchQuery, companyId, 50);
      setCustomers(results);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground mt-1">
              Manage your customer database and relationships
            </p>
          </div>
          <Link href="/customers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile, phone, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline">Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
            <CardDescription>
              {customers.length} customer{customers.length !== 1 ? "s" : ""} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <EmptyState
                icon={UserIcon}
                title="No customers found"
                description="Get started by adding your first customer to the system"
                action={{
                  label: "Add Customer",
                  onClick: () => window.location.href = "/customers/new",
                }}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link href={`/customers/${customer.id}`} className="font-medium hover:text-primary">
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {customer.is_company ? (
                          <Badge variant="secondary" className="gap-1">
                            <Building2 className="h-3 w-3" />
                            Company
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <UserIcon className="h-3 w-3" />
                            Individual
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.mobile && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {customer.mobile}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.location.href = `/customers/${customer.id}`}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.location.href = `/customers/${customer.id}/edit`}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.location.href = `/jobs/new?customer=${customer.id}`}>
                              Create Job
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}