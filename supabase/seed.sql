-- Hospital360 OS — sample tenant (fictional demo hospital)
-- Run after schema.sql. All data is invented for demonstration.

insert into hospitals (name, short_name, tagline, address, city, phone, emergency, ambulance, email, whatsapp, hours)
values ('Aarogyam Multispeciality Hospital', 'Aarogyam',
        'Advanced Care. Trusted Doctors. Always With You.',
        'MIDC Road, Near Bus Stand, Pusad, Dist. Yavatmal, Maharashtra 445204',
        'Pusad', '07233-220000', '07233-220911', '07233-220108',
        'care@aarogyam.demo', '919822011000',
        'OPD: Mon-Sat 9:00 AM - 2:00 PM & 5:00 PM - 8:30 PM, Emergency 24x7');

insert into roles (id, label) values
  ('owner','Hospital Owner'), ('admin','Administrator'), ('receptionist','Receptionist'),
  ('doctor','Doctor'), ('nurse','Nurse'), ('pharmacist','Pharmacist'), ('lab','Lab Technician'),
  ('radiology','Radiology Technician'), ('accountant','Accountant'), ('hr','HR Manager'), ('patient','Patient');

-- grab the tenant id for the inserts below
\set hid (select id from hospitals where short_name = 'Aarogyam' limit 1)

insert into departments (hospital_id, name, icon, short) values
  ((select id from hospitals limit 1), 'General Medicine', 'Stethoscope', 'Fever, diabetes, BP & everyday care'),
  ((select id from hospitals limit 1), 'Cardiology', 'HeartPulse', 'ECG, Echo & preventive heart care'),
  ((select id from hospitals limit 1), 'Orthopaedics', 'Bone', 'Bones, joints, fractures & sports injuries'),
  ((select id from hospitals limit 1), 'Pediatrics', 'Baby', 'Newborn to teen care & vaccination'),
  ((select id from hospitals limit 1), 'Pathology', 'Microscope', 'Blood tests & preventive lab profiles'),
  ((select id from hospitals limit 1), 'Critical Care', 'Activity', 'ICU monitoring & emergency response');

insert into doctors (hospital_id, name, quals, specialty, years, fee, opd_days, opd_from, opd_to)
select id, 'Dr. Rahul Sharma', 'MBBS, MS (Orthopaedics)', 'Orthopaedics', 14, 500,
       array['Mon','Tue','Wed','Thu','Fri','Sat'], '09:00', '14:00' from hospitals limit 1;
insert into doctors (hospital_id, name, quals, specialty, years, fee, opd_days, opd_from, opd_to)
select id, 'Dr. Vikram Kulkarni', 'MBBS, MD (General Medicine)', 'General Medicine', 18, 400,
       array['Mon','Tue','Wed','Thu','Fri','Sat'], '09:00', '14:00' from hospitals limit 1;

insert into patients (hospital_id, uhid, name, dob, gender, mobile, blood, allergies, conditions)
select id, 'PT-2026-001241', 'Rohan Deshmukh', '1990-06-14', 'Male', '9822011001', 'O+', 'None known', 'Occasional acidity' from hospitals limit 1;
insert into patients (hospital_id, uhid, name, dob, gender, mobile, blood, allergies, conditions)
select id, 'PT-2026-001242', 'Sunita Yadav', '1982-02-21', 'Female', '9822011003', 'B+', 'Sulpha drugs', 'Type 2 Diabetes' from hospitals limit 1;

insert into medicines (hospital_id, name, generic, brand, category)
select id, 'Paracetamol 500mg', 'Paracetamol', 'Crocin', 'Analgesic' from hospitals limit 1;
insert into medicine_batches (medicine_id, batch, expiry, purchase_price, selling_price, mrp, stock, min_stock, rack)
select id, 'CR24E18', current_date + 210, 9, 14, 17, 240, 100, 'A-01' from medicines where name = 'Paracetamol 500mg';

insert into health_packages (hospital_id, name, price, tests, for_who, popular)
select id, 'Executive Health Check', 2499,
       array['CBC + ESR','HbA1c','LFT + KFT','Lipid Profile','Thyroid','ECG','Chest X-Ray','Physician Consultation'],
       'Adults 40+ & corporate', true from hospitals limit 1;

-- NOTE: seed the remaining tables from the in-app demo dataset (src/lib/data.ts),
-- which mirrors this schema field-for-field.
