import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Plus, Upload, GripVertical, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { customerService } from "@/services/customerService";
import { vehicleService } from "@/services/vehicleService";
import { invoiceService } from "@/services/invoiceService";
import { quoteService } from "@/services/quoteService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentBuilderProps {
  type: "invoice" | "quote";
  companyId: string;
  onComplete?: (documentId: string) => void;
}

interface LineItem {
  id: string;
  type: "item" | "header" | "job_kit";
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  total: number;
  sort_order: number;
}

interface ReminderItem {
  id: string;
  reminder_type: string;
  due_date: string;
  reminder_note?: string | null;
}

interface SalesOpp {
  id: string;
  title: string;
  description?: string | null;
}

export function DocumentBuilder({ type, companyId, onComplete }: DocumentBuilderProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  // Step 1 state
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerMobile, setOwnerMobile] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [sourceOfBusiness, setSourceOfBusiness] = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");

  const [rego, setRego] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [odometer, setOdometer] = useState("");

  const [billToThirdParty, setBillToThirdParty] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [orderNumber, setOrderNumber] = useState("");
  const [description, setDescription] = useState("");
  const [salespersonId, setSalespersonId] = useState("");

  const [matchingResults, setMatchingResults] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Step 2 state
  const [documentNumber, setDocumentNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [paymentTerm, setPaymentTerm] = useState("COD");
  const [tel, setTel] = useState("");
  const [telEditing, setTelEditing] = useState(false);
  const [odometerValue, setOdometerValue] = useState("");
  const [odometerEditing, setOdometerEditing] = useState(false);
  const [hubodometer, setHubodometer] = useState("");
  const [hubodometerEditing, setHubodometerEditing] = useState(false);

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [discountValue, setDiscountValue] = useState("0");
  const [discountType, setDiscountType] = useState("%");
  const [documentNote, setDocumentNote] = useState("");

  const [documentStatus, setDocumentStatus] = useState<{ paid: boolean; finished: boolean; hold: boolean }>({
    paid: false,
    finished: false,
    hold: false,
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [salesOpps, setSalesOpps] = useState<SalesOpp[]>([]);

  const [staff, setStaff] = useState<any[]>([]);
  const [reminderTypes, setReminderTypes] = useState<any[]>([]);
  const [jobTypes, setJobTypes] = useState<any[]>([]);

  // Modals
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showJobTypeDialog, setShowJobTypeDialog] = useState(false);
  const [showSalesOppDialog, setShowSalesOppDialog] = useState(false);

  const [finishedDate, setFinishedDate] = useState(new Date().toISOString().split("T")[0]);
  const [finishedTime, setFinishedTime] = useState("12:00");
  const [sendSMS, setSendSMS] = useState(false);

  const [paymentInputs, setPaymentInputs] = useState<Record<string, number>>({
    Cash: 0,
    EFTPOS: 0,
    "Credit Card": 0,
    Afterpay: 0,
    "Bank Transfer": 0,
    ZIP: 0,
    Chargeback: 0,
    Other: 0,
  });
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [waiveSurcharge, setWaiveSurcharge] = useState(false);

  const [customerSearch, setCustomerSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [selectedSearchCustomer, setSelectedSearchCustomer] = useState<any>(null);
  const [selectedSearchVehicle, setSelectedSearchVehicle] = useState<any>(null);

  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Load supporting data
  useEffect(() => {
    loadSupportingData();
  }, [companyId]);

  const loadSupportingData = async () => {
    try {
      const [staffData, reminderTypesData, jobTypesData] = await Promise.all([
        supabase.from("users").select("*").eq("company_id", companyId),
        supabase.from("reminder_types").select("*").eq("company_id", companyId).order("name", { ascending: true }),
        supabase.from("job_types").select("*").eq("company_id", companyId).order("name", { ascending: true }),
      ]);

      if (staffData.data) setStaff(staffData.data);
      if (reminderTypesData.data) setReminderTypes(reminderTypesData.data);
      if (jobTypesData.data) setJobTypes(jobTypesData.data);
    } catch (error) {
      console.error("Error loading supporting data:", error);
    }
  };

  useEffect(() => {
    if (step !== 2) return;
    if (!companyId) return;
    void loadSupportingData();
  }, [step, companyId]);

  useEffect(() => {
    if (!showFinishModal) return;
    if (!companyId) return;
    void loadSupportingData();
  }, [showFinishModal, companyId]);

  // Auto-search logic
  useEffect(() => {
    const debounce = setTimeout(() => {
      performAutoSearch();
    }, 300);
    return () => clearTimeout(debounce);
  }, [ownerName, ownerMobile, ownerPhone, rego, billToThirdParty]);

  const performAutoSearch = async () => {
    if (!ownerName && !ownerMobile && !ownerPhone && !rego) {
      setMatchingResults([]);
      return;
    }

    try {
      let query = supabase.from("customers").select("*, vehicles(*)").eq("company_id", companyId);

      if (ownerName) query = query.ilike("name", `%${ownerName}%`);
      if (ownerMobile) query = query.ilike("mobile", `%${ownerMobile}%`);
      if (ownerPhone) query = query.ilike("phone", `%${ownerPhone}%`);

      const { data } = await query.limit(5);
      setMatchingResults(data || []);
    } catch (error) {
      console.error("Auto-search error:", error);
    }
  };

  const handleContinueToStep2 = async () => {
    setLoading(true);
    try {
      let finalCustomerId = selectedCustomerId;
      let finalVehicleId = selectedVehicleId;

      if (!finalCustomerId) {
        const { data: newCustomer } = await supabase
          .from("customers")
          .insert({
            company_id: companyId,
            name: ownerName,
            email: ownerEmail,
            mobile: ownerMobile,
            phone: ownerPhone,
            source_of_business: sourceOfBusiness,
            postal_address: postalAddress,
            is_company: isCompany,
            company_name: companyName,
            bill_to_third_party: billToThirdParty,
          } as any)
          .select()
          .single();

        if (newCustomer) finalCustomerId = newCustomer.id;
      }

      if (!finalVehicleId && rego) {
        const { data: newVehicle } = await supabase
          .from("vehicles")
          .insert({
            company_id: companyId,
            customer_id: finalCustomerId,
            registration_number: rego,
            make,
            model,
            year: year ? parseInt(year) : null,
            body_type: bodyType,
            odometer: odometer ? parseInt(odometer) : null,
          } as any)
          .select()
          .single();

        if (newVehicle) finalVehicleId = newVehicle.id;
      }

      setCustomerId(finalCustomerId!);
      setVehicleId(finalVehicleId!);
      setTel(ownerMobile || ownerPhone);
      setOdometerValue(odometer);

      if (type === "invoice") {
        const num = await invoiceService.generateInvoiceNumber(companyId);
        setDocumentNumber(num);
      } else {
        const num = await quoteService.generateQuoteNumber(companyId);
        setDocumentNumber(num);
      }

      setStep(2);
    } catch (error: any) {
      console.error("Error continuing to step 2:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.type === "item" ? item.total : 0), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === "%") {
      return subtotal * (parseFloat(discountValue) / 100);
    }
    return parseFloat(discountValue) || 0;
  };

  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscount()) * 0.15;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  const handlePayFully = (method: string) => {
    const total = calculateTotal();
    setPaymentInputs({ ...paymentInputs, [method]: total });
  };

  const calculateSurcharge = () => {
    if (waiveSurcharge) return 0;
    return paymentInputs["Credit Card"] * 0.02;
  };

  const handlePay = () => {
    const total = calculateTotal();
    const paid = Object.values(paymentInputs).reduce((sum, val) => sum + val, 0);
    const surcharge = calculateSurcharge();
    const finalTotal = total + surcharge;

    setDocumentStatus({ ...documentStatus, paid: true });
    setPaymentMethod(Object.keys(paymentInputs).find((k) => paymentInputs[k] > 0) || "Other");
    setPaymentAmount(finalTotal);
    setShowPayModal(false);

    toast({ title: "Payment Recorded", description: `${type === "invoice" ? "Invoice" : "Quote"} marked as paid` });
  };

  const handleFinish = () => {
    setDocumentStatus({ ...documentStatus, finished: true });
    setShowFinishModal(false);
    toast({ title: "Document Finished", description: `${type === "invoice" ? "Invoice" : "Quote"} marked as finished` });
  };

  const handleHold = () => {
    setDocumentStatus({ ...documentStatus, hold: true });
    toast({ title: "On Hold", description: `${type === "invoice" ? "Invoice" : "Quote"} marked as hold` });
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      type: "item",
      description: "",
      quantity: 1,
      rate: 0,
      discount: 0,
      total: 0,
      sort_order: lineItems.length,
    };
    setLineItems([...lineItems, newItem]);
  };

  const addHeader = () => {
    const newItem: LineItem = {
      id: `header-${Date.now()}`,
      type: "header",
      description: "Header",
      quantity: 0,
      rate: 0,
      discount: 0,
      total: 0,
      sort_order: lineItems.length,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === id) return;

    const draggedIndex = lineItems.findIndex((item) => item.id === draggedItem);
    const targetIndex = lineItems.findIndex((item) => item.id === id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...lineItems];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    setLineItems(newItems.map((item, index) => ({ ...item, sort_order: index })));
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSelectJobType = (jobType: any) => {
    const newItem: LineItem = {
      id: `jobtype-${Date.now()}`,
      type: "job_kit",
      description: jobType.name,
      quantity: 1,
      rate: jobType.price || 0,
      discount: 0,
      total: jobType.price || 0,
      sort_order: lineItems.length,
    };
    setLineItems([...lineItems, newItem]);
    setShowJobTypeDialog(false);
  };

  useEffect(() => {
    if (step !== 2) return;
    if (!companyId || !customerId) return;

    void (async () => {
      try {
        const [{ data: remData, error: remErr }, { data: oppData, error: oppErr }] = await Promise.all([
          supabase
            .from("reminders")
            .select("*")
            .eq("company_id", companyId)
            .eq("customer_id", customerId)
            .order("due_date", { ascending: true }),
          supabase
            .from("sales_opportunities")
            .select("id,title,description")
            .eq("company_id", companyId)
            .eq("customer_id", customerId)
            .order("created_at", { ascending: false }),
        ]);

        if (remErr) throw remErr;
        if (oppErr) throw oppErr;

        setReminders((remData || []) as unknown as ReminderItem[]);
        setSalesOpps((oppData || []) as unknown as SalesOpp[]);
      } catch (e) {
        console.error("Load reminders/sales opps error:", e);
      }
    })();
  }, [step, companyId, customerId]);

  const mapDiscountTypeForDb = (value: string) => {
    if (value === "%") return "percentage";
    if (value === "$") return "fixed";
    return "none";
  };

  const handleSaveDocument = async () => {
    setLoading(true);
    try {
      const baseDocumentData = {
        company_id: companyId,
        customer_id: customerId,
        vehicle_id: vehicleId,
        bill_to_third_party: billToThirdParty,
        due_date: dueDate,
        order_number: orderNumber,
        salesperson_id: salespersonId || null,
        payment_term: paymentTerm,
        odometer: odometerValue ? parseInt(odometerValue) : null,
        hubodometer: hubodometer ? parseInt(hubodometer) : null,
        status: documentStatus.paid ? "paid" : documentStatus.finished ? "finished" : documentStatus.hold ? "hold" : "draft",
        discount_value: parseFloat(discountValue) || 0,
        discount_type: mapDiscountTypeForDb(discountType),
        discount_amount: calculateDiscount(),
        subtotal: calculateSubtotal(),
        tax_amount: calculateTax(),
        total_amount: calculateTotal(),
      };

      let documentId = "";

      if (type === "invoice") {
        const invoiceData = {
          ...baseDocumentData,
          invoice_number: documentNumber,
          invoice_date: issueDate,
          invoice_note: documentNote,
          notes: description,
        };

        const { data: doc, error: docError } = await supabase.from("invoices").insert(invoiceData as any).select().single();
        if (docError) throw docError;
        documentId = doc.id;

        for (const item of lineItems) {
          await supabase.from("invoice_line_items").insert({
            invoice_id: doc.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.rate,
            discount_amount: item.discount,
            line_total: item.total,
            line_type: item.type,
            sort_order: item.sort_order,
          } as any);
        }
      } else {
        const quoteData = {
          ...baseDocumentData,
          quote_number: documentNumber,
          quote_date: issueDate,
          quote_note: documentNote,
          notes: description,
        };

        const { data: doc, error: docError } = await supabase.from("quotes").insert(quoteData as any).select().single();
        if (docError) throw docError;
        documentId = doc.id;

        for (const item of lineItems) {
          await supabase.from("quote_line_items").insert({
            quote_id: doc.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.rate,
            discount_amount: item.discount,
            line_total: item.total,
            line_type: item.type,
            sort_order: item.sort_order,
          } as any);
        }
      }

      // Upsert reminders for this customer (sync to /dashboard/reminders)
      for (const reminder of reminders) {
        if (!reminder.reminder_type || !reminder.due_date) continue;

        if (reminder.id.startsWith("tmp_")) {
          const { data: newRem, error: remErr } = await supabase
            .from("reminders")
            .insert({
              company_id: companyId,
              customer_id: customerId,
              vehicle_id: vehicleId || null,
              reminder_type: reminder.reminder_type,
              due_date: reminder.due_date,
              reminder_note: reminder.reminder_note || null,
              status: "pending",
            } as any)
            .select()
            .single();

          if (remErr) throw remErr;
          reminder.id = newRem.id;
        } else {
          const { error: remErr } = await supabase
            .from("reminders")
            .update({
              reminder_type: reminder.reminder_type,
              due_date: reminder.due_date,
              reminder_note: reminder.reminder_note || null,
            } as any)
            .eq("id", reminder.id);

          if (remErr) throw remErr;
        }
      }

      if (documentStatus.paid && paymentAmount > 0) {
        const basePayment = {
          company_id: companyId,
          customer_id: customerId,
          payment_method: paymentMethod,
          amount: paymentAmount,
          surcharge_amount: calculateSurcharge(),
          surcharge_waived: waiveSurcharge,
          reference: paymentReference,
          payment_date: paymentDate,
        };

        if (type === "invoice") {
          await supabase.from("payments").insert({ ...basePayment, invoice_id: documentId } as any);
        } else {
          await supabase.from("payments").insert({ ...basePayment, quote_id: documentId } as any);
        }
      }

      toast({ title: "Success", description: `${type === "invoice" ? "Invoice" : "Quote"} created successfully` });
      if (onComplete) onComplete(documentId);
    } catch (error: any) {
      console.error("Error saving document:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.82fr] gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <h2 className="text-lg font-semibold border-b pb-3">Customer & Vehicle Details</h2>

                <div>
                  <h3 className="text-xs font-bold text-orange-600 uppercase mb-3">Vehicle Owner</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="owner-name">Name</Label>
                      <Input id="owner-name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="owner-email">Email</Label>
                      <Input id="owner-email" type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="owner-mobile">Mobile</Label>
                      <Input id="owner-mobile" value={ownerMobile} onChange={(e) => setOwnerMobile(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="owner-phone">Phone</Label>
                      <Input id="owner-phone" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="source-business">Source Of Business</Label>
                      <Input id="source-business" value={sourceOfBusiness} onChange={(e) => setSourceOfBusiness(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="postal-address">Postal Address</Label>
                      <Input id="postal-address" value={postalAddress} onChange={(e) => setPostalAddress(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Checkbox id="is-company" checked={isCompany} onCheckedChange={(checked) => setIsCompany(checked as boolean)} />
                    <Label htmlFor="is-company" className="text-sm font-normal cursor-pointer">
                      Is Company
                    </Label>
                  </div>
                  {isCompany && (
                    <div className="mt-3">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-orange-600 uppercase mb-3">Vehicle</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="rego">Registration Number</Label>
                      <Input id="rego" value={rego} onChange={(e) => setRego(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="make">Make</Label>
                      <Input id="make" value={make} onChange={(e) => setMake(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="body-type">Body Type</Label>
                      <Input id="body-type" value={bodyType} onChange={(e) => setBodyType(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="odometer-step1">Odometer</Label>
                      <Input id="odometer-step1" value={odometer} onChange={(e) => setOdometer(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-orange-600 uppercase mb-3">{type === "invoice" ? "Invoice" : "Quote"} Information</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="bill-to-third-party">{type === "invoice" ? "Invoice" : "Quote"} To (3rd Party)</Label>
                      <Input id="bill-to-third-party" value={billToThirdParty} onChange={(e) => setBillToThirdParty(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="issue-date">Issue Date</Label>
                      <Input id="issue-date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="due-date">Due Date</Label>
                      <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="order-number">Order Number</Label>
                      <Input id="order-number" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="description-step1">{type === "invoice" ? "Invoice" : "Quote"} Description</Label>
                      <Input id="description-step1" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="salesperson">Salesperson</Label>
                      <Select value={salespersonId} onValueChange={setSalespersonId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select salesperson" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.full_name || s.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => window.history.back()}>
                    Cancel
                  </Button>
                  <Button onClick={handleContinueToStep2} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                    {loading ? "Loading..." : "Continue"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <h2 className="text-lg font-semibold">Matching Results</h2>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Auto search
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Search updates automatically based on the left-side values for Name, Mobile / Phone, Vehicle Registration Number, and {type === "invoice" ? "Invoice" : "Quote"} To (3rd Party). No separate search box.
              </p>
              <div className="space-y-3">
                {matchingResults.length === 0 && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <h4 className="font-semibold text-sm">No exact match found</h4>
                    <p className="text-xs text-muted-foreground mt-1">Continuing will create a new customer and vehicle from the left-side details.</p>
                  </div>
                )}
                {matchingResults.map((result) => (
                  <div
                    key={result.id}
                    className={cn("border border-gray-200 rounded-lg p-3 cursor-pointer transition-colors", selectedCustomerId === result.id ? "border-orange-500 bg-orange-50" : "hover:bg-gray-50")}
                    onClick={() => {
                      setSelectedCustomerId(result.id);
                      if (result.vehicles && result.vehicles.length > 0) {
                        setSelectedVehicleId(result.vehicles[0].id);
                      }
                    }}
                  >
                    <h4 className="font-semibold text-sm">{result.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.mobile} · {result.email}
                    </p>
                    {result.vehicles && result.vehicles.length > 0 && (
                      <p className="text-xs mt-1">
                        Vehicle: {result.vehicles[0].registration_number} · {result.vehicles[0].make} {result.vehicles[0].model}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2 - Document Builder
  return (
    <div className="space-y-4">
      {/* Doc Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground uppercase font-bold mb-1">{type === "invoice" ? "Invoice" : "Quote"} No</p>
          <p className="font-bold text-sm">{documentNumber}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Date</p>
          <p className="font-bold text-sm">{new Date(issueDate).toLocaleDateString()}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Due Date</p>
          <p className="font-bold text-sm">{new Date(dueDate).toLocaleDateString()}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Status</p>
          <Badge variant={documentStatus.paid ? "default" : documentStatus.finished ? "secondary" : documentStatus.hold ? "outline" : "destructive"} className="text-xs">
            {documentStatus.paid ? "Paid" : documentStatus.finished ? "Finished" : documentStatus.hold ? "Hold" : "Draft"}
          </Badge>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Salesperson</p>
          <p className="font-bold text-sm text-ellipsis overflow-hidden whitespace-nowrap">{staff.find((s) => s.id === salespersonId)?.full_name || "—"}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Bill To</p>
          <p className="font-bold text-sm text-ellipsis overflow-hidden whitespace-nowrap">{billToThirdParty || "—"}</p>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.82fr] gap-4">
        {/* Left Main Card */}
        <Card className="p-5">
          <div className="border-b pb-3 mb-5">
            <h2 className="text-lg font-semibold">{type === "invoice" ? "Invoice" : "Quote"} Details</h2>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3">Bill To</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <p className="text-sm font-bold">Customer</p>
                  <button onClick={() => setShowCustomerDialog(true)} className="text-sm text-blue-600 hover:underline text-left">
                    <strong>{ownerName}</strong>
                  </button>
                </div>
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <p className="text-sm font-bold">Tel</p>
                  {!telEditing ? (
                    <button onClick={() => setTelEditing(true)} className="text-sm text-blue-600 hover:underline text-left">
                      <strong>{tel}</strong>
                    </button>
                  ) : (
                    <Input
                      value={tel}
                      onChange={(e) => setTel(e.target.value)}
                      onBlur={() => setTelEditing(false)}
                      autoFocus
                      className="h-8 text-sm"
                    />
                  )}
                </div>
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <p className="text-sm font-bold">Payment Term</p>
                  <Select value={paymentTerm} onValueChange={setPaymentTerm}>
                    <SelectTrigger className="h-8 text-sm max-w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">COD</SelectItem>
                      <SelectItem value="Accounts">Accounts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-[130px_1fr] items-center gap-3 mt-4">
                <p className="text-sm font-bold">Description</p>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} className="h-8 text-sm" />
              </div>

              <div className="space-y-2 mt-4">
                <button className="text-sm text-blue-600 hover:underline">+ Add note</button>
                <label htmlFor="upload-docs" className="block text-sm text-blue-600 hover:underline cursor-pointer">
                  Upload Photos/Documents
                </label>
                <input id="upload-docs" type="file" multiple className="hidden" />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3">Document Details</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <p className="text-sm font-bold">{type === "invoice" ? "Invoice" : "Quote"} Number</p>
                  <p className="text-sm">
                    <strong>{documentNumber}</strong>
                  </p>
                </div>
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <p className="text-sm font-bold">Issue Date</p>
                  <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="h-8 text-sm max-w-[170px]" />
                </div>
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <p className="text-sm font-bold">Due Date</p>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-8 text-sm max-w-[170px]" />
                </div>
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <p className="text-sm font-bold">Order Number</p>
                  <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="h-8 text-sm max-w-[180px]" />
                </div>
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <p className="text-sm font-bold">Rego</p>
                  <button onClick={() => setShowVehicleDialog(true)} className="text-sm text-blue-600 hover:underline text-left">
                    <strong>{rego}</strong>
                  </button>
                </div>
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <p className="text-sm font-bold">Vehicle</p>
                  <p className="text-sm">
                    <strong>
                      {make} {model} {year}
                    </strong>
                  </p>
                </div>
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <p className="text-sm font-bold">Odometer</p>
                  {!odometerEditing ? (
                    <button onClick={() => setOdometerEditing(true)} className="text-sm text-blue-600 hover:underline text-left">
                      {odometerValue || "Click to enter"}
                    </button>
                  ) : (
                    <Input
                      value={odometerValue}
                      onChange={(e) => setOdometerValue(e.target.value)}
                      onBlur={() => setOdometerEditing(false)}
                      autoFocus
                      className="h-8 text-sm max-w-[180px]"
                    />
                  )}
                </div>
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <p className="text-sm font-bold">Hubodometer</p>
                  {!hubodometerEditing ? (
                    <button onClick={() => setHubodometerEditing(true)} className="text-sm text-blue-600 hover:underline text-left">
                      {hubodometer || "Click to enter"}
                    </button>
                  ) : (
                    <Input
                      value={hubodometer}
                      onChange={(e) => setHubodometer(e.target.value)}
                      onBlur={() => setHubodometerEditing(false)}
                      autoFocus
                      className="h-8 text-sm max-w-[180px]"
                    />
                  )}
                </div>
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <p className="text-sm font-bold">Salesperson</p>
                  <Select value={salespersonId} onValueChange={setSalespersonId}>
                    <SelectTrigger className="h-8 text-sm max-w-[260px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name || s.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="h-4 w-4 mr-1" />
              Item
            </Button>
            <Button variant="outline" size="sm" onClick={addHeader}>
              <Plus className="h-4 w-4 mr-1" />
              Header
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowJobTypeDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Job Tyres / Job Kit
            </Button>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg overflow-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground">Item</th>
                  <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground">Description</th>
                  <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground">Qty</th>
                  <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground">Rate</th>
                  <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground">Discount</th>
                  <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground">Total</th>
                  <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      No items added. Click "+ Item" to add items.
                    </td>
                  </tr>
                )}
                {lineItems.map((item) => (
                  <tr
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragEnd={handleDragEnd}
                    className={cn("border-b hover:bg-gray-50 cursor-move", draggedItem === item.id && "opacity-50")}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className={item.type === "header" ? "font-bold" : ""}>{item.type === "header" ? item.description : item.description || "Item"}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Input
                        value={item.description}
                        onChange={(e) => {
                          const updated = lineItems.map((i) => (i.id === item.id ? { ...i, description: e.target.value } : i));
                          setLineItems(updated);
                        }}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="p-3">
                      {item.type !== "header" && (
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const qty = parseFloat(e.target.value) || 0;
                            const updated = lineItems.map((i) => (i.id === item.id ? { ...i, quantity: qty, total: qty * i.rate - i.discount } : i));
                            setLineItems(updated);
                          }}
                          className="h-8 text-sm w-20"
                        />
                      )}
                    </td>
                    <td className="p-3">
                      {item.type !== "header" && (
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) => {
                            const rate = parseFloat(e.target.value) || 0;
                            const updated = lineItems.map((i) => (i.id === item.id ? { ...i, rate, total: i.quantity * rate - i.discount } : i));
                            setLineItems(updated);
                          }}
                          className="h-8 text-sm w-24"
                        />
                      )}
                    </td>
                    <td className="p-3">
                      {item.type !== "header" && (
                        <Input
                          type="number"
                          value={item.discount}
                          onChange={(e) => {
                            const discount = parseFloat(e.target.value) || 0;
                            const updated = lineItems.map((i) => (i.id === item.id ? { ...i, discount, total: i.quantity * i.rate - discount } : i));
                            setLineItems(updated);
                          }}
                          className="h-8 text-sm w-24"
                        />
                      )}
                    </td>
                    <td className="p-3">
                      {item.type !== "header" && <span className="font-semibold">${item.total.toFixed(2)}</span>}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLineItems(lineItems.filter((i) => i.id !== item.id));
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Discount and Note */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="%">%</SelectItem>
                    <SelectItem value="$">$</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{type === "invoice" ? "Invoice" : "Quote"} Note</Label>
              <Textarea value={documentNote} onChange={(e) => setDocumentNote(e.target.value)} rows={3} />
            </div>
          </div>
        </Card>

        {/* Right Side Panels */}
        <div className="space-y-4">
          {/* Status Stamps */}
          {(documentStatus.paid || documentStatus.finished || documentStatus.hold) && (
            <div className="flex justify-end gap-4 flex-wrap">
              {documentStatus.hold && <Badge className="bg-yellow-100 text-yellow-800 border-4 border-yellow-600 text-lg font-extrabold px-3 py-1 transform -rotate-12">HOLD</Badge>}
              {documentStatus.finished && <Badge className="bg-blue-100 text-blue-800 border-4 border-blue-600 text-base font-extrabold px-3 py-1 transform -rotate-12">FINISHED</Badge>}
              {documentStatus.paid && <Badge className="bg-red-100 text-red-800 border-4 border-red-600 text-lg font-extrabold px-3 py-1 transform -rotate-12">PAID</Badge>}
            </div>
          )}

          {/* Payment */}
          <Card className="p-4">
            <h3 className="font-semibold border-b pb-2 mb-3">Payment</h3>
            {!documentStatus.paid ? (
              <p className="text-sm text-muted-foreground">No payment</p>
            ) : (
              <div className="grid grid-cols-[74px_1fr_auto_auto] gap-3 items-center text-sm">
                <p>{new Date(paymentDate).toLocaleDateString()}</p>
                <p>Payment</p>
                <Badge className="bg-green-100 text-green-800">Paid</Badge>
                <p>
                  {paymentMethod} ${paymentAmount.toFixed(2)}
                </p>
              </div>
            )}
          </Card>

          {/* Summary */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <strong>${calculateSubtotal().toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount</span>
                <strong>-${calculateDiscount().toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <strong>${calculateTax().toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <strong>${calculateTotal().toFixed(2)}</strong>
              </div>
            </div>
          </Card>

          {/* Future Sales Opportunities */}
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Future Sales Opportunities</h3>
              <Badge className="bg-orange-200 text-orange-800 text-xs">Customer-based</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Keep suggested upsell items linked to this customer.</p>
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 mb-3"
              onClick={async () => {
                const title = window.prompt("Title");
                if (!title) return;
                const descriptionText = window.prompt("Description (optional)") || null;

                const { data, error } = await supabase
                  .from("sales_opportunities")
                  .insert({
                    company_id: companyId,
                    customer_id: customerId,
                    vehicle_id: vehicleId || null,
                    title,
                    description: descriptionText,
                    source_type: "manual",
                    status: "new",
                  } as any)
                  .select()
                  .single();

                if (error) {
                  toast({ title: "Error", description: error.message, variant: "destructive" });
                  return;
                }

                setSalesOpps((prev) => [{ id: data.id, title: data.title, description: data.description }, ...prev]);
              }}
            >
              Add
            </Button>
            <div className="space-y-2">
              {salesOpps.map((opp) => (
                <div key={opp.id} className="flex justify-between items-center text-sm border-b pb-2">
                  <span>{opp.title}</span>
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 hover:underline text-xs"
                      onClick={async () => {
                        const nextTitle = window.prompt("Edit title", opp.title);
                        if (!nextTitle) return;
                        const nextDesc = window.prompt("Edit description (optional)", opp.description || "") ?? opp.description ?? null;

                        const { error } = await supabase.from("sales_opportunities").update({ title: nextTitle, description: nextDesc } as any).eq("id", opp.id);
                        if (error) {
                          toast({ title: "Error", description: error.message, variant: "destructive" });
                          return;
                        }

                        setSalesOpps((prev) => prev.map((p) => (p.id === opp.id ? { ...p, title: nextTitle, description: nextDesc } : p)));
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline text-xs"
                      onClick={async () => {
                        const ok = window.confirm("Delete this opportunity?");
                        if (!ok) return;

                        const { error } = await supabase.from("sales_opportunities").update({ deleted_at: new Date().toISOString() } as any).eq("id", opp.id);
                        if (error) {
                          toast({ title: "Error", description: error.message, variant: "destructive" });
                          return;
                        }

                        setSalesOpps((prev) => prev.filter((p) => p.id !== opp.id));
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Reminders */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-3">Reminders</h3>
            <div className="space-y-2">
              {reminders.length === 0 && <p className="text-sm text-muted-foreground">No reminders yet.</p>}
              {reminders.map((reminder) => (
                <div key={reminder.id} className="flex justify-between items-center text-sm border-b pb-2">
                  <span>{reminder.reminder_type}</span>
                  <Input
                    type="date"
                    value={reminder.due_date}
                    onChange={(e) => {
                      const next = e.target.value;
                      setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, due_date: next } : r)));
                    }}
                    className="h-8 text-xs max-w-[140px]"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Select
                value=""
                onValueChange={(val) => {
                  const exists = reminders.some((r) => r.reminder_type === val);
                  const nextDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                  if (exists) return;
                  setReminders((prev) => [{ id: "tmp_" + Date.now().toString(), reminder_type: val, due_date: nextDate }, ...prev]);
                }}
              >
                <SelectTrigger className="h-8 text-xs max-w-[220px]">
                  <SelectValue placeholder="Add reminder..." />
                </SelectTrigger>
                <SelectContent>
                  {reminderTypes.map((rt: any) => (
                    <SelectItem key={rt.id} value={rt.name}>
                      {rt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* COGS */}
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">COGS</h3>
              <button className="text-sm text-blue-600 hover:underline">Show</button>
            </div>
          </Card>

          {/* Related Bills */}
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Related Bills</h3>
              <button className="text-sm text-blue-600 hover:underline">Show</button>
            </div>
          </Card>

          {/* Related Credit Notes */}
          <Card className="p-4">
            <h3 className="font-semibold">Related Credit Notes</h3>
          </Card>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <Card className="sticky bottom-0 p-4 bg-white/95 backdrop-blur">
        <div className="flex justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDocument} disabled={loading}>
              Save Draft
            </Button>
            <Button variant="outline">Send</Button>
            <Button variant="outline">Print</Button>
            <Button variant="outline">Delete</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleHold}>
              Hold
            </Button>
            <Button className="bg-green-700 hover:bg-green-800" onClick={() => setShowFinishModal(true)}>
              Finish Job
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setShowPayModal(true)}>
              Pay
            </Button>
          </div>
        </div>
      </Card>

      {/* Finish Job Modal */}
      <Dialog open={showFinishModal} onOpenChange={setShowFinishModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Finish Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Finished Date</Label>
                <Input type="date" value={finishedDate} onChange={(e) => setFinishedDate(e.target.value)} />
              </div>
              <div>
                <Label>Finished Time</Label>
                <Input type="time" value={finishedTime} onChange={(e) => setFinishedTime(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Communications</Label>
              <div className="flex gap-4 items-center mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="send-sms" checked={sendSMS} onCheckedChange={(checked) => setSendSMS(checked as boolean)} />
                  <Label htmlFor="send-sms" className="font-normal cursor-pointer">
                    Send SMS
                  </Label>
                </div>
                <button className="text-sm text-blue-600 hover:underline">Preview</button>
              </div>
            </div>
            <div>
              <Label>Follow Up</Label>
              <div className="space-y-2 mt-2">
                {reminderTypes.slice(0, 3).map((rt) => (
                  <div key={rt.id} className="grid grid-cols-[120px_1fr] gap-3 items-center">
                    <Label>{rt.name}</Label>
                    <Input type="date" />
                  </div>
                ))}
                <button className="text-sm text-blue-600 hover:underline">Add Follow Up</button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishModal(false)}>
              Cancel
            </Button>
            <Button className="bg-green-700 hover:bg-green-800" onClick={handleFinish}>
              Finish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Modal */}
      <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Paying</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-3 flex justify-between items-center">
              <span>Total Payable</span>
              <strong className="text-lg">${calculateTotal().toFixed(2)}</strong>
            </div>

            <div className="grid grid-cols-[170px_1fr_120px] gap-3 items-center">
              {Object.keys(paymentInputs).map((method) => (
                <>
                  <p className="text-right text-sm font-semibold">{method}</p>
                  <Input
                    type="number"
                    value={paymentInputs[method]}
                    onChange={(e) => setPaymentInputs({ ...paymentInputs, [method]: parseFloat(e.target.value) || 0 })}
                  />
                  <button onClick={() => handlePayFully(method)} className="text-sm text-blue-600 hover:underline">
                    Pay fully
                  </button>
                </>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Reference</Label>
                <Input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder={`${type === "invoice" ? "Invoice" : "Quote"}# ${documentNumber}`} />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
              </div>
            </div>

            {paymentInputs["Credit Card"] > 0 && (
              <div className="bg-gray-100 rounded-lg p-3 flex justify-between items-center">
                <div>
                  + 2% surcharge: <strong>${calculateSurcharge().toFixed(2)}</strong>
                </div>
                <div className="flex items-center gap-4">
                  <strong>${(calculateTotal() + calculateSurcharge()).toFixed(2)}</strong>
                  <div className="flex items-center gap-2">
                    <Checkbox id="waive-surcharge" checked={waiveSurcharge} onCheckedChange={(checked) => setWaiveSurcharge(checked as boolean)} />
                    <Label htmlFor="waive-surcharge" className="font-normal cursor-pointer">
                      Waive
                    </Label>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-100 rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <span>Paid Total</span>
                <strong>${Object.values(paymentInputs).reduce((sum, val) => sum + val, 0).toFixed(2)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Balance Due</span>
                <strong>${(calculateTotal() - Object.values(paymentInputs).reduce((sum, val) => sum + val, 0)).toFixed(2)}</strong>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePay}>Pay</Button>
            <Button className="bg-green-700 hover:bg-green-800">Pay & Print</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Customer Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Search customer..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
            <p className="text-sm text-muted-foreground">Search and select existing customer or create new</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomerDialog(false)}>
              Cancel
            </Button>
            <Button>Select Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Vehicle Dialog */}
      <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Search vehicle by rego..." value={vehicleSearch} onChange={(e) => setVehicleSearch(e.target.value)} />
            <p className="text-sm text-muted-foreground">Only vehicles connected to this customer will appear</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVehicleDialog(false)}>
              Cancel
            </Button>
            <Button>Change Vehicle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Type Selection Dialog */}
      <Dialog open={showJobTypeDialog} onOpenChange={setShowJobTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Job Type / Job Kit</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {jobTypes.map((jt) => (
              <button
                key={jt.id}
                onClick={() => handleSelectJobType(jt)}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-semibold">{jt.name}</p>
                {jt.description && <p className="text-xs text-muted-foreground mt-1">{jt.description}</p>}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJobTypeDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sales Opportunity Dialog */}
      <Dialog open={showSalesOppDialog} onOpenChange={setShowSalesOppDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sales Opportunity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input placeholder="e.g., Brake pads replacement" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSalesOppDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}