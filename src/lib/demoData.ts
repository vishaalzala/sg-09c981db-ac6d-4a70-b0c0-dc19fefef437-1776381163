// Demo data for development mode (NEXT_PUBLIC_DEMO_MODE=true)
// This file provides realistic mock data for all pages

export const demoCustomers = [
  {
    id: "cust-1",
    name: "John Smith",
    email: "john.smith@example.com",
    mobile: "021 123 4567",
    phone: "09 123 4567",
    is_company: false,
    company_name: null,
    physical_address: "123 Queen Street, Auckland",
    postal_address: "PO Box 1234, Auckland",
    created_at: "2026-01-15T10:00:00Z"
  },
  {
    id: "cust-2",
    name: "Sarah Johnson",
    email: "sarah.j@gmail.com",
    mobile: "021 987 6543",
    phone: null,
    is_company: false,
    company_name: null,
    physical_address: "456 Ponsonby Road, Auckland",
    postal_address: null,
    created_at: "2026-02-20T14:30:00Z"
  },
  {
    id: "cust-3",
    name: "Auckland Transport Ltd",
    email: "fleet@aucklandtransport.co.nz",
    mobile: "021 555 1234",
    phone: "09 555 5555",
    is_company: true,
    company_name: "Auckland Transport Ltd",
    physical_address: "789 Fleet Street, Auckland",
    postal_address: "PO Box 9999, Auckland",
    created_at: "2025-11-10T09:00:00Z"
  },
  {
    id: "cust-4",
    name: "Mike Chen",
    email: "mike.chen@outlook.com",
    mobile: "022 333 4444",
    phone: "09 333 4444",
    is_company: false,
    company_name: null,
    physical_address: "12 Dominion Road, Auckland",
    postal_address: null,
    created_at: "2026-03-05T11:15:00Z"
  },
  {
    id: "cust-5",
    name: "Wellington Couriers",
    email: "maintenance@wellingtoncouriers.nz",
    mobile: "021 777 8888",
    phone: "04 777 7777",
    is_company: true,
    company_name: "Wellington Couriers",
    physical_address: "234 Willis Street, Wellington",
    postal_address: "PO Box 5678, Wellington",
    created_at: "2025-12-01T08:00:00Z"
  }
];

export const demoVehicles = [
  {
    id: "veh-1",
    customer_id: "cust-1",
    customer: [{ name: "John Smith" }],
    registration_number: "ABC123",
    make: "Toyota",
    model: "Corolla",
    year: 2020,
    vin: "JT2BK12E9X0123456",
    colour: "Silver",
    wof_expiry: "2026-07-15",
    service_due_date: "2026-05-20",
    service_due_km: 100000,
    odometer: 85000,
    created_at: "2026-01-15T10:00:00Z"
  },
  {
    id: "veh-2",
    customer_id: "cust-2",
    customer: [{ name: "Sarah Johnson" }],
    registration_number: "XYZ789",
    make: "Honda",
    model: "Civic",
    year: 2019,
    vin: "2HGFC2F59KH123789",
    colour: "Blue",
    wof_expiry: "2026-08-22",
    service_due_date: "2026-06-10",
    service_due_km: 90000,
    odometer: 72000,
    created_at: "2026-02-20T14:30:00Z"
  },
  {
    id: "veh-3",
    customer_id: "cust-3",
    customer: [{ name: "Auckland Transport Ltd" }],
    registration_number: "FLT456",
    make: "Ford",
    model: "Transit",
    year: 2021,
    vin: "WF0XXXTTFXDA12345",
    colour: "White",
    wof_expiry: "2026-06-30",
    service_due_date: "2026-05-05",
    service_due_km: 120000,
    odometer: 115000,
    created_at: "2025-11-10T09:00:00Z"
  },
  {
    id: "veh-4",
    customer_id: "cust-4",
    customer: [{ name: "Mike Chen" }],
    registration_number: "DEF567",
    make: "Mazda",
    model: "CX-5",
    year: 2022,
    vin: "JM1KE2BE5N0123456",
    colour: "Red",
    wof_expiry: "2026-09-15",
    service_due_date: "2026-07-20",
    service_due_km: 50000,
    odometer: 32000,
    created_at: "2026-03-05T11:15:00Z"
  },
  {
    id: "veh-5",
    customer_id: "cust-3",
    customer: [{ name: "Auckland Transport Ltd" }],
    registration_number: "FLT789",
    make: "Mitsubishi",
    model: "Canter",
    year: 2020,
    vin: "JMYFE85E9L0123789",
    colour: "White",
    wof_expiry: "2026-05-20",
    service_due_date: "2026-04-30",
    service_due_km: 150000,
    odometer: 142000,
    created_at: "2025-11-10T09:30:00Z"
  }
];

export const demoBookings = [
  {
    id: "book-1",
    customer_id: "cust-1",
    vehicle_id: "veh-1",
    customer_name: "John Smith",
    vehicle_rego: "ABC123",
    start_time: "2026-04-20T09:00:00Z",
    end_time: "2026-04-20T10:00:00Z",
    service_type: "General Service",
    status: "confirmed",
    notes: "Customer requested full service",
    created_at: "2026-04-15T10:00:00Z"
  },
  {
    id: "book-2",
    customer_id: "cust-2",
    vehicle_id: "veh-2",
    customer_name: "Sarah Johnson",
    vehicle_rego: "XYZ789",
    start_time: "2026-04-21T14:00:00Z",
    end_time: "2026-04-21T15:30:00Z",
    service_type: "WOF Inspection",
    status: "confirmed",
    notes: "WOF due soon",
    created_at: "2026-04-16T11:30:00Z"
  },
  {
    id: "book-3",
    customer_id: "cust-4",
    vehicle_id: "veh-4",
    customer_name: "Mike Chen",
    vehicle_rego: "DEF567",
    start_time: "2026-04-19T10:30:00Z",
    end_time: "2026-04-19T11:30:00Z",
    service_type: "Brake Check",
    status: "completed",
    notes: null,
    created_at: "2026-04-10T09:00:00Z"
  }
];

export const demoJobs = [
  {
    id: "job-1",
    job_number: "JOB-2026-001",
    customer_id: "cust-1",
    vehicle_id: "veh-1",
    customer_name: "John Smith",
    vehicle_rego: "ABC123",
    vehicle_description: "2020 Toyota Corolla",
    status: "in_progress",
    priority: "medium",
    description: "Full service + oil change",
    technician_notes: "All fluids checked, new oil filter installed",
    odometer_in: 85000,
    estimated_completion: "2026-04-19T16:00:00Z",
    total_cost: 350.00,
    created_at: "2026-04-19T08:00:00Z"
  },
  {
    id: "job-2",
    job_number: "JOB-2026-002",
    customer_id: "cust-3",
    vehicle_id: "veh-3",
    customer_name: "Auckland Transport Ltd",
    vehicle_rego: "FLT456",
    vehicle_description: "2021 Ford Transit",
    status: "booked",
    priority: "high",
    description: "Engine diagnostics - warning light on",
    technician_notes: null,
    odometer_in: 115000,
    estimated_completion: "2026-04-20T12:00:00Z",
    total_cost: 180.00,
    created_at: "2026-04-18T14:30:00Z"
  },
  {
    id: "job-3",
    job_number: "JOB-2026-003",
    customer_id: "cust-2",
    vehicle_id: "veh-2",
    customer_name: "Sarah Johnson",
    vehicle_rego: "XYZ789",
    vehicle_description: "2019 Honda Civic",
    status: "completed",
    priority: "low",
    description: "WOF inspection",
    technician_notes: "Passed WOF - all checks OK",
    odometer_in: 72000,
    estimated_completion: "2026-04-18T15:00:00Z",
    total_cost: 65.00,
    created_at: "2026-04-18T13:00:00Z"
  }
];

export const demoQuotes = [
  {
    id: "quote-1",
    quote_number: "QTE-2026-001",
    customer_id: "cust-1",
    vehicle_id: "veh-1",
    customer_name: "John Smith",
    vehicle_rego: "ABC123",
    status: "sent",
    valid_until: "2026-05-19",
    subtotal: 450.00,
    tax: 67.50,
    total: 517.50,
    notes: "Includes new tyres and wheel alignment",
    created_at: "2026-04-12T10:00:00Z"
  },
  {
    id: "quote-2",
    quote_number: "QTE-2026-002",
    customer_id: "cust-3",
    vehicle_id: "veh-5",
    customer_name: "Auckland Transport Ltd",
    vehicle_rego: "FLT789",
    status: "draft",
    valid_until: "2026-05-20",
    subtotal: 1200.00,
    tax: 180.00,
    total: 1380.00,
    notes: "Fleet maintenance package",
    created_at: "2026-04-15T09:30:00Z"
  },
  {
    id: "quote-3",
    quote_number: "QTE-2026-003",
    customer_id: "cust-4",
    vehicle_id: "veh-4",
    customer_name: "Mike Chen",
    vehicle_rego: "DEF567",
    status: "approved",
    valid_until: "2026-05-10",
    subtotal: 280.00,
    tax: 42.00,
    total: 322.00,
    notes: "Brake pads replacement",
    created_at: "2026-04-08T11:00:00Z"
  }
];

export const demoInvoices = [
  {
    id: "inv-1",
    invoice_number: "INV-2026-001",
    customer_id: "cust-2",
    vehicle_id: "veh-2",
    customer_name: "Sarah Johnson",
    vehicle_rego: "XYZ789",
    status: "paid",
    due_date: "2026-04-25",
    subtotal: 65.00,
    tax: 9.75,
    total: 74.75,
    paid_amount: 74.75,
    notes: "WOF inspection - Paid in full",
    created_at: "2026-04-18T15:30:00Z"
  },
  {
    id: "inv-2",
    invoice_number: "INV-2026-002",
    customer_id: "cust-1",
    vehicle_id: "veh-1",
    customer_name: "John Smith",
    vehicle_rego: "ABC123",
    status: "sent",
    due_date: "2026-05-05",
    subtotal: 350.00,
    tax: 52.50,
    total: 402.50,
    paid_amount: 0,
    notes: "Full service",
    created_at: "2026-04-19T10:00:00Z"
  },
  {
    id: "inv-3",
    invoice_number: "INV-2026-003",
    customer_id: "cust-3",
    vehicle_id: "veh-3",
    customer_name: "Auckland Transport Ltd",
    vehicle_rego: "FLT456",
    status: "overdue",
    due_date: "2026-04-10",
    subtotal: 850.00,
    tax: 127.50,
    total: 977.50,
    paid_amount: 0,
    notes: "Engine diagnostics + repairs",
    created_at: "2026-04-05T14:00:00Z"
  }
];

export const demoStaff = [
  {
    id: "staff-1",
    full_name: "James Wilson",
    email: "james.wilson@demoshop.com",
    role: "service_advisor",
    role_name: "Service Advisor",
    phone: "021 111 2222",
    is_active: true,
    created_at: "2025-06-01T08:00:00Z"
  },
  {
    id: "staff-2",
    full_name: "Emma Brown",
    email: "emma.brown@demoshop.com",
    role: "technician",
    role_name: "Technician",
    phone: "021 333 4444",
    is_active: true,
    created_at: "2025-07-15T08:00:00Z"
  },
  {
    id: "staff-3",
    full_name: "David Lee",
    email: "david.lee@demoshop.com",
    role: "wof_inspector",
    role_name: "WOF Inspector",
    phone: "021 555 6666",
    is_active: true,
    created_at: "2025-08-20T08:00:00Z"
  },
  {
    id: "staff-4",
    full_name: "Sophie Taylor",
    email: "sophie.taylor@demoshop.com",
    role: "parts_manager",
    role_name: "Parts Manager",
    phone: "021 777 8888",
    is_active: true,
    created_at: "2025-09-10T08:00:00Z"
  }
];

export const demoWofInspections = [
  {
    id: "wof-1",
    inspection_number: "WOF-2026-001",
    vehicle_id: "veh-2",
    vehicle_rego: "XYZ789",
    customer_name: "Sarah Johnson",
    inspector_name: "David Lee",
    status: "passed",
    inspection_date: "2026-04-18",
    expiry_date: "2027-04-18",
    odometer: 72000,
    notes: "All checks passed",
    created_at: "2026-04-18T14:00:00Z"
  },
  {
    id: "wof-2",
    inspection_number: "WOF-2026-002",
    vehicle_id: "veh-1",
    vehicle_rego: "ABC123",
    customer_name: "John Smith",
    inspector_name: "David Lee",
    status: "in_progress",
    inspection_date: "2026-04-19",
    expiry_date: null,
    odometer: 85000,
    notes: "Inspection in progress",
    created_at: "2026-04-19T09:00:00Z"
  },
  {
    id: "wof-3",
    inspection_number: "WOF-2026-003",
    vehicle_id: "veh-3",
    vehicle_rego: "FLT456",
    customer_name: "Auckland Transport Ltd",
    inspector_name: "David Lee",
    status: "failed",
    inspection_date: "2026-04-17",
    expiry_date: null,
    odometer: 115000,
    notes: "Failed - brake pads below minimum thickness",
    created_at: "2026-04-17T11:30:00Z"
  }
];

export const demoInventory = [
  {
    id: "inv-item-1",
    sku: "OIL-5W30-5L",
    name: "Engine Oil 5W-30",
    description: "Synthetic engine oil 5 litre",
    category: "oils",
    quantity: 45,
    reorder_level: 10,
    unit_price: 42.50,
    supplier_name: "Repco",
    location: "Shelf A3",
    created_at: "2025-10-01T08:00:00Z"
  },
  {
    id: "inv-item-2",
    sku: "FILTER-OIL-001",
    name: "Oil Filter - Toyota",
    description: "Oil filter for Toyota vehicles",
    category: "filters",
    quantity: 28,
    reorder_level: 15,
    unit_price: 18.90,
    supplier_name: "Repco",
    location: "Shelf B2",
    created_at: "2025-10-01T08:00:00Z"
  },
  {
    id: "inv-item-3",
    sku: "BRAKE-PAD-F01",
    name: "Brake Pads - Front",
    description: "Front brake pads for Honda Civic",
    category: "brakes",
    quantity: 12,
    reorder_level: 8,
    unit_price: 85.00,
    supplier_name: "Bendix",
    location: "Shelf C1",
    created_at: "2025-10-15T08:00:00Z"
  },
  {
    id: "inv-item-4",
    sku: "TYRE-195-65-15",
    name: "Tyre 195/65R15",
    description: "All-season tyre 195/65R15",
    category: "tyres",
    quantity: 8,
    reorder_level: 4,
    unit_price: 120.00,
    supplier_name: "Bridgestone",
    location: "Tyre Rack",
    created_at: "2025-11-01T08:00:00Z"
  },
  {
    id: "inv-item-5",
    sku: "COOLANT-5L",
    name: "Engine Coolant",
    description: "Coolant/antifreeze 5 litre",
    category: "fluids",
    quantity: 22,
    reorder_level: 10,
    unit_price: 28.50,
    supplier_name: "Nulon",
    location: "Shelf A5",
    created_at: "2025-10-01T08:00:00Z"
  }
];

export const demoSuppliers = [
  {
    id: "sup-1",
    name: "Repco Auto Parts",
    contact_name: "Mark Stevens",
    email: "orders@repco.co.nz",
    phone: "0800 737 261",
    address: "123 Great South Road, Auckland",
    payment_terms: "30 days",
    account_number: "ACC-12345",
    is_active: true,
    created_at: "2025-08-01T08:00:00Z"
  },
  {
    id: "sup-2",
    name: "Bendix Brakes NZ",
    contact_name: "Lisa Anderson",
    email: "sales@bendix.co.nz",
    phone: "09 444 5555",
    address: "456 Industrial Drive, Auckland",
    payment_terms: "14 days",
    account_number: "BDX-9876",
    is_active: true,
    created_at: "2025-08-15T08:00:00Z"
  },
  {
    id: "sup-3",
    name: "Bridgestone Tyres",
    contact_name: "Tom Harrison",
    email: "fleet@bridgestone.co.nz",
    phone: "0800 274 343",
    address: "789 Tyre Street, Auckland",
    payment_terms: "30 days",
    account_number: "BRI-5432",
    is_active: true,
    created_at: "2025-09-01T08:00:00Z"
  },
  {
    id: "sup-4",
    name: "Nulon Products",
    contact_name: "Rachel Kim",
    email: "orders@nulon.co.nz",
    phone: "09 666 7777",
    address: "321 Chemical Road, Auckland",
    payment_terms: "21 days",
    account_number: "NUL-8765",
    is_active: true,
    created_at: "2025-09-15T08:00:00Z"
  }
];

export const demoCompanies = [
  {
    id: "demo-company-1",
    name: "Demo Workshop NZ",
    email: "owner@demo.com",
    phone: "09 123 4567",
    address: "123 Workshop Street, Auckland",
    is_active: true,
    trial_ends_at: "2026-05-03",
    subscription_status: "trial_active",
    created_at: "2026-04-19T00:00:00Z"
  },
  {
    id: "demo-company-2",
    name: "Simba Co",
    email: "simba@simba.com",
    phone: "09 222 3333",
    address: "456 Lion Road, Wellington",
    is_active: true,
    trial_ends_at: "2026-05-03",
    subscription_status: "trial_active",
    created_at: "2026-04-19T01:00:00Z"
  },
  {
    id: "demo-company-3",
    name: "Vishaal Workshop",
    email: "vishaalzala@gmail.com",
    phone: "09 444 5555",
    address: "789 Service Avenue, Auckland",
    is_active: true,
    trial_ends_at: "2026-05-03",
    subscription_status: "trial_active",
    created_at: "2026-04-19T02:00:00Z"
  },
  {
    id: "platform-admin",
    name: "Platform Admin",
    email: "admin@workshoppro.com",
    phone: "0800 WORKSHOP",
    address: "Platform HQ, Auckland",
    is_active: true,
    trial_ends_at: "2026-05-03",
    subscription_status: "trial_active",
    created_at: "2026-04-19T03:00:00Z"
  }
];