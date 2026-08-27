/* ── Hospital360 OS domain models (Supabase/Postgres-ready) ── */

export type Role =
  | "owner" | "admin" | "receptionist" | "doctor" | "nurse" | "pharmacist"
  | "lab" | "radiology" | "accountant" | "hr" | "patient";

export interface HospitalSettings {
  name: string; shortName: string; tagline: string;
  address: string; city: string; phone: string; emergency: string; ambulance: string;
  email: string; whatsapp: string; hours: string;
  primaryColor: string; logoHue: string;
  lang: "en" | "hi" | "mr";
  announcement: string;
}

export interface Department { id: string; name: string; icon: string; short: string; desc: string; services: string[]; head: string; hue: number; }
export interface ServiceItem { id: string; name: string; dept: string; desc: string; icon: string; }

export interface Doctor {
  id: string; name: string; deptId: string; quals: string; specialty: string;
  years: number; fee: number; hue: number;
  languages: string[]; procedures: string[]; bio: string;
  days: string[]; from: string; to: string;
  available: boolean;
}

export interface Patient {
  id: string; uhid: string; name: string; dob: string; gender: "Male" | "Female" | "Other";
  mobile: string; email?: string; address: string; emergencyContact?: string;
  blood: string; allergies: string; conditions: string; notes?: string; createdAt: string;
}

export type ApptStatus = "Booked" | "Checked In" | "Waiting" | "With Doctor" | "Completed" | "Cancelled" | "No Show";
export interface Appointment {
  id: string; no: string; patientId: string; doctorId: string; deptId: string;
  date: string; slot: string; reason: string; status: ApptStatus;
  token?: number; type: "Online" | "Walk-in" | "Follow-up"; fee: number; createdAt: string;
}

export interface Vitals { id: string; patientId: string; at: string; by: string; temp: number; bpSys: number; bpDia: number; pulse: number; spo2: number; sugar?: number; rr?: number; }

export interface Consultation {
  id: string; appointmentId: string; patientId: string; doctorId: string; at: string;
  complaint: string; symptoms: string; history: string; examination: string;
  diagnosis: string; advice: string; followUp?: string; internalNotes?: string;
}

export interface RxItem { medicineId: string; name: string; strength: string; dose: string; frequency: string; duration: string; route: string; instructions: string; qty: number; price: number; }
export interface Prescription {
  id: string; no: string; patientId: string; doctorId: string; consultationId?: string;
  at: string; items: RxItem[]; advice: string; followUp?: string; status: "Active" | "Dispensed" | "Cancelled";
}

export type PhOrderStatus = "Received" | "Preparing" | "Ready" | "Dispensed";
export interface PharmacyOrder {
  id: string; no: string; prescriptionId: string; patientId: string; doctorId: string;
  at: string; items: RxItem[]; status: PhOrderStatus; billAdded: boolean;
}

export interface Medicine {
  id: string; name: string; generic: string; brand: string; manufacturer: string;
  category: string; batch: string; expiry: string; pp: number; price: number; mrp: number;
  gst: number; stock: number; min: number; rack: string; supplierId: string;
}

export interface Supplier { id: string; name: string; company: string; rep: string; phone: string; email: string; gst?: string; outstanding: number; }
export interface Purchase { id: string; no: string; supplierId: string; invoiceNo: string; date: string; items: { medicineId: string; name: string; batch: string; expiry: string; qty: number; pp: number }[]; total: number; }

export type ChargeCat = "Consultation" | "Procedure" | "Bed" | "Nursing" | "Lab" | "Radiology" | "OT" | "Pharmacy" | "Other";
export interface InvoiceItem { id: string; desc: string; cat: ChargeCat; amount: number; at: string; }
export interface Invoice {
  id: string; no: string; patientId: string; items: InvoiceItem[];
  status: "Unpaid" | "Partial" | "Paid"; createdAt: string; dueDate: string;
}
export type PayMethod = "Cash" | "UPI" | "Card" | "Insurance" | "Credit";
export interface Payment { id: string; receiptNo: string; invoiceId: string; patientId: string; amount: number; method: PayMethod; at: string; note?: string; }

export interface Admission {
  id: string; no: string; patientId: string; doctorId: string; at: string; diagnosis: string;
  ward: string; bedId: string; attendant: string; attendantPhone: string; deposit: number;
  insurance?: string; status: "Admitted" | "Discharged"; dischargeAt?: string; notes?: string;
}

export type BedStatus = "Available" | "Occupied" | "Reserved" | "Cleaning" | "Maintenance";
export interface Bed { id: string; ward: string; label: string; cat: string; rate: number; status: BedStatus; patientId?: string; }

export type LabStatus = "Pending" | "Sample Collected" | "Processing" | "Completed";
export interface LabOrder {
  id: string; no: string; patientId: string; doctorId: string; test: string; at: string;
  status: LabStatus; priority: "Routine" | "Urgent"; results?: Record<string, string>; reportedAt?: string;
}

export type RadStatus = "Requested" | "Scheduled" | "In Progress" | "Report Ready";
export interface RadiologyOrder { id: string; no: string; patientId: string; doctorId: string; modality: string; study: string; at: string; status: RadStatus; report?: string; }

export interface Surgery { id: string; patientId: string; procedure: string; surgeonId: string; assistant: string; anesthetist: string; ot: string; at: string; status: "Scheduled" | "In Progress" | "Completed" | "Cancelled"; notes?: string; }

export interface Employee {
  id: string; empId: string; name: string; dept: string; designation: string; role: Role;
  phone: string; email: string; joined: string; shift: "Morning" | "Evening" | "Night";
  type: "Full-time" | "Part-time" | "Contract"; salary: number; hue: number; clockedIn?: boolean;
}
export interface AttendanceRec { id: string; empId: string; date: string; status: "Present" | "Absent" | "Late" | "Half Day" | "Leave"; clockIn?: string; clockOut?: string; }
export interface LeaveReq { id: string; empId: string; from: string; to: string; reason: string; status: "Pending" | "Approved" | "Rejected"; }

export interface Expense { id: string; cat: string; desc: string; amount: number; date: string; paid: boolean; }
export interface InventoryItem { id: string; name: string; cat: string; qty: number; min: number; unit: string; supplier: string; location: string; }
export interface Asset { id: string; name: string; serial: string; purchased: string; warrantyTill: string; amc: string; location: string; status: "In Use" | "Idle" | "Under Repair"; }
export interface Ambulance { id: string; no: string; driver: string; status: "Available" | "On Trip" | "Maintenance"; patient?: string; from?: string; to?: string; since?: string; }
export interface FeedbackItem { id: string; patient: string; service: number; staff: number; cleanliness: number; waiting: number; overall: number; comment: string; at: string; }

export interface Notice { id: string; kind: "appointment" | "emergency" | "pharmacy" | "lab" | "stock" | "billing" | "hr" | "bed"; title: string; body: string; at: string; read: boolean; }
export interface AuditEntry { id: string; user: string; role: string; action: string; module: string; record: string; at: string; }

export interface DayRevenue { date: string; opd: number; ipd: number; pharmacy: number; lab: number; radiology: number; }

export interface BlogPost { id: string; slug: string; title: string; tag: string; excerpt: string; body: string[]; author: string; date: string; read: string; hue: number; }
export interface HealthPackage { id: string; name: string; price: number; tests: string[]; forWho: string; popular?: boolean; }
export interface HealthCamp { id: string; name: string; place: string; date: string; services: string; spots: number; }
export interface Testimonial { id: string; name: string; place: string; text: string; rating: number; }
export interface Faq { id: string; q: string; a: string; }
export interface GalleryItem { id: string; title: string; cat: string; hue: number; icon: string; }

export interface MedTask { id: string; patientId: string; medicine: string; dose: string; times: string; status: "Due" | "Administered" | "Delayed" | "Held"; }
export interface NursingNote { id: string; patientId: string; by: string; at: string; text: string; }

export interface CurrentUser { role: Role; name: string; id?: string; }

export interface AppState {
  v: number;
  settings: HospitalSettings;
  departments: Department[];
  services: ServiceItem[];
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  vitals: Vitals[];
  consultations: Consultation[];
  prescriptions: Prescription[];
  pharmacyOrders: PharmacyOrder[];
  medicines: Medicine[];
  suppliers: Supplier[];
  purchases: Purchase[];
  invoices: Invoice[];
  payments: Payment[];
  admissions: Admission[];
  beds: Bed[];
  labOrders: LabOrder[];
  radiologyOrders: RadiologyOrder[];
  surgeries: Surgery[];
  staff: Employee[];
  attendance: AttendanceRec[];
  leaves: LeaveReq[];
  expenses: Expense[];
  inventory: InventoryItem[];
  assets: Asset[];
  ambulances: Ambulance[];
  feedback: FeedbackItem[];
  notices: Notice[];
  audit: AuditEntry[];
  revenueHistory: DayRevenue[];
  blogs: BlogPost[];
  packages: HealthPackage[];
  camps: HealthCamp[];
  testimonials: Testimonial[];
  faqs: Faq[];
  gallery: GalleryItem[];
  medTasks: MedTask[];
  nursingNotes: NursingNote[];
  user: CurrentUser | null;
  apptSeq: number; rxSeq: number; invSeq: number; tokenSeq: number;
}
