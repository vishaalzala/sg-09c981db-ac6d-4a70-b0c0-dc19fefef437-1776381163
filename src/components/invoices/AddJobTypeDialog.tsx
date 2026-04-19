import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddJobTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (jobTypes: string[]) => void;
}

const JOB_TYPES = [
  "Advance Car Service",
  "Air Conditioning",
  "Auto Electrical",
  "Automatic Transmission Flush",
  "Basic Car Service",
  "Brake Fluid Flush",
  "Brake Pads",
  "Comprehensive Service",
  "Cooling Systems",
  "Diagnostic Scan",
  "Diesel Service",
  "European Service",
  "LPG/CNG/NGV (NGV3) Official",
  "Power Steering Flush",
  "Pre Purchase Inspection",
  "Puncture Car",
  "Puncture CAR/SUV/4x4",
  "Suspension & Shock Absorbers",
  "Tyre repair",
  "Warrant of Fitness - Car",
  "Warrant of Fitness - Trailer/U",
  "Wheel Alignment Car"
];

export function AddJobTypeDialog({ open, onClose, onAdd }: AddJobTypeDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const filteredTypes = JOB_TYPES.filter(type =>
    type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (selectedTypes.length > 0) {
      onAdd(selectedTypes);
      setSelectedTypes([]);
      setSearchTerm("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Job Types</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search job types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredTypes.map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    if (selectedTypes.includes(type)) {
                      setSelectedTypes(selectedTypes.filter(t => t !== type));
                    } else {
                      setSelectedTypes([...selectedTypes, type]);
                    }
                  }}
                >
                  <span className={selectedTypes.includes(type) ? "font-semibold" : ""}>
                    {type}
                  </span>
                </Button>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleAdd} className="flex-1" disabled={selectedTypes.length === 0}>
              Add Selected ({selectedTypes.length})
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}