import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Printer, Mail, Send, Loader2, FileText, CheckCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "invoice" | "quote" | "job" | "wof";
  entityId: string;
  customerEmail?: string;
}

export function DocumentModal({ isOpen, onClose, title, type, entityId, customerEmail }: DocumentModalProps) {
  const [tab, setTab] = useState<"preview" | "email">("preview");
  const [email, setEmail] = useState(customerEmail || "");
  const [message, setMessage] = useState(`Hi,\n\nPlease find attached your ${type}.\n\nKind regards,\nAutoTech Workshop`);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handlePrint = () => {
    // In a full implementation, this triggers a hidden iframe print or opens a PDF blob
    window.print();
  };

  const handleSendEmail = () => {
    if (!email) {
      toast({ title: "Email required", description: "Please provide a destination email address.", variant: "destructive" });
      return;
    }
    
    setSending(true);
    // Simulate API call to email service
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast({ title: "Email Sent", description: `Document successfully emailed to ${email}` });
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 pb-2 border-b bg-muted/30">
          <DialogHeader>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription>Print A4 document or send via email to the customer.</DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-6">
            <Button 
              variant={tab === "preview" ? "default" : "outline"} 
              onClick={() => setTab("preview")}
              className="rounded-b-none border-b-0"
            >
              <Printer className="h-4 w-4 mr-2" />
              Preview & Print
            </Button>
            <Button 
              variant={tab === "email" ? "default" : "outline"} 
              onClick={() => setTab("email")}
              className="rounded-b-none border-b-0"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Document
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-100 p-6 print:p-0 print:bg-white relative">
          {tab === "preview" ? (
            <div className="max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm] print:shadow-none print:w-full print:h-full print:m-0">
               {/* A4 Document Placeholder */}
               <div className="p-12 print:p-8">
                  <div className="flex justify-between items-start border-b pb-8 mb-8">
                    <div>
                      <h1 className="text-4xl font-bold text-primary uppercase tracking-wider">{type}</h1>
                      <p className="text-muted-foreground mt-2 font-mono text-sm">REF: {entityId.substring(0,8).toUpperCase()}</p>
                      <p className="text-muted-foreground font-mono text-sm">DATE: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <h2 className="font-bold text-xl">AutoTech Workshop</h2>
                      <p className="text-sm text-muted-foreground mt-1">123 Mechanic Ave<br/>Auckland 1010<br/>0800 123 456<br/>GST: 123-456-789</p>
                    </div>
                  </div>
                  
                  {/* Body Placeholder depending on type */}
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                          <h3 className="font-bold text-sm text-muted-foreground uppercase mb-2">BILL TO / CUSTOMER</h3>
                          <p className="font-medium">Client Name</p>
                          <p className="text-sm text-muted-foreground">client@example.com<br/>021 000 0000</p>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-muted-foreground uppercase mb-2">VEHICLE DETAILS</h3>
                          <p className="font-medium">ABC123</p>
                          <p className="text-sm text-muted-foreground">2019 Toyota Corolla GX<br/>Odometer: 105,432 km</p>
                        </div>
                     </div>
                     
                     <div className="border rounded-lg overflow-hidden">
                       <table className="w-full text-sm">
                         <thead className="bg-muted text-muted-foreground">
                           <tr>
                             <th className="text-left p-3">Description</th>
                             <th className="text-right p-3">Qty</th>
                             <th className="text-right p-3">Rate</th>
                             <th className="text-right p-3">Total</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y">
                           <tr>
                             <td className="p-3">Standard Service Labour</td>
                             <td className="text-right p-3">2.5</td>
                             <td className="text-right p-3">$95.00</td>
                             <td className="text-right p-3">$237.50</td>
                           </tr>
                           <tr>
                             <td className="p-3">Oil Filter (Z79A)</td>
                             <td className="text-right p-3">1.0</td>
                             <td className="text-right p-3">$24.00</td>
                             <td className="text-right p-3">$24.00</td>
                           </tr>
                           <tr>
                             <td className="p-3">Synthetic Engine Oil 5W-30</td>
                             <td className="text-right p-3">5.0</td>
                             <td className="text-right p-3">$18.00</td>
                             <td className="text-right p-3">$90.00</td>
                           </tr>
                         </tbody>
                       </table>
                     </div>
                     
                     <div className="flex justify-end pt-4">
                       <div className="w-64 space-y-2">
                         <div className="flex justify-between text-sm">
                           <span>Subtotal (excl GST)</span>
                           <span>$351.50</span>
                         </div>
                         <div className="flex justify-between text-sm">
                           <span>GST (15%)</span>
                           <span>$52.73</span>
                         </div>
                         <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                           <span>Total Due</span>
                           <span>$404.23</span>
                         </div>
                       </div>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-6 bg-white p-8 rounded-xl shadow-sm border mt-4">
              {sent ? (
                <div className="text-center py-12 space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-2xl font-bold">Email Sent!</h3>
                  <p className="text-muted-foreground">The document has been securely dispatched.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Recipient Email Address</Label>
                    <Input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="customer@example.com"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Message Body</Label>
                    <Textarea 
                      rows={8} 
                      value={message} 
                      onChange={e => setMessage(e.target.value)} 
                      className="resize-none"
                    />
                  </div>
                  <div className="p-4 border rounded-lg bg-slate-50 flex items-start gap-4">
                    <div className="bg-primary text-white p-3 rounded-lg shadow-sm">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{title}.pdf</p>
                      <p className="text-sm text-slate-500">Secure PDF attachment • 142 KB</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-card flex justify-end gap-3 print:hidden">
          <Button variant="outline" onClick={onClose} disabled={sending}>Cancel</Button>
          {tab === "preview" ? (
            <Button onClick={handlePrint}><Printer className="h-4 w-4 mr-2" /> Print A4 Document</Button>
          ) : (
            !sent && (
              <Button onClick={handleSendEmail} disabled={sending || !email}>
                {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send to Customer
              </Button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}