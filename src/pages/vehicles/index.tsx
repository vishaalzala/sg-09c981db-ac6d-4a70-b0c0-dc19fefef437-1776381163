import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Car as CarIcon, User, Calendar, MoreVertical } from "lucide-react";
import { vehicleService } from "@/services/vehicleService";
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

export default function VehiclesPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (companyId && searchQuery) {
      searchVehicles();
    }
  }, [searchQuery, companyId]);

  const loadData = async () => {
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      // Load recent vehicles by default
      const results = await vehicleService.searchVehicles("", company.id, 50);
      setVehicles(results);
    }
    setLoading(false);
  };

  const searchVehicles = async () => {
    if (companyId) {
      const results = await vehicleService.searchVehicles(searchQuery, companyId, 50);
      setVehicles(results);
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
            <h1 className="font-heading text-3xl font-bold">Vehicles</h1>
            <p className="text-muted-foreground mt-1">
              Manage vehicle fleet and service history
            </p>
          </div>
          <Link href="/vehicles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
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
                  placeholder="Search by rego, VIN, make, model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline">Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Vehicles</CardTitle>
            <CardDescription>
              {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
              <EmptyState
                icon={CarIcon}
                title="No vehicles found"
                description="Get started by adding your first vehicle to the system"
                action={{
                  label: "Add Vehicle",
                  onClick: () => window.location.href = "/vehicles/new",
                }}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Due Dates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link href={`/vehicles/${vehicle.id}`} className="font-medium hover:text-primary">
                          {vehicle.registration_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                          {vehicle.year && (
                            <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {Array.isArray(vehicle.customer) ? vehicle.customer[0]?.name : vehicle.customer?.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {vehicle.wof_expiry && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">WOF</Badge>
                              <span className="text-muted-foreground">
                                {new Date(vehicle.wof_expiry).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {vehicle.service_due_date && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">Service</Badge>
                              <span className="text-muted-foreground">
                                {new Date(vehicle.service_due_date).toLocaleDateString()}
                              </span>
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
                            <DropdownMenuItem onClick={() => window.location.href = `/vehicles/${vehicle.id}`}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.location.href = `/vehicles/${vehicle.id}/edit`}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.location.href = `/jobs/new?vehicle=${vehicle.id}`}>
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