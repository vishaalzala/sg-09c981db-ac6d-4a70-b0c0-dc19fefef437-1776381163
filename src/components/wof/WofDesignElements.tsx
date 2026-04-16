import { Car, Disc, Settings, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// A pixel-perfect implementation of the WOF screenshots provided
export function PassFailNA({ status, onChange, showNA = true }: { status: "pass" | "fail" | "na" | null, onChange: (s: "pass" | "fail" | "na") => void, showNA?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={status === "pass" ? "default" : "outline"}
        className={`h-8 rounded-full px-4 text-sm font-medium ${status === "pass" ? "bg-[#1ab272] hover:bg-[#15965f] border-[#1ab272]" : "border-slate-300 text-slate-600"}`}
        onClick={() => onChange("pass")}
      >
        ✓ Pass
      </Button>
      <Button
        type="button"
        variant={status === "fail" ? "destructive" : "outline"}
        className={`h-8 rounded-full px-4 text-sm font-medium ${status === "fail" ? "bg-[#ee4e4e] hover:bg-[#d44343] border-[#ee4e4e]" : "border-slate-300 text-slate-600 hover:border-red-300 hover:text-red-500"}`}
        onClick={() => onChange("fail")}
      >
        ✕ Fail
      </Button>
      {showNA && (
        <Button
          type="button"
          variant={status === "na" ? "secondary" : "outline"}
          className={`h-8 rounded-full px-4 text-sm font-medium ${status === "na" ? "bg-[#546274] text-white hover:bg-[#434f5e] border-[#546274]" : "border-slate-300 text-slate-600"}`}
          onClick={() => onChange("na")}
        >
          ⊖ N/A
        </Button>
      )}
    </div>
  );
}

export function TyreTreadDepth() {
  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="px-6 py-4">
        <span className="bg-[#1c75bc] text-white font-bold px-3 py-1.5 text-lg rounded-sm inline-block tracking-tight">Tyres, wheels and hubs</span>
      </div>
      
      <div className="bg-[#f7f9fa] py-3 flex items-center justify-center gap-2 border-y border-slate-200">
        <div className="bg-[#546274] p-1 rounded-full"><Settings className="h-4 w-4 text-white" /></div>
        <span className="font-bold text-[#141b2d] text-[17px]">Tyre tread depth (mm)</span>
      </div>
      
      <div className="flex items-start justify-center relative max-w-4xl mx-auto py-12 px-8">
        <div className="absolute left-8 top-12">
          <Button variant="outline" className="border-[#f38131] text-[#f38131] font-bold uppercase tracking-wider hover:bg-orange-50 rounded-sm px-6 h-10">
            Calculator
          </Button>
        </div>
        
        <div className="flex items-center gap-10 relative">
          <div className="space-y-20">
            <Input type="number" className="w-24 h-10 text-center bg-white shadow-sm border-slate-200 rounded-sm" defaultValue={0} />
            <Input type="number" className="w-24 h-10 text-center bg-white shadow-sm border-slate-200 rounded-sm" defaultValue={0} />
          </div>
          
          <div className="w-32 h-64 bg-[#d0d4dc] rounded-[3.5rem] opacity-70 relative flex items-center justify-center">
             {/* Stylized top-down car icon */}
             <div className="absolute top-12 -left-3 w-3 h-10 bg-[#aeb4c0] rounded-l-md"></div>
             <div className="absolute top-12 -right-3 w-3 h-10 bg-[#aeb4c0] rounded-r-md"></div>
             <div className="absolute bottom-12 -left-3 w-3 h-10 bg-[#aeb4c0] rounded-l-md"></div>
             <div className="absolute bottom-12 -right-3 w-3 h-10 bg-[#aeb4c0] rounded-r-md"></div>
             <div className="w-20 h-12 bg-white/40 absolute top-14 rounded-t-xl rounded-b-sm"></div>
             <div className="w-20 h-10 bg-white/40 absolute bottom-14 rounded-b-xl rounded-t-sm"></div>
             <div className="w-28 h-6 bg-transparent absolute top-32 border-t-2 border-[#aeb4c0] flex justify-between px-2">
               <div className="w-4 h-full border-l-2 border-[#aeb4c0] rounded-tl-lg"></div>
               <div className="w-4 h-full border-r-2 border-[#aeb4c0] rounded-tr-lg"></div>
             </div>
          </div>
          
          <div className="space-y-20">
            <Input type="number" className="w-24 h-10 text-center bg-white shadow-sm border-slate-200 rounded-sm" defaultValue={0} />
            <Input type="number" className="w-24 h-10 text-center bg-white shadow-sm border-slate-200 rounded-sm" defaultValue={0} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrakesPerformance() {
   return (
     <div className="w-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mt-6 pb-12">
       <div className="px-6 py-4">
         <span className="text-[#f38131] font-bold text-xl tracking-tight">Brakes</span>
       </div>

       <div className="bg-[#f7f9fa] py-3 flex items-center justify-center gap-2 border-y border-slate-200">
         <div className="bg-[#546274] p-1 rounded-full"><Disc className="h-4 w-4 text-white" /></div>
         <span className="font-bold text-[#141b2d] text-[17px]">Brakes performance (%)</span>
       </div>

       <div className="grid grid-cols-3 gap-4 text-center mt-12 px-8">
         {/* Service Brake Column */}
         <div className="flex flex-col items-center">
           <h4 className="mb-8 font-medium text-[#141b2d]">Service Brake:</h4>
           <div className="flex items-center gap-4 relative mb-6">
             <div className="space-y-12">
               <Input type="number" className="w-20 h-10 text-center bg-white shadow-sm rounded-sm" defaultValue={0} />
               <Input type="number" className="w-20 h-10 text-center bg-white shadow-sm rounded-sm" defaultValue={0} />
             </div>
             
             {/* Small Car Icon */}
             <div className="w-20 h-40 bg-[#d0d4dc] rounded-[2rem] opacity-70 relative">
               <div className="w-14 h-8 bg-white/50 absolute top-8 left-3 rounded-t-lg"></div>
               <div className="w-14 h-6 bg-white/50 absolute bottom-8 left-3 rounded-b-lg"></div>
             </div>
             
             <div className="space-y-12">
               <Input type="number" className="w-20 h-10 text-center bg-white shadow-sm rounded-sm" defaultValue={0} />
               <Input type="number" className="w-20 h-10 text-center bg-white shadow-sm rounded-sm" defaultValue={0} />
             </div>
           </div>
           
           <div className="mt-2 flex flex-col items-center">
             <Input type="number" className="w-24 h-10 text-center bg-white shadow-sm rounded-sm mb-1" defaultValue={0} />
             <span className="text-[#546274] text-sm">Overall</span>
           </div>
         </div>

         {/* Imbalance Column */}
         <div className="flex flex-col items-center">
           <h4 className="mb-14 font-medium text-[#141b2d]">Service Brake Imbalance:</h4>
           <div className="space-y-12 w-full flex flex-col items-center">
             <Input type="number" className="w-24 h-10 text-center bg-white shadow-sm border-[#1ab272] text-[#1ab272] rounded-sm" defaultValue={0} />
             <Input type="number" className="w-24 h-10 text-center bg-white shadow-sm border-[#1ab272] text-[#1ab272] rounded-sm" defaultValue={0} />
           </div>
         </div>

         {/* Parking Brake Column */}
         <div className="flex flex-col items-center">
           <h4 className="mb-8 font-medium text-[#141b2d]">Parking Brake:</h4>
           <div className="flex items-center gap-4 relative mb-6">
             <div className="space-y-12 opacity-0 select-none">
               {/* Invisible spacers to match height layout of first column */}
               <Input type="number" className="w-20 h-10" disabled />
             </div>
             
             {/* Small Car Icon */}
             <div className="w-20 h-40 bg-[#d0d4dc] rounded-[2rem] opacity-70 relative">
               <div className="w-14 h-8 bg-white/50 absolute top-8 left-3 rounded-t-lg"></div>
               <div className="w-14 h-6 bg-white/50 absolute bottom-8 left-3 rounded-b-lg"></div>
             </div>
             
             <div className="absolute bottom-6 -left-16 flex justify-between w-[calc(100%+8rem)]">
                <Input type="number" className="w-20 h-10 text-center bg-white shadow-sm rounded-sm" defaultValue={0} />
                <Input type="number" className="w-20 h-10 text-center bg-white shadow-sm rounded-sm" defaultValue={0} />
             </div>
           </div>
           
           <div className="mt-2 flex flex-col items-center">
             <Input type="number" className="w-24 h-10 text-center bg-white shadow-sm rounded-sm mb-1" defaultValue={0} />
             <span className="text-[#546274] text-sm">Overall</span>
           </div>
         </div>
       </div>

       <div className="mt-12 text-center pt-8 border-t border-slate-100 max-w-sm mx-auto">
         <span className="text-[#546274] text-sm block mb-3 font-medium">Stall Test</span>
         <div className="inline-flex rounded-sm shadow-sm border border-[#aeb4c0]">
           <Button variant="ghost" className="rounded-r-none rounded-l-sm px-8 h-10 border-r border-[#aeb4c0] text-[#546274] hover:bg-slate-100 uppercase tracking-widest font-semibold">FAIL</Button>
           <Button variant="ghost" className="rounded-l-none rounded-r-sm px-8 h-10 text-[#546274] hover:bg-slate-100 uppercase tracking-widest font-semibold">PASS</Button>
         </div>
       </div>
     </div>
   );
}