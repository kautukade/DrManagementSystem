-- ═══════════════════════════════════════════════════════════════
-- ITCYBER Hospital360 OS — PostgreSQL schema (multi-tenant)
-- Run in the Supabase SQL editor. Enable RLS afterwards.
-- ═══════════════════════════════════════════════════════════════

create table hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null, short_name text, tagline text,
  address text, city text, phone text, emergency text, ambulance text,
  email text, whatsapp text, hours text,
  primary_color text default '#0c6b58',
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table roles ( id text primary key, label text not null );

create table profiles (
  id uuid primary key references auth.users,
  hospital_id uuid references hospitals not null,
  role_id text references roles not null,
  full_name text, phone text, created_at timestamptz default now()
);

create table departments (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  name text not null, icon text, short text, description text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table doctors (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  department_id uuid references departments,
  name text not null, quals text, specialty text, years int, fee numeric,
  languages text[], procedures text[], bio text,
  opd_days text[], opd_from time, opd_to time, available boolean default true,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table doctor_schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references doctors not null,
  day text, from_time time, to_time time
);

create table patients (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  uhid text unique, name text not null, dob date, gender text,
  mobile text, email text, address text, emergency_contact text,
  blood text, allergies text, conditions text, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  patient_id uuid references patients not null,
  doctor_id uuid references doctors not null,
  date date not null, slot time not null, reason text,
  status text default 'Booked',
  type text default 'Online', fee numeric,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table tokens (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  appointment_id uuid references appointments unique,
  number int not null, date date not null,
  state text default 'Waiting' -- Waiting | Called | With Doctor | Completed
);

create table visits (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references appointments,
  patient_id uuid references patients not null,
  doctor_id uuid references doctors not null,
  at timestamptz default now()
);

create table consultations (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid references visits,
  patient_id uuid references patients not null,
  doctor_id uuid references doctors not null,
  complaint text, symptoms text, history text, examination text,
  diagnosis text, advice text, follow_up date, internal_notes text,
  at timestamptz default now()
);

create table vitals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients not null,
  recorded_by uuid references profiles,
  temp numeric, bp_sys int, bp_dia int, pulse int, spo2 int, sugar int, rr int,
  at timestamptz default now()
);

create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  no text unique, consultation_id uuid references consultations,
  patient_id uuid references patients not null, doctor_id uuid references doctors not null,
  advice text, follow_up date, status text default 'Active',
  at timestamptz default now()
);

create table prescription_items (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid references prescriptions on delete cascade,
  medicine_id uuid, name text, strength text, dose text, frequency text,
  duration text, route text, instructions text, qty int, price numeric
);

create table medicines (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  name text not null, generic text, brand text, manufacturer text,
  category text, gst numeric default 12,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table medicine_batches (
  id uuid primary key default gen_random_uuid(),
  medicine_id uuid references medicines on delete cascade,
  batch text, expiry date, purchase_price numeric, selling_price numeric, mrp numeric,
  stock int default 0, min_stock int default 20, rack text,
  supplier_id uuid
);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  name text, company text, rep text, phone text, email text, gst text,
  outstanding numeric default 0
);

create table pharmacy_orders (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  no text unique, prescription_id uuid references prescriptions,
  patient_id uuid references patients, status text default 'Received',
  at timestamptz default now()
);

create table pharmacy_sales (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  invoice_id uuid, total numeric, method text, at timestamptz default now()
);

create table purchases (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  supplier_id uuid references suppliers, invoice_no text, date date, total numeric
);

create table purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid references purchases on delete cascade,
  medicine_id uuid, batch text, expiry date, qty int, purchase_price numeric, mrp numeric
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  no text unique, patient_id uuid references patients not null,
  status text default 'Unpaid', due_date date,
  created_at timestamptz default now()
);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices on delete cascade,
  description text, category text, amount numeric, at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  receipt_no text unique, invoice_id uuid references invoices,
  patient_id uuid references patients, amount numeric, method text, note text,
  at timestamptz default now()
);

create table wards ( id uuid primary key default gen_random_uuid(), hospital_id uuid references hospitals not null, name text, category text );
create table rooms ( id uuid primary key default gen_random_uuid(), ward_id uuid references wards, name text );
create table beds (
  id uuid primary key default gen_random_uuid(),
  ward_id uuid references wards, room_id uuid references rooms,
  label text, rate numeric, status text default 'Available'
);

create table admissions (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  no text unique, patient_id uuid references patients, doctor_id uuid references doctors,
  diagnosis text, bed_id uuid references beds, attendant text, attendant_phone text,
  deposit numeric, insurance text, status text default 'Admitted',
  at timestamptz default now(), discharged_at timestamptz
);

create table bed_assignments (
  id uuid primary key default gen_random_uuid(),
  bed_id uuid references beds, admission_id uuid references admissions,
  from_at timestamptz default now(), to_at timestamptz
);

create table nursing_notes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients, recorded_by uuid references profiles,
  note text, at timestamptz default now()
);

create table medication_administration (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients, medicine text, dose text, scheduled_for time,
  status text default 'Due', administered_by uuid references profiles, at timestamptz
);

create table lab_orders (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  no text unique, patient_id uuid references patients, doctor_id uuid references doctors,
  test text, status text default 'Pending', priority text default 'Routine',
  results jsonb, reported_at timestamptz, at timestamptz default now()
);

create table radiology_orders (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  no text unique, patient_id uuid references patients, doctor_id uuid references doctors,
  modality text, study text, status text default 'Requested', report text,
  at timestamptz default now()
);

create table surgeries (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  patient_id uuid references patients, procedure text, surgeon_id uuid references doctors,
  assistant text, anesthetist text, ot_room text, scheduled_at timestamptz,
  status text default 'Scheduled', notes text
);

create table employees (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  emp_id text, profile_id uuid references profiles,
  name text, department text, designation text, phone text, email text,
  joined date, shift text, employment_type text, salary numeric,
  created_at timestamptz default now()
);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees, date date, status text,
  clock_in time, clock_out time
);

create table shifts ( id uuid primary key default gen_random_uuid(), employee_id uuid references employees, day text, shift text );
create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees, from_date date, to_date date,
  reason text, status text default 'Pending'
);
create table payroll (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees, month text, gross numeric,
  deductions numeric, net numeric, status text default 'Draft'
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  category text, description text, amount numeric, date date, paid boolean default false
);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  name text, category text, qty int, min_qty int, unit text, supplier text, location text
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  name text, serial text, purchased date, warranty_till date, amc text,
  location text, status text
);

create table ambulances (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  vehicle_no text, driver text, status text, patient text,
  pickup text, destination text, started_at timestamptz, ended_at timestamptz
);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  patient_name text, service int, staff int, cleanliness int, waiting int,
  overall int, comment text, at timestamptz default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  kind text, title text, body text, read boolean default false,
  at timestamptz default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals not null,
  actor uuid references profiles, action text, module text, record text,
  at timestamptz default now()
);

create table blog_posts ( id uuid primary key default gen_random_uuid(), hospital_id uuid references hospitals not null, slug text, title text, tag text, excerpt text, body jsonb, author text, published date );
create table gallery_items ( id uuid primary key default gen_random_uuid(), hospital_id uuid references hospitals not null, title text, category text, image_url text );
create table health_packages ( id uuid primary key default gen_random_uuid(), hospital_id uuid references hospitals not null, name text, price numeric, tests text[], for_who text, popular boolean default false );
create table health_camps ( id uuid primary key default gen_random_uuid(), hospital_id uuid references hospitals not null, name text, place text, date text, services text, spots int );

-- ═══ Row Level Security (pattern) ═══
alter table patients enable row level security;
create policy "tenant isolation — patients" on patients
  using (hospital_id in (select hospital_id from profiles where id = auth.uid()));
-- Apply the same pattern to every hospital-scoped table.
-- Column-level sensitivity (e.g. employees.salary) is restricted further by role claim.
