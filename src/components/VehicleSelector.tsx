import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { vehicleService, type Vehicle } from "@/services/vehicleService";

interface VehicleSelectorProps {
  value?: string;
  onChange: (vehicleId: string, vehicle: Vehicle) => void;
  companyId: string;
  customerId?: string;
  placeholder?: string;
  allowCreate?: boolean;
}

export function VehicleSelector({ 
  value, 
  onChange, 
  companyId, 
  customerId,
  placeholder = "Select vehicle...",
  allowCreate = true 
}: VehicleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create vehicle dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newVehicleRego, setNewVehicleRego] = useState("");
  const [newVehicleMake, setNewVehicleMake] = useState("");
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [newVehicleYear, setNewVehicleYear] = useState("");

  useEffect(() => {
    if (search.trim()) {
      setIsLoading(true);
      vehicleService.searchVehicles(search, companyId).then(data => {
        // Filter by customer if provided
        const filtered = customerId 
          ? data.filter(v => v.customer?.id === customerId)
          : data;
        setVehicles(filtered);
        setIsLoading(false);
      });
    } else if (customerId) {
      vehicleService.getCustomerVehicles(customerId).then(data => {
        setVehicles(data);
      });
    } else {
      setVehicles([]);
    }
  }, [search, companyId, customerId]);

  useEffect(() => {
    if (value) {
      vehicleService.getVehicle(value).then(data => {
        if (data) setSelectedVehicle(data);
      });
    }
  }, [value]);

  const handleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    onChange(vehicle.id, vehicle);
    setOpen(false);
  };

  const handleCreateVehicle = async () => {
    if (!customerId) return;

    try {
      const newVehicle = await vehicleService.createVehicle({
        company_id: companyId,
        customer_id: customerId,
        registration_number: newVehicleRego,
        make: newVehicleMake || null,
        model: newVehicleModel || null,
        year: newVehicleYear ? parseInt(newVehicleYear) : null,
        vin: null,
        body_type: null,
        odometer: null,
        colour: null,
        engine_size: null,
        transmission: null,
        fuel_type: null,
        wof_expiry: null,
        rego_expiry: null,
        service_due_date: null,
        service_due_odometer: null,
        last_service_odometer: null,
        is_courtesy_vehicle: false,
        deleted_at: null,
        carjam_data: null,
        carjam_last_fetched: null,
        notes: null,
        created_by: null,
        last_service_date: null,
        odometer_unit: "km",
      });

      handleSelect(newVehicle);
      setShowCreateDialog(false);
      
      // Reset form
      setNewVehicleRego("");
      setNewVehicleMake("");
      setNewVehicleModel("");
      setNewVehicleYear("");
    } catch (error) {
      console.error("Failed to create vehicle:", error);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedVehicle ? (
              <span className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                {selectedVehicle.registration_number || selectedVehicle.rego} - {selectedVehicle.make} {selectedVehicle.model}
              </span>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput 
              placeholder="Search by rego, make, model..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    {customerId ? "No vehicle found" : "Select a customer first"}
                  </p>
                  {allowCreate && customerId && (
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setOpen(false);
                        setShowCreateDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Vehicle
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {vehicles.map(vehicle => (
                  <CommandItem
                    key={vehicle.id}
                    value={vehicle.id}
                    onSelect={() => handleSelect(vehicle)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === vehicle.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{vehicle.registration_number || vehicle.rego}</p>
                      <p className="text-xs text-muted-foreground">
                        {vehicle.make} {vehicle.model} {vehicle.year}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rego">Registration Number *</Label>
              <Input
                id="rego"
                value={newVehicleRego}
                onChange={e => setNewVehicleRego(e.target.value.toUpperCase())}
                placeholder="ABC123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={newVehicleMake}
                onChange={e => setNewVehicleMake(e.target.value)}
                placeholder="Toyota"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={newVehicleModel}
                onChange={e => setNewVehicleModel(e.target.value)}
                placeholder="Corolla"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={newVehicleYear}
                onChange={e => setNewVehicleYear(e.target.value)}
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateVehicle}
                disabled={!newVehicleRego.trim()}
              >
                Create Vehicle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}