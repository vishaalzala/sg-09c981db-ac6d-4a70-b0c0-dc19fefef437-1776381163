import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { customerService, type Customer } from "@/services/customerService";

interface CustomerSelectorProps {
  value?: string;
  onChange: (customerId: string, customer: Customer) => void;
  companyId: string;
  placeholder?: string;
}

export function CustomerSelector({ value, onChange, companyId, placeholder = "Select customer..." }: CustomerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create customer dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerMobile, setNewCustomerMobile] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerIsCompany, setNewCustomerIsCompany] = useState(false);

  useEffect(() => {
    if (search.trim()) {
      setIsLoading(true);
      customerService.searchCustomers(search, companyId).then(data => {
        setCustomers(data);
        setIsLoading(false);
      });
    } else {
      setCustomers([]);
    }
  }, [search, companyId]);

  useEffect(() => {
    if (value) {
      customerService.getCustomer(value).then(data => {
        if (data) setSelectedCustomer(data);
      });
    }
  }, [value]);

  const handleSelect = (customer: any) => {
    setSelectedCustomer(customer);
    onChange(customer.id, customer);
    setOpen(false);
  };

  const handleCreateCustomer = async () => {
    try {
      const newCustomer = await customerService.createCustomer({
        company_id: companyId,
        name: newCustomerName,
        is_company: newCustomerIsCompany,
        mobile: newCustomerMobile || null,
        phone: newCustomerPhone || null,
        email: newCustomerEmail || null,
        source_of_business: null,
        marketing_consent: false,
        deleted_at: null,
      });

      handleSelect(newCustomer);
      setShowCreateDialog(false);
      
      // Reset form
      setNewCustomerName("");
      setNewCustomerMobile("");
      setNewCustomerPhone("");
      setNewCustomerEmail("");
      setNewCustomerIsCompany(false);
    } catch (error) {
      console.error("Failed to create customer:", error);
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
            {selectedCustomer ? (
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {selectedCustomer.name}
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
              placeholder="Search by name, mobile, phone, email..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">No customer found</p>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setOpen(false);
                      setShowCreateDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Customer
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {customers.map(customer => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    onSelect={() => handleSelect(customer)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.mobile || customer.phone || customer.email}
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
            <DialogTitle>Create New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newCustomerName}
                onChange={e => setNewCustomerName(e.target.value)}
                placeholder="Customer name"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_company"
                checked={newCustomerIsCompany}
                onCheckedChange={checked => setNewCustomerIsCompany(checked as boolean)}
              />
              <Label htmlFor="is_company" className="text-sm font-normal">
                This is a company/fleet account
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={newCustomerMobile}
                onChange={e => setNewCustomerMobile(e.target.value)}
                placeholder="021 123 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newCustomerPhone}
                onChange={e => setNewCustomerPhone(e.target.value)}
                placeholder="09 123 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newCustomerEmail}
                onChange={e => setNewCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCustomer}
                disabled={!newCustomerName.trim()}
              >
                Create Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}