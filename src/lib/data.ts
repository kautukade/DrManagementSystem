import type { AppState, Department, Doctor, Patient, Appointment, Medicine, Bed, Employee, DayRevenue } from "./types";
import { todayISO } from "./utils";

const ago = (h: number) => new Date(Date.now() - h * 3600e3).toISOString();

export const HERO_IMG = "https://image.qwenlm.ai/generated-images/9e2fa3d2-bd89-41d3-a568-9fffd66c2785/_result.png";

const departments: Department[] = [
  { id: "dep1", name: "General Medicine", icon: "Stethoscope", short: "Fever, diabetes, BP, infections & everyday care", desc: "First-line diagnosis and long-term management of common and complex medical conditions — from viral fevers to diabetes and hypertension clinics.", services: ["Diabetes Clinic", "Hypertension Clinic", "Fever & Infections", "Thyroid Care", "General Health Checkups"], head: "d4", hue: 160 },
  { id: "dep2", name: "Cardiology", icon: "HeartPulse", short: "ECG, Echo, BP & preventive heart care", desc: "Complete heart care with ECG, 2D Echo, treadmill testing and preventive cardiology programs, supported by a 24×7 emergency cardiac pathway.", services: ["ECG & 2D Echo", "TMT / Stress Test", "BP Management", "Heart Failure Clinic", "Post-Cardiac Rehab"], head: "d2", hue: 4 },
  { id: "dep3", name: "Orthopaedics", icon: "Bone", short: "Bones, joints, fractures & sports injuries", desc: "Fracture care, joint replacement counselling, arthritis management, sports injuries and physiotherapy coordination under one roof.", services: ["Fracture & Trauma Care", "Knee & Shoulder Clinic", "Arthritis Management", "Sports Injury Clinic", "Spine Consultations"], head: "d1", hue: 28 },
  { id: "dep4", name: "Pediatrics", icon: "Baby", short: "Newborn to teen — growth & vaccination", desc: "Gentle, child-focused care: immunisation, growth tracking, nutrition counselling and management of childhood illness with a dedicated children's OPD.", services: ["Immunisation Clinic", "Growth & Nutrition", "Newborn Care", "Adolescent Health", "Childhood Asthma & Allergy"], head: "d3", hue: 300 },
  { id: "dep5", name: "Gynecology", icon: "Flower2", short: "Women's health, pregnancy & PCOD care", desc: "Confidential women's health services from antenatal care and safe delivery counselling to PCOD, menstrual disorders and menopause clinics.", services: ["Antenatal Checkups", "PCOD / PCOS Clinic", "Menstrual Disorder Care", "Menopause Clinic", "Family Planning"], head: "d5", hue: 330 },
  { id: "dep6", name: "General Surgery", icon: "Slice", short: "OT procedures & laparoscopic surgery", desc: "Elective and emergency surgical care with a fully equipped operation theatre, laparoscopic procedures and structured pre-anaesthesia workups.", services: ["Laparoscopic Surgery", "Hernia & Gallbladder Care", "Wound & Burns Clinic", "Piles / Fissure Care", "Pre-anaesthesia Checkup"], head: "d8", hue: 210 },
  { id: "dep7", name: "ENT", icon: "Ear", short: "Ear, nose & throat for all ages", desc: "Diagnosis and treatment of ear infections, sinusitis, hearing loss, tonsil and throat disorders with in-clinic procedures where needed.", services: ["Hearing Assessment", "Sinusitis Care", "Tonsil & Adenoid Clinic", "Ear Discharge Treatment", "Snoring & Sleep Advice"], head: "d9", hue: 190 },
  { id: "dep8", name: "Ophthalmology", icon: "Eye", short: "Vision, cataract & diabetic eye care", desc: "Complete eye care: refraction, cataract evaluation, glaucoma screening and diabetic retinopathy checkups with modern diagnostics.", services: ["Vision & Refraction", "Cataract Evaluation", "Glaucoma Screening", "Diabetic Eye Checkup", "Conjunctivitis & Allergy Care"], head: "d7", hue: 250 },
  { id: "dep9", name: "Neurology", icon: "Brain", short: "Headache, migraine, stroke & nerve care", desc: "Evaluation and management of headaches, migraine, vertigo, neuropathies, seizure disorders and post-stroke rehabilitation planning.", services: ["Migraine & Headache Clinic", "Stroke Recovery Planning", "Neuropathy Care", "Seizure Disorder Clinic", "Vertigo & Balance Clinic"], head: "d6", hue: 270 },
  { id: "dep10", name: "Radiology", icon: "ScanLine", short: "X-Ray, Ultrasound & imaging services", desc: "In-house digital X-ray and ultrasound with same-day reporting, tightly integrated with OPD and emergency departments.", services: ["Digital X-Ray", "Ultrasound / Sonography", "Portable X-Ray", "USG Guided Procedures", "Health Checkup Imaging"], head: "d10", hue: 220 },
  { id: "dep11", name: "Pathology", icon: "Microscope", short: "Blood tests, profiles & preventive labs", desc: "A modern laboratory for hematology, biochemistry and clinical pathology with digital reports delivered to your phone and doctor.", services: ["Complete Blood Count", "LFT / KFT / Lipid Profiles", "Thyroid & Hormones", "HbA1c & Sugar Profiles", "Urine & Stool Analysis"], head: "d11", hue: 140 },
  { id: "dep12", name: "Critical Care", icon: "Activity", short: "ICU, ICU monitoring & emergency response", desc: "A monitored ICU with ventilator support, infusion pumps, 24×7 nursing and a rapid response protocol for emergencies.", services: ["Monitored ICU Beds", "Ventilator Support", "Post-Operative ICU", "Sepsis & Emergency Care", "24×7 Rapid Response"], head: "d12", hue: 0 },
];

const doctors: Doctor[] = [
  { id: "d1", name: "Dr. Rahul Sharma", deptId: "dep3", quals: "MBBS, MS (Orthopaedics)", specialty: "Orthopaedics", years: 14, fee: 500, hue: 160, languages: ["English", "Hindi", "Marathi"], procedures: ["Fracture Management", "Knee Arthroscopy", "Joint Replacement Counselling", "PRP Injections"], bio: "Consultant orthopaedic surgeon with 14 years across trauma, sports injuries and joint preservation. Believes in explaining every scan and option to the family in their own language.", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], from: "09:00", to: "14:00", available: true },
  { id: "d2", name: "Dr. Priya Deshpande", deptId: "dep2", quals: "MBBS, MD (Medicine), DNB (Cardiology)", specialty: "Cardiology", years: 16, fee: 700, hue: 4, languages: ["English", "Hindi", "Marathi"], procedures: ["ECG & Echo Interpretation", "Hypertension Care", "Heart Failure Management", "Preventive Cardiology"], bio: "Senior cardiologist focused on preventive heart care and controlled BP targets. Runs the hospital's chest-pain emergency protocol.", days: ["Mon", "Wed", "Fri"], from: "10:00", to: "15:00", available: true },
  { id: "d3", name: "Dr. Ananya Iyer", deptId: "dep4", quals: "MBBS, MD (Pediatrics)", specialty: "Pediatrics", years: 9, fee: 400, hue: 300, languages: ["English", "Hindi", "Marathi"], procedures: ["Immunisation", "Growth Assessment", "Nebulisation Protocols", "Newborn Care"], bio: "Paediatrician known for calm, unhurried consultations. Special interest in childhood nutrition and vaccine schedules.", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], from: "09:30", to: "13:30", available: true },
  { id: "d4", name: "Dr. Vikram Kulkarni", deptId: "dep1", quals: "MBBS, MD (General Medicine)", specialty: "General Medicine", years: 18, fee: 400, hue: 210, languages: ["English", "Hindi", "Marathi"], procedures: ["Diabetes Management", "Fever Workups", "Thyroid Disorders", "Lifestyle Disease Care"], bio: "Chief consulting physician and head of General Medicine. 18 years of practice with a special diabetes clinic every Saturday.", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], from: "09:00", to: "14:00", available: true },
  { id: "d5", name: "Dr. Sneha Patil", deptId: "dep5", quals: "MBBS, MS (Obstetrics & Gyna)", specialty: "Gynecology", years: 12, fee: 500, hue: 330, languages: ["English", "Hindi", "Marathi"], procedures: ["Antenatal Care", "PCOD Management", "IUCD Insertion", "Menstrual Disorder Care"], bio: "Consultant gynaecologist with a patient-first, privacy-respecting practice style. Runs the PCOD and antenatal clinics.", days: ["Tue", "Thu", "Sat"], from: "10:00", to: "14:00", available: true },
  { id: "d6", name: "Dr. Arjun Mehta", deptId: "dep9", quals: "MBBS, MD (Medicine), DM (Neurology)", specialty: "Neurology", years: 11, fee: 700, hue: 270, languages: ["English", "Hindi"], procedures: ["Migraine Treatment", "Seizure Management", "Stroke Rehabilitation Planning", "Neuropathy Care"], bio: "Neurologist with special interest in headache medicine and post-stroke recovery pathways.", days: ["Mon", "Wed"], from: "17:00", to: "20:30", available: true },
  { id: "d7", name: "Dr. Kavita Rao", deptId: "dep8", quals: "MBBS, MS (Ophthalmology)", specialty: "Ophthalmology", years: 8, fee: 400, hue: 250, languages: ["English", "Hindi", "Marathi"], procedures: ["Refraction", "Cataract Evaluation", "Glaucoma Screening", "Fundus Examination"], bio: "Eye surgeon focused on early cataract detection and diabetic eye screening camps across nearby talukas.", days: ["Mon", "Tue", "Thu", "Fri"], from: "10:00", to: "13:00", available: true },
  { id: "d8", name: "Dr. Sameer Joshi", deptId: "dep6", quals: "MBBS, MS (General Surgery)", specialty: "General Surgery", years: 15, fee: 600, hue: 28, languages: ["English", "Hindi", "Marathi"], procedures: ["Laparoscopic Cholecystectomy", "Hernia Repair", "Appendicectomy", "Wound Debridement"], bio: "Consultant surgeon with 15 years of elective and emergency surgical experience; leads the OT scheduling committee.", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], from: "09:00", to: "12:00", available: true },
  { id: "d9", name: "Dr. Neha Gupta", deptId: "dep7", quals: "MBBS, MS (ENT)", specialty: "ENT", years: 7, fee: 400, hue: 190, languages: ["English", "Hindi"], procedures: ["Audiometry Review", "Ear Syringing", "Tonsillectomy Counselling", "Sinus Care"], bio: "ENT consultant with a special clinic for childhood ear infections and hearing assessment.", days: ["Wed", "Fri", "Sat"], from: "11:00", to: "14:00", available: true },
  { id: "d10", name: "Dr. Prakash Wagh", deptId: "dep10", quals: "MBBS, MD (Radiology)", specialty: "Radiology", years: 13, fee: 0, hue: 220, languages: ["English", "Hindi", "Marathi"], procedures: ["USG Reporting", "X-Ray Reporting", "USG-Guided Procedures"], bio: "Consultant radiologist ensuring same-day reports for all OPD and emergency imaging.", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], from: "09:00", to: "17:00", available: true },
  { id: "d11", name: "Dr. Ritu Singh", deptId: "dep11", quals: "MBBS, MD (Pathology)", specialty: "Pathology", years: 10, fee: 0, hue: 140, languages: ["English", "Hindi"], procedures: ["Report Verification", "Lab Quality Control", "Hematology Review"], bio: "Pathologist heading the laboratory with NABL-aligned internal quality protocols.", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], from: "08:00", to: "16:00", available: true },
  { id: "d12", name: "Dr. Mohit Bansal", deptId: "dep12", quals: "MBBS, MD (Anaesthesia & Critical Care)", specialty: "Critical Care", years: 12, fee: 800, hue: 0, languages: ["English", "Hindi"], procedures: ["ICU Management", "Ventilator Care", "Anaesthesia", "Emergency Resuscitation"], bio: "Critical care specialist and anaesthetist who leads the ICU team and the emergency rapid-response unit.", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], from: "08:00", to: "20:00", available: true },
  { id: "d13", name: "Dr. Aarti Nair", deptId: "dep1", quals: "MBBS, MD (General Medicine)", specialty: "General Medicine", years: 6, fee: 300, hue: 160, languages: ["English", "Malayalam", "Hindi"], procedures: ["Fever Clinic", "BP & Sugar Monitoring", "General OPD"], bio: "Consultant physician in the General Medicine team, leading the evening OPD and follow-up clinic.", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], from: "17:00", to: "20:30", available: true },
  { id: "d14", name: "Dr. Sanjay Thakur", deptId: "dep3", quals: "MBBS, MS (Orthopaedics)", specialty: "Orthopaedics", years: 9, fee: 400, hue: 45, languages: ["Hindi", "Marathi"], procedures: ["Plaster & Splint Care", "Back Pain Clinic", "Physiotherapy Planning"], bio: "Orthopaedic consultant running the plaster room and back-pain clinic with weekend fracture follow-ups.", days: ["Tue", "Thu", "Sat"], from: "17:00", to: "20:30", available: true },
];

const patients: Patient[] = [
  { id: "p1", uhid: "PT-2026-001241", name: "Rohan Deshmukh", dob: "1990-06-14", gender: "Male", mobile: "9822011001", email: "rohan.demo@mail.in", address: "Ward No. 5, Shivaji Nagar, Pusad", emergencyContact: "Sneha Deshmukh — 9822011002", blood: "O+", allergies: "None known", conditions: "Occasional acidity", createdAt: ago(24 * 42) },
  { id: "p2", uhid: "PT-2026-001242", name: "Sunita Yadav", dob: "1982-02-21", gender: "Female", mobile: "9822011003", address: "Ganesh Colony, Pusad", blood: "B+", allergies: "Sulpha drugs — rash", conditions: "Type 2 Diabetes", createdAt: ago(24 * 40) },
  { id: "p3", uhid: "PT-2026-001243", name: "Arnav Kulkarni", dob: "2016-11-03", gender: "Male", mobile: "9822011004", address: "Rajiv Nagar, Pusad", emergencyContact: "Prasad Kulkarni — father", blood: "A+", allergies: "Penicillin — avoid", conditions: "Recurrent throat infections", createdAt: ago(24 * 35) },
  { id: "p4", uhid: "PT-2026-001244", name: "Meera Chavan", dob: "1994-08-19", gender: "Female", mobile: "9822011005", address: "Station Road, Pusad", blood: "O-", allergies: "None known", conditions: "PCOD", createdAt: ago(24 * 30) },
  { id: "p5", uhid: "PT-2026-001245", name: "Imran Shaikh", dob: "1975-04-02", gender: "Male", mobile: "9822011006", address: "Nehru Chowk, Pusad", blood: "B-", allergies: "Aspirin — asthma", conditions: "Hypertension", createdAt: ago(24 * 28) },
  { id: "p6", uhid: "PT-2026-001246", name: "Lakshmi Menon", dob: "1958-12-30", gender: "Female", mobile: "9822011007", address: "Sadar Bazar, Pusad", emergencyContact: "Krishnan Menon — 9822011008", blood: "A-", allergies: "Iodine contrast", conditions: "Hypertension, Hypothyroidism", createdAt: ago(24 * 60) },
  { id: "p7", uhid: "PT-2026-001247", name: "Pratik Gaikwad", dob: "1999-01-25", gender: "Male", mobile: "9822011009", address: "Mahatma Phule Ward, Pusad", blood: "AB+", allergies: "Dust allergy", conditions: "Allergic rhinitis", createdAt: ago(24 * 20) },
  { id: "p8", uhid: "PT-2026-001248", name: "Asha Pawar", dob: "1968-07-11", gender: "Female", mobile: "9822011010", address: "Kranti Nagar, Pusad", blood: "O+", allergies: "None known", conditions: "Type 2 Diabetes", createdAt: ago(24 * 55) },
  { id: "p9", uhid: "PT-2026-001249", name: "Vivaan Shetty", dob: "2021-03-08", gender: "Male", mobile: "9822011011", address: "Gandhi Chowk, Pusad", emergencyContact: "Rohit Shetty — father", blood: "B+", allergies: "None known", conditions: "—", createdAt: ago(24 * 15) },
  { id: "p10", uhid: "PT-2026-001250", name: "Nandini Borkar", dob: "1988-09-17", gender: "Female", mobile: "9822011012", address: "Civil Lines, Pusad", blood: "A+", allergies: "Seafood", conditions: "Migraine", createdAt: ago(24 * 12) },
  { id: "p11", uhid: "PT-2026-001251", name: "Sandeep Raut", dob: "1971-05-05", gender: "Male", mobile: "9822011013", address: "Yavatmal Road, Pusad", emergencyContact: "Vandana Raut — 9822011014", blood: "O+", allergies: "None known", conditions: "Gallstones", createdAt: ago(24 * 9) },
  { id: "p12", uhid: "PT-2026-001252", name: "Jyoti More", dob: "1985-10-28", gender: "Female", mobile: "9822011015", address: "Bus Stand Road, Pusad", blood: "B+", allergies: "None known", conditions: "Sinusitis", createdAt: ago(24 * 7) },
];

const t = todayISO();
const appointments: Appointment[] = [
  { id: "a1", no: "A-1041", patientId: "p2", doctorId: "d4", deptId: "dep1", date: t, slot: "09:00", reason: "Diabetes follow-up, sugar reports review", status: "Completed", token: 1, type: "Online", fee: 400, createdAt: ago(30) },
  { id: "a2", no: "A-1042", patientId: "p7", doctorId: "d4", deptId: "dep1", date: t, slot: "09:30", reason: "Recurrent cold and nasal allergy", status: "Completed", token: 2, type: "Walk-in", fee: 400, createdAt: ago(26) },
  { id: "a3", no: "A-1043", patientId: "p5", doctorId: "d1", deptId: "dep3", date: t, slot: "10:00", reason: "Left knee pain after a fall, X-ray done", status: "With Doctor", token: 3, type: "Online", fee: 500, createdAt: ago(25) },
  { id: "a4", no: "A-1044", patientId: "p3", doctorId: "d1", deptId: "dep3", date: t, slot: "10:30", reason: "Wrist fracture plaster check", status: "Waiting", token: 4, type: "Follow-up", fee: 300, createdAt: ago(24) },
  { id: "a5", no: "A-1045", patientId: "p9", doctorId: "d3", deptId: "dep4", date: t, slot: "10:30", reason: "Fever since 2 days, poor appetite", status: "Waiting", token: 5, type: "Online", fee: 400, createdAt: ago(22) },
  { id: "a6", no: "A-1046", patientId: "p4", doctorId: "d5", deptId: "dep5", date: t, slot: "11:00", reason: "Irregular cycles, PCOD review", status: "Checked In", token: 6, type: "Online", fee: 500, createdAt: ago(20) },
  { id: "a7", no: "A-1047", patientId: "p10", doctorId: "d2", deptId: "dep2", date: t, slot: "11:30", reason: "BP check, echo report discussion", status: "Checked In", token: 7, type: "Online", fee: 700, createdAt: ago(19) },
  { id: "a8", no: "A-1048", patientId: "p8", doctorId: "d13", deptId: "dep1", date: t, slot: "11:00", reason: "Sugar levels high despite medicines", status: "Waiting", token: 8, type: "Online", fee: 300, createdAt: ago(18) },
  { id: "a9", no: "A-1049", patientId: "p11", doctorId: "d8", deptId: "dep6", date: t, slot: "11:30", reason: "Pre-op review for gallbladder surgery", status: "Checked In", token: 9, type: "Online", fee: 600, createdAt: ago(16) },
  { id: "a10", no: "A-1050", patientId: "p12", doctorId: "d7", deptId: "dep8", date: t, slot: "12:00", reason: "Eye redness and watering since 3 days", status: "Waiting", token: 10, type: "Walk-in", fee: 400, createdAt: ago(14) },
  { id: "a11", no: "A-1051", patientId: "p6", doctorId: "d9", deptId: "dep7", date: t, slot: "12:00", reason: "Hearing difficulty, both ears", status: "Checked In", token: 11, type: "Online", fee: 400, createdAt: ago(12) },
  { id: "a12", no: "A-1052", patientId: "p1", doctorId: "d1", deptId: "dep3", date: t, slot: "11:30", reason: "Right shoulder pain while lifting", status: "Booked", type: "Online", fee: 500, createdAt: ago(9) },
  { id: "a13", no: "A-1053", patientId: "p3", doctorId: "d3", deptId: "dep4", date: t, slot: "17:30", reason: "Evening vaccination — scheduled shots", status: "Booked", type: "Online", fee: 400, createdAt: ago(8) },
  { id: "a14", no: "A-1054", patientId: "p10", doctorId: "d6", deptId: "dep9", date: t, slot: "18:00", reason: "Migraine not responding to current medicines", status: "Booked", type: "Online", fee: 700, createdAt: ago(6) },
  { id: "a15", no: "A-1055", patientId: "p12", doctorId: "d9", deptId: "dep7", date: t, slot: "12:30", reason: "Sinusitis review", status: "Cancelled", type: "Online", fee: 400, createdAt: ago(40) },
  { id: "a16", no: "A-1056", patientId: "p8", doctorId: "d2", deptId: "dep2", date: todayISO(1), slot: "10:00", reason: "Cardiology review of ECG", status: "Booked", type: "Online", fee: 700, createdAt: ago(3) },
  { id: "a17", no: "A-1057", patientId: "p5", doctorId: "d1", deptId: "dep3", date: todayISO(2), slot: "10:30", reason: "Knee injury — follow-up", status: "Booked", type: "Follow-up", fee: 300, createdAt: ago(2) },
  { id: "a18", no: "A-1038", patientId: "p6", doctorId: "d2", deptId: "dep2", date: todayISO(-3), slot: "10:00", reason: "BP not controlled, on treatment review", status: "Completed", token: 2, type: "Online", fee: 700, createdAt: ago(80) },
  { id: "a19", no: "A-1030", patientId: "p3", doctorId: "d4", deptId: "dep1", date: todayISO(-6), slot: "09:30", reason: "Fever and throat pain", status: "Completed", token: 3, type: "Online", fee: 400, createdAt: ago(150) },
];

const medicines: Medicine[] = [
  { id: "m1", name: "Paracetamol 500mg", generic: "Paracetamol", brand: "Crocin", manufacturer: "GSK", category: "Analgesic", batch: "CR24E18", expiry: todayISO(210), pp: 9, price: 14, mrp: 17, gst: 12, stock: 240, min: 100, rack: "A-01", supplierId: "s1" },
  { id: "m2", name: "Azithromycin 500mg", generic: "Azithromycin", brand: "Azithral", manufacturer: "Alembic", category: "Antibiotic", batch: "AZ25B02", expiry: todayISO(88), pp: 52, price: 78, mrp: 96, gst: 12, stock: 6, min: 20, rack: "B-03", supplierId: "s1" },
  { id: "m3", name: "Cetirizine 10mg", generic: "Cetirizine HCl", brand: "Cetzine", manufacturer: "Dr. Reddy's", category: "Antihistamine", batch: "CT24K11", expiry: todayISO(42), pp: 4, price: 7, mrp: 9, gst: 12, stock: 150, min: 60, rack: "A-04", supplierId: "s2" },
  { id: "m4", name: "Metformin 500mg", generic: "Metformin", brand: "Glycomet", manufacturer: "USV", category: "Antidiabetic", batch: "GM25A20", expiry: todayISO(300), pp: 8, price: 12, mrp: 15, gst: 12, stock: 320, min: 120, rack: "C-02", supplierId: "s2" },
  { id: "m5", name: "Telmisartan 40mg", generic: "Telmisartan", brand: "Telma", manufacturer: "Glenmark", category: "Antihypertensive", batch: "TL25C07", expiry: todayISO(260), pp: 18, price: 27, mrp: 33, gst: 12, stock: 180, min: 80, rack: "C-01", supplierId: "s3" },
  { id: "m6", name: "Amoxicillin 250mg Susp.", generic: "Amoxicillin", brand: "Novamox", manufacturer: "Cipla", category: "Antibiotic", batch: "NM24L30", expiry: todayISO(25), pp: 38, price: 55, mrp: 68, gst: 12, stock: 24, min: 15, rack: "B-05", supplierId: "s3" },
  { id: "m7", name: "Omeprazole 20mg", generic: "Omeprazole", brand: "Omez", manufacturer: "Dr. Reddy's", category: "Gastro", batch: "OZ25D14", expiry: todayISO(180), pp: 10, price: 15, mrp: 19, gst: 12, stock: 200, min: 80, rack: "A-07", supplierId: "s1" },
  { id: "m8", name: "Atorvastatin 10mg", generic: "Atorvastatin", brand: "Atorva", manufacturer: "Zydus", category: "Statin", batch: "AT25E09", expiry: todayISO(55), pp: 15, price: 23, mrp: 28, gst: 12, stock: 90, min: 60, rack: "C-04", supplierId: "s2" },
  { id: "m9", name: "Ibuprofen 400mg", generic: "Ibuprofen", brand: "Brufen", manufacturer: "Abbott", category: "Analgesic", batch: "IB25F03", expiry: todayISO(240), pp: 7, price: 11, mrp: 13, gst: 12, stock: 130, min: 60, rack: "A-02", supplierId: "s1" },
  { id: "m10", name: "Cefixime 200mg", generic: "Cefixime", brand: "Taxim-O", manufacturer: "Alkem", category: "Antibiotic", batch: "TX24M21", expiry: todayISO(35), pp: 46, price: 68, mrp: 84, gst: 12, stock: 18, min: 25, rack: "B-02", supplierId: "s3" },
  { id: "m11", name: "Ondansetron 4mg", generic: "Ondansetron", brand: "Emeset", manufacturer: "Cipla", category: "Antiemetic", batch: "EM25G12", expiry: todayISO(150), pp: 12, price: 18, mrp: 22, gst: 12, stock: 75, min: 40, rack: "A-09", supplierId: "s1" },
  { id: "m12", name: "Salbutamol Inhaler", generic: "Salbutamol", brand: "Asthalin", manufacturer: "Cipla", category: "Respiratory", batch: "AS25H01", expiry: todayISO(200), pp: 88, price: 122, mrp: 138, gst: 12, stock: 14, min: 10, rack: "D-01", supplierId: "s2" },
  { id: "m13", name: "ORS Sachet", generic: "Oral Rehydration Salts", brand: "Electral", manufacturer: "FDC", category: "Rehydration", batch: "EL25J19", expiry: todayISO(330), pp: 11, price: 19, mrp: 22, gst: 5, stock: 160, min: 50, rack: "D-04", supplierId: "s2" },
  { id: "m14", name: "Pantoprazole 40mg", generic: "Pantoprazole", brand: "Pan 40", manufacturer: "Alkem", category: "Gastro", batch: "PN25K05", expiry: todayISO(270), pp: 16, price: 24, mrp: 30, gst: 12, stock: 110, min: 50, rack: "A-08", supplierId: "s1" },
  { id: "m15", name: "Glimepiride 1mg", generic: "Glimepiride", brand: "Amaryl", manufacturer: "Sanofi", category: "Antidiabetic", batch: "AM24N16", expiry: todayISO(18), pp: 20, price: 31, mrp: 38, gst: 12, stock: 45, min: 40, rack: "C-03", supplierId: "s3" },
  { id: "m16", name: "Amlodipine 5mg", generic: "Amlodipine", brand: "Amlong", manufacturer: "Micro Labs", category: "Antihypertensive", batch: "AL25P08", expiry: todayISO(290), pp: 6, price: 10, mrp: 12, gst: 12, stock: 210, min: 80, rack: "C-05", supplierId: "s2" },
  { id: "m17", name: "Calcium + D3 Tab", generic: "Calcium Carbonate + Vit D3", brand: "Shelcal", manufacturer: "Torrent", category: "Supplement", batch: "SH25Q22", expiry: todayISO(365), pp: 14, price: 21, mrp: 26, gst: 12, stock: 95, min: 50, rack: "D-02", supplierId: "s1" },
  { id: "m18", name: "Diclofenac Gel 30g", generic: "Diclofenac", brand: "Volini", manufacturer: "Sun Pharma", category: "Topical Analgesic", batch: "VO25R10", expiry: todayISO(75), pp: 55, price: 82, mrp: 99, gst: 12, stock: 28, min: 15, rack: "D-05", supplierId: "s3" },
  { id: "m19", name: "Insulin Glargine", generic: "Insulin Glargine", brand: "Lantus", manufacturer: "Sanofi", category: "Antidiabetic (Cold Chain)", batch: "LA25S04", expiry: todayISO(120), pp: 410, price: 485, mrp: 520, gst: 5, stock: 12, min: 10, rack: "CC-01", supplierId: "s3" },
  { id: "m20", name: "Domperidone 10mg", generic: "Domperidone", brand: "Domstal", manufacturer: "Torrent", category: "Antiemetic", batch: "DO24T27", expiry: todayISO(12), pp: 9, price: 13, mrp: 16, gst: 12, stock: 60, min: 30, rack: "A-10", supplierId: "s1" },
  { id: "m21", name: "Ascorbic Acid 500mg", generic: "Vitamin C", brand: "Limcee", manufacturer: "Abbott", category: "Supplement", batch: "LM25U13", expiry: todayISO(230), pp: 5, price: 8, mrp: 10, gst: 12, stock: 0, min: 40, rack: "D-03", supplierId: "s2" },
  { id: "m22", name: "Montelukast 10mg", generic: "Montelukast", brand: "Montek", manufacturer: "Sun Pharma", category: "Respiratory", batch: "MK25V06", expiry: todayISO(160), pp: 22, price: 34, mrp: 41, gst: 12, stock: 55, min: 30, rack: "A-05", supplierId: "s3" },
];

function bed(ward: string, cat: string, label: string, rate: number, status: Bed["status"], patientId?: string): Bed {
  return { id: ward + "-" + label.toLowerCase(), ward, label, cat, rate, status, patientId };
}

const beds: Bed[] = [
  ...["G-01", "G-02", "G-03", "G-04", "G-05", "G-06", "G-07", "G-08", "G-09", "G-10", "G-11", "G-12"].map((l, i) =>
    bed("General Ward", "General Ward", l, 500,
      i === 1 ? "Occupied" : i === 3 ? "Cleaning" : i === 4 ? "Occupied" : i === 5 ? "Reserved" : i === 6 || i === 8 || i === 10 ? "Occupied" : "Available",
      i === 4 ? "p6" : i === 1 ? "p4" : i === 6 ? "p9" : i === 8 ? "p12" : i === 10 ? "p7" : undefined)),
  ...["S-01", "S-02", "S-03", "S-04", "S-05", "S-06"].map((l, i) =>
    bed("Semi Private", "Semi Private", l, 900, i === 0 || i === 2 ? "Occupied" : "Available", i === 0 ? "p10" : undefined)),
  ...["P-01", "P-02", "P-03", "P-04", "P-05", "P-06"].map((l, i) =>
    bed("Private", "Private", l, 1500, i === 1 || i === 4 ? "Occupied" : "Available", i === 1 ? "p8" : undefined)),
  ...["D-01", "D-02", "D-03", "D-04"].map((l, i) =>
    bed("Deluxe", "Deluxe", l, 2500, i === 0 ? "Occupied" : "Available")),
  ...["I-01", "I-02", "I-03", "I-04", "I-05", "I-06"].map((l, i) =>
    bed("ICU", "ICU", l, 3500, i === 2 ? "Occupied" : i === 0 || i === 4 ? "Occupied" : i === 5 ? "Maintenance" : "Available", i === 2 ? "p11" : undefined)),
  ...["N-01", "N-02", "N-03", "N-04"].map((l, i) =>
    bed("NICU", "NICU", l, 3000, i === 1 ? "Cleaning" : "Available")),
];

const staff: Employee[] = [
  { id: "e1", empId: "EMP-101", name: "Dr. Rahul Sharma", dept: "Doctors", designation: "Orthopaedic Surgeon", role: "doctor", phone: "9822011101", email: "rahul.sharma@aarogyam.demo", joined: "2016-04-01", shift: "Morning", type: "Full-time", salary: 120000, hue: 160 },
  { id: "e2", empId: "EMP-102", name: "Dr. Priya Deshpande", dept: "Doctors", designation: "Consultant Cardiologist", role: "doctor", phone: "9822011102", email: "priya.d@aarogyam.demo", joined: "2015-08-15", shift: "Morning", type: "Full-time", salary: 150000, hue: 4 },
  { id: "e3", empId: "EMP-103", name: "Anita Wankhede", dept: "Nursing", designation: "Senior Nurse", role: "nurse", phone: "9822011103", email: "anita.w@aarogyam.demo", joined: "2019-02-01", shift: "Morning", type: "Full-time", salary: 28000, hue: 300 },
  { id: "e4", empId: "EMP-104", name: "Sagar Kale", dept: "Reception", designation: "Front Desk Executive", role: "receptionist", phone: "9822011104", email: "sagar.k@aarogyam.demo", joined: "2021-06-10", shift: "Morning", type: "Full-time", salary: 22000, hue: 210 },
  { id: "e5", empId: "EMP-105", name: "Pooja Shinde", dept: "Pharmacy", designation: "Pharmacist", role: "pharmacist", phone: "9822011105", email: "pooja.s@aarogyam.demo", joined: "2020-01-20", shift: "Morning", type: "Full-time", salary: 30000, hue: 330 },
  { id: "e6", empId: "EMP-106", name: "Ramesh Gavit", dept: "Lab", designation: "Lab Technician", role: "lab", phone: "9822011106", email: "ramesh.g@aarogyam.demo", joined: "2018-11-05", shift: "Morning", type: "Full-time", salary: 25000, hue: 140 },
  { id: "e7", empId: "EMP-107", name: "Kiran Pawar", dept: "Radiology", designation: "Radiology Technician", role: "radiology", phone: "9822011107", email: "kiran.p@aarogyam.demo", joined: "2019-09-12", shift: "Evening", type: "Full-time", salary: 26000, hue: 220 },
  { id: "e8", empId: "EMP-108", name: "Sneha Kulkarni", dept: "Accounts", designation: "Accountant", role: "accountant", phone: "9822011108", email: "sneha.k@aarogyam.demo", joined: "2017-03-01", shift: "Morning", type: "Full-time", salary: 32000, hue: 28 },
  { id: "e9", empId: "EMP-109", name: "Vikas More", dept: "HR", designation: "HR Manager", role: "hr", phone: "9822011109", email: "vikas.m@aarogyam.demo", joined: "2018-05-22", shift: "Morning", type: "Full-time", salary: 45000, hue: 270 },
  { id: "e10", empId: "EMP-110", name: "Ashok Jadhav", dept: "Housekeeping", designation: "Supervisor", role: "staff", phone: "9822011110", email: "ashok.j@aarogyam.demo", joined: "2020-10-01", shift: "Morning", type: "Full-time", salary: 18000, hue: 190 } as unknown as Employee,
  { id: "e11", empId: "EMP-111", name: "Dinesh Rathod", dept: "Security", designation: "Security Guard", role: "staff", phone: "9822011111", email: "dinesh.r@aarogyam.demo", joined: "2022-01-15", shift: "Night", type: "Contract", salary: 16000, hue: 0 } as unknown as Employee,
  { id: "e12", empId: "EMP-112", name: "Dr. Ananya Iyer", dept: "Doctors", designation: "Pediatrician", role: "doctor", phone: "9822011112", email: "ananya.i@aarogyam.demo", joined: "2021-07-01", shift: "Morning", type: "Full-time", salary: 95000, hue: 300 },
  { id: "e13", empId: "EMP-113", name: "Mangesh Aher", dept: "Management", designation: "Hospital Administrator", role: "admin", phone: "9822011113", email: "mangesh.a@aarogyam.demo", joined: "2014-04-01", shift: "Morning", type: "Full-time", salary: 65000, hue: 210 },
  { id: "e14", empId: "EMP-114", name: "Sunil Bhosale", dept: "Ambulance", designation: "Ambulance Driver", role: "staff", phone: "9822011114", email: "sunil.b@aarogyam.demo", joined: "2019-06-01", shift: "Evening", type: "Full-time", salary: 20000, hue: 28 } as unknown as Employee,
];

const hist: DayRevenue[] = [
  { date: todayISO(-14), opd: 8200, ipd: 12000, pharmacy: 6400, lab: 3100, radiology: 1400 },
  { date: todayISO(-13), opd: 9400, ipd: 11200, pharmacy: 7100, lab: 2800, radiology: 2100 },
  { date: todayISO(-12), opd: 7600, ipd: 13800, pharmacy: 5900, lab: 3600, radiology: 700 },
  { date: todayISO(-11), opd: 10800, ipd: 12400, pharmacy: 8200, lab: 4100, radiology: 2800 },
  { date: todayISO(-10), opd: 9100, ipd: 14600, pharmacy: 7600, lab: 3300, radiology: 1400 },
  { date: todayISO(-9), opd: 6200, ipd: 11800, pharmacy: 5200, lab: 2400, radiology: 0 },
  { date: todayISO(-8), opd: 5400, ipd: 10200, pharmacy: 4600, lab: 1900, radiology: 700 },
  { date: todayISO(-7), opd: 8800, ipd: 12800, pharmacy: 6800, lab: 3800, radiology: 2100 },
  { date: todayISO(-6), opd: 11200, ipd: 15400, pharmacy: 8900, lab: 4600, radiology: 2800 },
  { date: todayISO(-5), opd: 9800, ipd: 13200, pharmacy: 7400, lab: 3500, radiology: 1400 },
  { date: todayISO(-4), opd: 12400, ipd: 16800, pharmacy: 9600, lab: 5200, radiology: 3500 },
  { date: todayISO(-3), opd: 10600, ipd: 14200, pharmacy: 8100, lab: 4300, radiology: 2100 },
  { date: todayISO(-2), opd: 11800, ipd: 15900, pharmacy: 9100, lab: 4800, radiology: 2800 },
  { date: todayISO(-1), opd: 13200, ipd: 17400, pharmacy: 10200, lab: 5400, radiology: 3100 },
];

export function seedState(): AppState {
  return {
    v: 3,
    settings: {
      name: "Aarogyam Multispeciality Hospital",
      shortName: "Aarogyam",
      tagline: "Advanced Care. Trusted Doctors. Always With You.",
      address: "MIDC Road, Near Bus Stand, Pusad, Dist. Yavatmal, Maharashtra 445204",
      city: "Pusad",
      phone: "07233-220000",
      emergency: "07233-220911",
      ambulance: "07233-220108",
      email: "care@aarogyam.demo",
      whatsapp: "919822011000",
      hours: "OPD: Mon–Sat · 9:00 AM – 2:00 PM & 5:00 PM – 8:30 PM · Emergency 24×7",
      primaryColor: "#0c6b58",
      logoHue: "165",
      lang: "en",
      announcement: "Free BP & sugar screening camp every Saturday morning, 9–11 AM at OPD foyer.",
    },
    departments,
    services: [
      { id: "sv1", name: "24×7 Emergency & Trauma", dept: "dep12", desc: "Round-the-clock emergency with resuscitation bay, trauma protocol and ambulance support.", icon: "Siren" },
      { id: "sv2", name: "Digital OPD & Token System", dept: "dep1", desc: "Online booking, live token display and WhatsApp reminders — no more crowded queues.", icon: "Ticket" },
      { id: "sv3", name: "In-House Pharmacy", dept: "dep1", desc: "Prescriptions flow directly from the doctor's desk to the pharmacy counter.", icon: "Pill" },
      { id: "sv4", name: "Pathology Lab", dept: "dep11", desc: "Reports on your phone the same day, verified by a consultant pathologist.", icon: "Microscope" },
      { id: "sv5", name: "Digital X-Ray & Sonography", dept: "dep10", desc: "Same-day imaging with PACS-integrated reporting.", icon: "ScanLine" },
      { id: "sv6", name: "Modular Operation Theatre", dept: "dep6", desc: "Laparoscopic and open procedures with a full anaesthesia team.", icon: "Slice" },
      { id: "sv7", name: "Monitored ICU", dept: "dep12", desc: "Ventilator beds, infusion pumps and 1:2 nursing for critical patients.", icon: "Activity" },
      { id: "sv8", name: "Cashless & Insurance Desk", dept: "dep1", desc: "Claim assistance for major insurers and empanelled schemes.", icon: "ShieldCheck" },
      { id: "sv9", name: "Home Sample Collection", dept: "dep11", desc: "Lab samples collected at home for senior citizens across Pusad.", icon: "Home" },
      { id: "sv10", name: "Ambulance Service", dept: "dep12", desc: "Basic life-support ambulances available on call, day and night.", icon: "Ambulance" },
    ],
    doctors,
    patients,
    appointments,
    vitals: [
      { id: "v1", patientId: "p5", at: ago(2), by: "Anita Wankhede", temp: 98.4, bpSys: 148, bpDia: 92, pulse: 84, spo2: 97, rr: 18 },
      { id: "v2", patientId: "p6", at: ago(5), by: "Anita Wankhede", temp: 97.8, bpSys: 156, bpDia: 96, pulse: 78, spo2: 96, sugar: 132, rr: 16 },
      { id: "v3", patientId: "p9", at: ago(1.5), by: "Anita Wankhede", temp: 101.2, bpSys: 96, bpDia: 62, pulse: 112, spo2: 98, rr: 26 },
      { id: "v4", patientId: "p11", at: ago(3), by: "Night Nurse", temp: 98.9, bpSys: 128, bpDia: 82, pulse: 88, spo2: 95, sugar: 145, rr: 20 },
    ],
    consultations: [
      { id: "c1", appointmentId: "a1", patientId: "p2", doctorId: "d4", at: ago(2.5), complaint: "Routine diabetes follow-up", symptoms: "No hypoglycemic episodes, mild fatigue in evenings", history: "T2DM for 6 years, on Metformin 500 BD", examination: "BP 132/84, BMI 26.4, foot exam normal", diagnosis: "Type 2 Diabetes — fair control", advice: "Continue medicines, 30-min walk daily, repeat HbA1c after 3 months", followUp: todayISO(30) },
      { id: "c2", appointmentId: "a2", patientId: "p7", doctorId: "d4", at: ago(1.8), complaint: "Recurrent sneezing and blocked nose", symptoms: "Morning sneezing bouts, clear discharge, itchy eyes", history: "Known allergic rhinitis, dust exposure at workplace", examination: "Nasal mucosa pale and boggy, throat normal", diagnosis: "Allergic rhinitis — acute exacerbation", advice: "Dust avoidance, steam inhalation twice daily, mask at work", followUp: todayISO(14) },
    ],
    prescriptions: [
      { id: "rx1", no: "RX-2026-0088", patientId: "p2", doctorId: "d4", consultationId: "c1", at: ago(2.4), items: [
        { medicineId: "m1", name: "Paracetamol 500mg", strength: "500mg", dose: "1 tablet", frequency: "SOS for fever", duration: "3 days", route: "Oral", instructions: "After food", qty: 6, price: 14 },
        { medicineId: "m4", name: "Metformin 500mg", strength: "500mg", dose: "1 tablet", frequency: "Twice daily", duration: "30 days", route: "Oral", instructions: "With meals", qty: 60, price: 12 },
      ], advice: "Repeat HbA1c after 3 months. Diet chart shared.", followUp: todayISO(30), status: "Dispensed" },
      { id: "rx2", no: "RX-2026-0082", patientId: "p6", doctorId: "d2", at: ago(70), items: [
        { medicineId: "m5", name: "Telmisartan 40mg", strength: "40mg", dose: "1 tablet", frequency: "Once daily (morning)", duration: "30 days", route: "Oral", instructions: "Before breakfast", qty: 30, price: 27 },
        { medicineId: "m8", name: "Atorvastatin 10mg", strength: "10mg", dose: "1 tablet", frequency: "Once daily (night)", duration: "30 days", route: "Oral", instructions: "After dinner", qty: 30, price: 23 },
      ], advice: "Low-salt diet. BP diary twice daily.", status: "Active" },
      { id: "rx3", no: "RX-2026-0089", patientId: "p7", doctorId: "d4", consultationId: "c2", at: ago(1.7), items: [
        { medicineId: "m3", name: "Cetirizine 10mg", strength: "10mg", dose: "1 tablet", frequency: "Once daily (night)", duration: "10 days", route: "Oral", instructions: "May cause drowsiness", qty: 10, price: 7 },
        { medicineId: "m22", name: "Montelukast 10mg", strength: "10mg", dose: "1 tablet", frequency: "Once daily (night)", duration: "10 days", route: "Oral", instructions: "After food", qty: 10, price: 34 },
      ], advice: "Steam inhalation twice daily. Review in 2 weeks.", followUp: todayISO(14), status: "Active" },
    ],
    pharmacyOrders: [
      { id: "po1", no: "PH-1023", prescriptionId: "rx1", patientId: "p2", doctorId: "d4", at: ago(2.3), items: [
        { medicineId: "m1", name: "Paracetamol 500mg", strength: "500mg", dose: "1 tablet", frequency: "SOS", duration: "3 days", route: "Oral", instructions: "After food", qty: 6, price: 14 },
        { medicineId: "m4", name: "Metformin 500mg", strength: "500mg", dose: "1 tablet", frequency: "BD", duration: "30 days", route: "Oral", instructions: "With meals", qty: 60, price: 12 },
      ], status: "Dispensed", billAdded: true },
      { id: "po2", no: "PH-1024", prescriptionId: "rx3", patientId: "p7", doctorId: "d4", at: ago(1.6), items: [
        { medicineId: "m3", name: "Cetirizine 10mg", strength: "10mg", dose: "1 tablet", frequency: "OD night", duration: "10 days", route: "Oral", instructions: "May cause drowsiness", qty: 10, price: 7 },
        { medicineId: "m22", name: "Montelukast 10mg", strength: "10mg", dose: "1 tablet", frequency: "OD night", duration: "10 days", route: "Oral", instructions: "After food", qty: 10, price: 34 },
      ], status: "Preparing", billAdded: false },
    ],
    medicines,
    suppliers: [
      { id: "s1", name: "Shree Pharma Distributors", company: "Shree Pharma", rep: "Mahesh Ingle", phone: "9823012001", email: "orders@shreepharma.demo", gst: "27AABCS1429B1ZM", outstanding: 18400 },
      { id: "s2", name: "Vidarbha Medico Agencies", company: "Vidarbha Medico", rep: "Prakash Takte", phone: "9823012002", email: "sales@vidmedico.demo", gst: "27AADCX2381K1Z4", outstanding: 0 },
      { id: "s3", name: "Lifeline Pharma & Surgical", company: "Lifeline", rep: "Farhan Qureshi", phone: "9823012003", email: "lifeline.ytl@demo.in", gst: "27AAHCL8820P1Z9", outstanding: 9650 },
      { id: "s4", name: "Cipla Stockist, Nagpur", company: "Cipla Ltd", rep: "Regional Desk", phone: "9823012004", email: "stockist.ngp@demo.in", gst: "27AAACC4723Q1ZR", outstanding: 0 },
    ],
    purchases: [
      { id: "pu1", no: "PUR-2201", supplierId: "s1", invoiceNo: "SP/8812", date: todayISO(-8), items: [
        { medicineId: "m1", name: "Paracetamol 500mg", batch: "CR24E18", expiry: todayISO(210), qty: 200, pp: 9 },
        { medicineId: "m7", name: "Omeprazole 20mg", batch: "OZ25D14", expiry: todayISO(180), qty: 100, pp: 10 },
      ], total: 2800 },
      { id: "pu2", no: "PUR-2202", supplierId: "s3", invoiceNo: "LF/4517", date: todayISO(-4), items: [
        { medicineId: "m5", name: "Telmisartan 40mg", batch: "TL25C07", expiry: todayISO(260), qty: 100, pp: 18 },
        { medicineId: "m10", name: "Cefixime 200mg", batch: "TX24M21", expiry: todayISO(35), qty: 30, pp: 46 },
      ], total: 3180 },
    ],
    invoices: [
      { id: "inv1", no: "INV-2026-0114", patientId: "p2", status: "Paid", createdAt: ago(2.2), dueDate: t, items: [
        { id: "ii1", desc: "Consultation — Dr. Vikram Kulkarni", cat: "Consultation", amount: 400, at: ago(2.2) },
        { id: "ii2", desc: "Pharmacy — RX-2026-0088 (2 items)", cat: "Pharmacy", amount: 804, at: ago(2.1) },
      ] },
      { id: "inv2", no: "INV-2026-0115", patientId: "p5", status: "Partial", createdAt: ago(1.9), dueDate: t, items: [
        { id: "ii3", desc: "Consultation — Dr. Rahul Sharma", cat: "Consultation", amount: 500, at: ago(1.9) },
        { id: "ii4", desc: "X-Ray — Left Knee (2 views)", cat: "Radiology", amount: 700, at: ago(1.8) },
        { id: "ii5", desc: "CBC + ESR", cat: "Lab", amount: 850, at: ago(1.8) },
      ] },
      { id: "inv3", no: "INV-2026-0116", patientId: "p7", status: "Unpaid", createdAt: ago(1.5), dueDate: t, items: [
        { id: "ii6", desc: "Consultation — Dr. Vikram Kulkarni", cat: "Consultation", amount: 400, at: ago(1.5) },
      ] },
      { id: "inv4", no: "INV-2026-0117", patientId: "p10", status: "Paid", createdAt: ago(1.2), dueDate: t, items: [
        { id: "ii7", desc: "Consultation — Dr. Priya Deshpande", cat: "Consultation", amount: 700, at: ago(1.2) },
        { id: "ii8", desc: "ECG + 2D Echo", cat: "Procedure", amount: 1300, at: ago(1.1) },
      ] },
      { id: "inv5", no: "INV-2026-0109", patientId: "p6", status: "Paid", createdAt: ago(72), dueDate: todayISO(-3), items: [
        { id: "ii9", desc: "Consultation — Cardiology", cat: "Consultation", amount: 700, at: ago(72) },
        { id: "ii10", desc: "Thyroid Profile + KFT", cat: "Lab", amount: 1050, at: ago(71) },
        { id: "ii11", desc: "Pharmacy — 30 days medicines", cat: "Pharmacy", amount: 1500, at: ago(71) },
      ] },
      { id: "inv6", no: "INV-2026-0102", patientId: "p3", status: "Paid", createdAt: ago(150), dueDate: todayISO(-6), items: [
        { id: "ii12", desc: "Consultation — General Medicine", cat: "Consultation", amount: 400, at: ago(150) },
        { id: "ii13", desc: "CBC + Throat Swab Culture", cat: "Lab", amount: 950, at: ago(149) },
      ] },
    ],
    payments: [
      { id: "py1", receiptNo: "RCP-5121", invoiceId: "inv1", patientId: "p2", amount: 1204, method: "UPI", at: ago(2) },
      { id: "py2", receiptNo: "RCP-5122", invoiceId: "inv2", patientId: "p5", amount: 1000, method: "Cash", at: ago(1.4), note: "Balance ₹1,050 to be collected" },
      { id: "py3", receiptNo: "RCP-5123", invoiceId: "inv4", patientId: "p10", amount: 2000, method: "Card", at: ago(1) },
      { id: "py4", receiptNo: "RCP-5109", invoiceId: "inv5", patientId: "p6", amount: 3250, method: "Card", at: ago(70) },
      { id: "py5", receiptNo: "RCP-5098", invoiceId: "inv6", patientId: "p3", amount: 1350, method: "UPI", at: ago(148) },
    ],
    admissions: [
      { id: "adm1", no: "IPD-0412", patientId: "p6", doctorId: "d2", at: ago(49), diagnosis: "Hypertensive urgency — observation", ward: "General Ward", bedId: "general ward-g-05", attendant: "Krishnan Menon (Spouse)", attendantPhone: "9822011008", deposit: 5000, insurance: "Self-pay", status: "Admitted", notes: "BP monitoring 4-hourly, low-salt diet, echo review." },
      { id: "adm2", no: "IPD-0413", patientId: "p8", doctorId: "d13", at: ago(26), diagnosis: "Acute gastroenteritis with dehydration", ward: "Private", bedId: "private-p-02", attendant: "Ravi Pawar (Son)", attendantPhone: "9822011016", deposit: 3000, insurance: "Star Health — Pre-auth pending", status: "Admitted", notes: "IV fluids, antiemetics, sugar watch (diabetic)." },
      { id: "adm3", no: "IPD-0414", patientId: "p11", doctorId: "d12", at: ago(6), diagnosis: "Post-operative monitoring (lap. cholecystectomy)", ward: "ICU", bedId: "icu-i-03", attendant: "Vandana Raut (Wife)", attendantPhone: "9822011014", deposit: 10000, insurance: "Self-pay", status: "Admitted", notes: "Shift to ward tomorrow if stable." },
    ],
    beds,
    labOrders: [
      { id: "lab1", no: "LAB-0771", patientId: "p5", doctorId: "d1", test: "CBC + ESR", at: ago(1.8), status: "Completed", priority: "Routine", reportedAt: ago(0.8), results: { "Hb": "13.1 g/dL", "TLC": "9,800 /cumm", "Platelets": "2.4 L/cumm", "ESR": "22 mm/hr", "Hematocrit": "40%" } },
      { id: "lab2", no: "LAB-0772", patientId: "p3", doctorId: "d4", test: "LFT", at: ago(1.1), status: "Processing", priority: "Routine" },
      { id: "lab3", no: "LAB-0773", patientId: "p6", doctorId: "d2", test: "Thyroid Profile", at: ago(0.7), status: "Sample Collected", priority: "Urgent" },
      { id: "lab4", no: "LAB-0770", patientId: "p2", doctorId: "d4", test: "HbA1c", at: ago(2.6), status: "Pending", priority: "Routine" },
    ],
    radiologyOrders: [
      { id: "rad1", no: "RAD-0341", patientId: "p5", doctorId: "d1", modality: "X-Ray", study: "Left Knee (2 views)", at: ago(1.9), status: "Report Ready", report: "No fracture or dislocation. Mild joint space narrowing medially. Early degenerative changes. Suggest clinical correlation." },
      { id: "rad2", no: "RAD-0342", patientId: "p11", doctorId: "d8", modality: "Ultrasound", study: "Abdomen & Pelvis", at: ago(20), status: "Report Ready", report: "Gallbladder shows multiple calculi, largest 1.2 cm with acoustic shadowing. No CBD dilatation. Liver, pancreas, spleen normal." },
      { id: "rad3", no: "RAD-0343", patientId: "p6", doctorId: "d2", modality: "X-Ray", study: "Chest PA", at: ago(0.9), status: "Scheduled" },
    ],
    surgeries: [
      { id: "sur1", patientId: "p11", procedure: "Laparoscopic Cholecystectomy", surgeonId: "d8", assistant: "Dr. Sanjay Thakur", anesthetist: "Dr. Mohit Bansal", ot: "OT-1", at: ago(8), status: "Completed", notes: "Uneventful, shifted to ICU for monitoring." },
      { id: "sur2", patientId: "p9", procedure: "I&D — Abscess, Left Forearm", surgeonId: "d8", assistant: "MO on duty", anesthetist: "Local + sedation", ot: "OT-2", at: new Date(Date.now() + 86400e3).toISOString(), status: "Scheduled", notes: "Keep NPO from midnight." },
    ],
    staff,
    attendance: [
      { id: "at1", empId: "e1", date: t, status: "Present", clockIn: "08:52" },
      { id: "at2", empId: "e3", date: t, status: "Present", clockIn: "08:55" },
      { id: "at3", empId: "e4", date: t, status: "Late", clockIn: "09:22" },
      { id: "at4", empId: "e5", date: t, status: "Present", clockIn: "08:58" },
      { id: "at5", empId: "e6", date: t, status: "Present", clockIn: "08:40" },
      { id: "at6", empId: "e7", date: t, status: "Leave" },
      { id: "at7", empId: "e8", date: t, status: "Present", clockIn: "09:01" },
      { id: "at8", empId: "e9", date: t, status: "Present", clockIn: "09:10" },
      { id: "at9", empId: "e10", date: t, status: "Absent" },
      { id: "at10", empId: "e12", date: t, status: "Present", clockIn: "09:15" },
      { id: "at11", empId: "e13", date: t, status: "Present", clockIn: "08:45" },
    ],
    leaves: [
      { id: "lv1", empId: "e7", from: t, to: todayISO(2), reason: "Family function at Nagpur", status: "Approved" },
      { id: "lv2", empId: "e5", from: todayISO(3), to: todayISO(4), reason: "Personal work", status: "Pending" },
    ],
    expenses: [
      { id: "ex1", cat: "Electricity", desc: "MSEB bill — current month", amount: 38500, date: todayISO(-5), paid: true },
      { id: "ex2", cat: "Supplies", desc: "Surgical gloves, syringes restock", amount: 12400, date: todayISO(-4), paid: true },
      { id: "ex3", cat: "Maintenance", desc: "AC servicing — OT & ICU", amount: 8000, date: todayISO(-3), paid: false },
      { id: "ex4", cat: "Ambulance", desc: "Diesel & consumables", amount: 5600, date: todayISO(-2), paid: true },
      { id: "ex5", cat: "Rent", desc: "Generator rental", amount: 9000, date: todayISO(-6), paid: true },
      { id: "ex6", cat: "Miscellaneous", desc: "Water purifier cartridges", amount: 2400, date: todayISO(-1), paid: false },
    ],
    inventory: [
      { id: "in1", name: "Examination Gloves (M)", cat: "Consumable", qty: 1400, min: 500, unit: "pairs", supplier: "Lifeline Pharma & Surgical", location: "Store A" },
      { id: "in2", name: "Disposable Syringes 5ml", cat: "Consumable", qty: 320, min: 400, unit: "pcs", supplier: "Lifeline Pharma & Surgical", location: "Store A" },
      { id: "in3", name: "N95 Masks", cat: "PPE", qty: 90, min: 100, unit: "pcs", supplier: "Vidarbha Medico", location: "Store B" },
      { id: "in4", name: "IV Sets (Adult)", cat: "Consumable", qty: 240, min: 120, unit: "sets", supplier: "Lifeline Pharma & Surgical", location: "Store A" },
      { id: "in5", name: "Surgical Sutures 3-0", cat: "Surgical", qty: 60, min: 40, unit: "pcs", supplier: "Lifeline Pharma & Surgical", location: "OT Store" },
      { id: "in6", name: "Surface Disinfectant 5L", cat: "Cleaning", qty: 18, min: 10, unit: "cans", supplier: "Shree Pharma", location: "Store B" },
      { id: "in7", name: "Oxygen Cylinders (D-type)", cat: "Medical Gas", qty: 6, min: 8, unit: "cylinders", supplier: "Nagpur Gas Agency", location: "Gas Store" },
      { id: "in8", name: "Patient Bedsheets", cat: "Linen", qty: 85, min: 40, unit: "pcs", supplier: "Local vendor", location: "Linen Room" },
    ],
    assets: [
      { id: "as1", name: "Ventilator (ICU)", serial: "VT-88231", purchased: "2022-03-10", warrantyTill: "2026-03-10", amc: "Active till Dec 2026", location: "ICU Bay 1", status: "In Use" },
      { id: "as2", name: "12-Channel ECG", serial: "EC-45117", purchased: "2021-07-22", warrantyTill: "2024-07-22", amc: "Active till Jul 2026", location: "OPD Room 2", status: "In Use" },
      { id: "as3", name: "Patient Monitor", serial: "PM-73320", purchased: "2023-01-15", warrantyTill: "2026-01-15", amc: "—", location: "Emergency Bay", status: "In Use" },
      { id: "as4", name: "Defibrillator", serial: "DF-20988", purchased: "2020-11-02", warrantyTill: "2023-11-02", amc: "Active till Nov 2026", location: "Resuscitation Room", status: "Idle" },
      { id: "as5", name: "Digital X-Ray", serial: "XR-66120", purchased: "2019-05-18", warrantyTill: "2022-05-18", amc: "Active till May 2026", location: "Radiology", status: "In Use" },
      { id: "as6", name: "Ultrasound Machine", serial: "US-90344", purchased: "2022-09-30", warrantyTill: "2025-09-30", amc: "—", location: "Radiology", status: "Under Repair" },
      { id: "as7", name: "Anaesthesia Workstation", serial: "AW-31567", purchased: "2021-02-14", warrantyTill: "2024-02-14", amc: "Active till Feb 2027", location: "OT-1", status: "In Use" },
    ],
    ambulances: [
      { id: "amb1", no: "MH-36-AH-2211", driver: "Sunil Bhosale", status: "Available" },
      { id: "amb2", no: "MH-36-AH-2212", driver: "Ganesh Thombre", status: "On Trip", patient: "Referral — Pusad → Yavatmal Civil", from: "Aarogyam, Pusad", to: "Civil Hospital, Yavatmal", since: ago(1.2) },
      { id: "amb3", no: "MH-36-AH-2213", driver: "—", status: "Maintenance" },
    ],
    feedback: [
      { id: "fb1", patient: "Sunita Yadav", service: 5, staff: 5, cleanliness: 4, waiting: 4, overall: 5, comment: "Medicines came to the counter before I even reached the pharmacy. Very organised.", at: ago(20) },
      { id: "fb2", patient: "Prasad Kulkarni", service: 4, staff: 5, cleanliness: 5, waiting: 3, overall: 4, comment: "Doctor explained my son's reports patiently. Waiting area can be bigger.", at: ago(45) },
      { id: "fb3", patient: "Vandana Raut", service: 5, staff: 4, cleanliness: 5, waiting: 4, overall: 5, comment: "ICU updates were given to the family twice a day without asking.", at: ago(30) },
      { id: "fb4", patient: "Meera Chavan", service: 4, staff: 4, cleanliness: 4, waiting: 3, overall: 4, comment: "Online booking worked properly, token display is a great idea.", at: ago(70) },
      { id: "fb5", patient: "Imran Shaikh", service: 4, staff: 5, cleanliness: 4, waiting: 4, overall: 4, comment: "X-ray report was ready the same day. Billing was clear, no hidden charges.", at: ago(96) },
      { id: "fb6", patient: "Nandini Borkar", service: 3, staff: 4, cleanliness: 4, waiting: 2, overall: 3, comment: "Cardiology OPD wait was long on Friday evening. Please add a slot.", at: ago(120) },
    ],
    notices: [
      { id: "n1", kind: "appointment", title: "New appointment booked", body: "Rohan Deshmukh · Dr. Rahul Sharma · 11:30 AM today", at: ago(9), read: false },
      { id: "n2", kind: "stock", title: "Low stock: Azithromycin 500mg", body: "6 units left (minimum 20). Reorder suggested from Shree Pharma.", at: ago(5), read: false },
      { id: "n3", kind: "lab", title: "Lab report ready", body: "CBC + ESR for Imran Shaikh is completed and sent to Dr. Sharma.", at: ago(0.8), read: false },
      { id: "n4", kind: "billing", title: "Pending bill ₹1,050", body: "Imran Shaikh — INV-2026-0115 balance to be collected at counter.", at: ago(1.4), read: false },
      { id: "n5", kind: "stock", title: "2 medicines expiring within 30 days", body: "Amoxicillin 250 susp. (25d), Domperidone 10mg (12d)", at: ago(28), read: true },
      { id: "n6", kind: "bed", title: "ICU bed I-06 under maintenance", body: "Vendor visit scheduled; 3 ICU beds currently available.", at: ago(22), read: true },
    ],
    audit: [
      { id: "au1", user: "Sagar Kale", role: "Receptionist", action: "Checked in appointment A-1051 (Token 11)", module: "Appointments", record: "Jyoti More → Dr. Neha Gupta", at: ago(0.4) },
      { id: "au2", user: "Pooja Shinde", role: "Pharmacist", action: "Dispensed order PH-1023", module: "Pharmacy", record: "RX-2026-0088 · Sunita Yadav", at: ago(2.1) },
      { id: "au3", user: "Dr. Vikram Kulkarni", role: "Doctor", action: "Finalised prescription RX-2026-0089", module: "Prescriptions", record: "Pratik Gaikwad", at: ago(1.7) },
      { id: "au4", user: "Ramesh Gavit", role: "Lab Tech", action: "Entered results for LAB-0771", module: "Lab", record: "CBC + ESR · Imran Shaikh", at: ago(0.8) },
      { id: "au5", user: "Sneha Kulkarni", role: "Accountant", action: "Recorded payment RCP-5123 ₹2,000 (Card)", module: "Billing", record: "INV-2026-0117", at: ago(1) },
      { id: "au6", user: "Mangesh Aher", role: "Admin", action: "Adjusted stock — Paracetamol 500mg +200", module: "Inventory", record: "Purchase SP/8812", at: ago(24 * 8) },
      { id: "au7", user: "Vikas More", role: "HR", action: "Approved leave for Kiran Pawar", module: "HR", record: "EMP-107 · 3 days", at: ago(24 * 2) },
      { id: "au8", user: "Sagar Kale", role: "Receptionist", action: "Cancelled appointment A-1055", module: "Appointments", record: "Jyoti More · Dr. Neha Gupta", at: ago(40) },
    ],
    revenueHistory: hist,
    blogs: [
      { id: "b1", slug: "monsoon-fever-guide", title: "Monsoon Fevers in Vidarbha: When to See a Doctor", tag: "General Health", excerpt: "Dengue, typhoid and viral fevers rise every monsoon. Here's how to tell a routine viral illness from something that needs urgent care.", body: ["Every monsoon, our OPD sees a sharp rise in febrile illness. Most are self-limiting viral fevers, but dengue and typhoid can look identical for the first three days.", "See a doctor immediately if fever crosses 101°F for more than 2 days, or is accompanied by bleeding gums, severe abdominal pain, extreme weakness, or rashes.", "At Aarogyam, CBC with platelet tracking, dengue NS1 and malaria tests are available the same day. Our physicians advise against self-medication with antibiotics — they don't work for viral fevers and can mask serious illness.", "Hydration is the first medicine: ORS, coconut water and soups. Keep paracetamol at home, avoid aspirin or ibuprofen in suspected dengue, and rest."], author: "Dr. Vikram Kulkarni", date: todayISO(-12), read: "4 min", hue: 160 },
      { id: "b2", slug: "diabetes-sugar-journal", title: "The 30-Day Sugar Journal That Changed Our Diabetes Clinic", tag: "Diabetes", excerpt: "A simple paper habit our diabetes clinic recommends — and the numbers it produces for your doctor.", body: ["HbA1c tells us the average; your sugar journal tells us the story. We ask every new diabetes patient to note two readings — fasting and 2-hour post-meal — for 30 days.", "Patterns emerge quickly: the Tuesday-after-festival spike, the morning walk effect, the medicine timing mismatch. These patterns change prescriptions more than any single lab value.", "Bring your journal (or your glucometer memory) to every review. Our OPD software keeps these alongside your prescriptions so any doctor in the team can see your full curve.", "Starting is the hard part. One month of honesty beats a year of guesswork."], author: "Dr. Aarti Nair", date: todayISO(-25), read: "5 min", hue: 210 },
      { id: "b3", slug: "plaster-care-child-fracture", title: "Plaster Care for Children: A Parent's Checklist", tag: "Pediatrics", excerpt: "Your child got a cast. Here's what's normal in week one — and the three signs that need a same-day visit.", body: ["Swelling in the first 48 hours is expected. Keep the limb elevated on pillows and let fingers or toes wiggle freely several times a day.", "Normal: mild itch, a few stains, the plaster feeling heavy. Not normal: fingers turning blue or cold, numbness that doesn't settle, foul smell or fever.", "Never insert objects inside the cast to scratch — use a hair dryer on cool setting instead, and keep the cast completely dry during baths with a plastic cover and tape.", "Follow-up X-ray is usually scheduled 2–3 weeks later. Our plaster room runs every Tuesday and Saturday evening for cast checks."], author: "Dr. Sanjay Thakur", date: todayISO(-40), read: "4 min", hue: 28 },
      { id: "b4", slug: "bp-home-monitoring", title: "How to Measure BP at Home (Most People Do It Wrong)", tag: "Heart Health", excerpt: "Cuff size, arm position, and the 5-minute rule — three fixes that make home BP readings actually useful.", body: ["A home BP machine is only as good as its technique. Sit with back supported, feet flat, arm at heart level — and rest for five full minutes before the first reading.", "Take two readings, one minute apart, morning and evening for a week before your review. Bring the machine to clinic once a year to check it against ours.", "Avoid tea, tobacco and exercise 30 minutes before measuring. White-coat readings at clinics often run 10–15 points higher — your home diary helps us avoid over-treatment.", "Record readings with date and time. Our cardiology team reviews home diaries at every visit and adjusts treatment on real data, not single readings."], author: "Dr. Priya Deshpande", date: todayISO(-55), read: "3 min", hue: 4 },
    ],
    packages: [
      { id: "pk1", name: "Basic Health Check", price: 999, forWho: "Adults up to 40 years", tests: ["CBC", "Blood Sugar (Fasting)", "Lipid Profile", "Urine Routine", "BP & BMI Consultation"] },
      { id: "pk2", name: "Executive Health Check", price: 2499, popular: true, forWho: "Adults 40+ & corporate", tests: ["CBC + ESR", "HbA1c", "LFT + KFT", "Lipid Profile", "Thyroid (T3 T4 TSH)", "ECG", "Chest X-Ray", "Physician Consultation"] },
      { id: "pk3", name: "Women's Wellness", price: 1999, forWho: "Women of all ages", tests: ["CBC", "Thyroid Profile", "Blood Sugar", "Iron Studies", "Gynaec Consultation", "Pelvic USG (if advised)"] },
      { id: "pk4", name: "Cardiac Screening", price: 2999, forWho: "BP / diabetes / family history", tests: ["ECG", "2D Echo", "Lipid Profile", "HbA1c", "TMT (if advised)", "Cardiologist Consultation"] },
    ],
    camps: [
      { id: "hc1", name: "Free BP & Sugar Screening", place: "OPD Foyer, Aarogyam", date: "Every Saturday · 9:00–11:00 AM", services: "BP, random sugar, BMI, doctor advice", spots: 60 },
      { id: "hc2", name: "School Vision Checkup", place: "Z.P. School, Pusad", date: "Next month — date to be announced", services: "Vision screening, refraction advice", spots: 250 },
      { id: "hc3", name: "Joint Pain & Bone Camp", place: "Municipal Ground, Pusad", date: "Quarterly camp", services: "Ortho consult, X-ray at 50% concession", spots: 120 },
    ],
    testimonials: [
      { id: "ts1", name: "Sunita Yadav", place: "Pusad", text: "From token to pharmacy, everything moved like clockwork. The doctor actually had my old prescriptions on his screen.", rating: 5 },
      { id: "ts2", name: "Krishnan Menon", place: "Sadar Bazar", text: "My wife was in the general ward for BP observation. Nurses updated us every four hours without us asking.", rating: 5 },
      { id: "ts3", name: "Rohit Shetty", place: "Gandhi Chowk", text: "Took my 4-year-old at midnight with high fever. Emergency team saw him within ten minutes. Forever grateful.", rating: 5 },
      { id: "ts4", name: "Prasad Kulkarni", place: "Rajiv Nagar", text: "Transparent billing — the estimate they gave before admission matched the final bill almost exactly.", rating: 4 },
      { id: "ts5", name: "Nandini Borkar", place: "Civil Lines", text: "Booked online, got WhatsApp confirmation, saw the live token on the TV. This is how every hospital should run.", rating: 4 },
    ],
    faqs: [
      { id: "fq1", q: "What are the OPD timings?", a: "OPD runs Monday to Saturday, 9:00 AM – 2:00 PM and 5:00 PM – 8:30 PM. Emergency services are available 24×7, all days." },
      { id: "fq2", q: "Do I need an appointment or can I walk in?", a: "Both work. Online booking gives you a confirmed slot; walk-ins receive a token at reception and are seen in queue order." },
      { id: "fq3", q: "How does the token system work?", a: "After check-in at reception you receive a token number. The live display in the lobby (and your SMS) shows when your turn is near." },
      { id: "fq4", q: "Is there a pharmacy inside the hospital?", a: "Yes. Prescriptions are sent digitally from the doctor's desk to our in-house pharmacy, usually ready by the time you reach the counter." },
      { id: "fq5", q: "Do you accept insurance and cashless claims?", a: "Our insurance desk assists with pre-authorisation for major insurers. Carry your policy card and a valid ID. Scheme empanelment details are available at the desk." },
      { id: "fq6", q: "Can I get my lab reports on WhatsApp?", a: "Yes — most reports are delivered digitally the same day. Printed copies are available at the lab counter." },
      { id: "fq7", q: "What are the visiting hours for admitted patients?", a: "General wards: 11 AM – 1 PM and 5 PM – 7 PM. ICU has one attendant slot per patient, coordinated by the ICU nurse." },
      { id: "fq8", q: "Is ambulance service available at night?", a: "Yes, our BLS ambulances operate 24×7. Call the ambulance desk — night response within Pusad town is typically under 20 minutes." },
    ],
    gallery: [
      { id: "g1", title: "Reception Atrium", cat: "Facilities", hue: 165, icon: "Building2" },
      { id: "g2", title: "Modular OT-1", cat: "OT", hue: 210, icon: "Slice" },
      { id: "g3", title: "ICU Bay", cat: "Critical Care", hue: 0, icon: "Activity" },
      { id: "g4", title: "Pharmacy Counter", cat: "Pharmacy", hue: 140, icon: "Pill" },
      { id: "g5", title: "Pathology Lab", cat: "Lab", hue: 190, icon: "Microscope" },
      { id: "g6", title: "Radiology Suite", cat: "Radiology", hue: 220, icon: "ScanLine" },
      { id: "g7", title: "Children's OPD", cat: "Pediatrics", hue: 300, icon: "Baby" },
      { id: "g8", title: "Private Ward", cat: "IPD", hue: 28, icon: "BedDouble" },
    ],
    medTasks: [
      { id: "mt1", patientId: "p6", medicine: "Tab. Telmisartan 40mg", dose: "1 tab", times: "08:00 AM", status: "Administered" },
      { id: "mt2", patientId: "p6", medicine: "Inj. Ceftriaxone 1g IV", dose: "1 vial in NS 100ml", times: "10:00 AM", status: "Due" },
      { id: "mt3", patientId: "p8", medicine: "IV Fluids RL", dose: "1 pint / 6 hr", times: "Continuous", status: "Due" },
      { id: "mt4", patientId: "p8", medicine: "Inj. Ondansetron 4mg IV", dose: "1 amp", times: "SOS", status: "Held" },
      { id: "mt5", patientId: "p11", medicine: "Inj. Ceftriaxone 1g IV", dose: "1 vial BD", times: "08:00 PM", status: "Due" },
      { id: "mt6", patientId: "p11", medicine: "Tab. Paracetamol 500mg", dose: "1 tab", times: "06:00 AM", status: "Administered" },
      { id: "mt7", patientId: "p6", medicine: "Tab. Eltroxin 50mcg", dose: "1 tab", times: "06:00 AM (empty stomach)", status: "Administered" },
    ],
    nursingNotes: [
      { id: "nn1", patientId: "p6", by: "Anita Wankhede", at: ago(4), text: "BP 148/92 at 6 AM after medication. Patient comfortable, no complaints of headache or blurring of vision. Encouraged low-salt diet." },
      { id: "nn2", patientId: "p8", by: "Night Nurse", at: ago(9), text: "3 loose motions overnight. IV fluids running, urine output adequate. Sugar 154 mg/dL at midnight — sliding scale as per orders." },
      { id: "nn3", patientId: "p11", by: "ICU Nurse", at: ago(2), text: "Post-op day 1, vitals stable, drain output 30ml serous. Pain controlled on SOS paracetamol. Mobilised on bed." },
    ],
    user: null,
    apptSeq: 1057, rxSeq: 89, invSeq: 117, tokenSeq: 11,
  };
}

export const LAB_TEST_FIELDS: Record<string, string[]> = {
  "CBC + ESR": ["Hb", "TLC", "Platelets", "ESR", "Hematocrit"],
  "LFT": ["Bilirubin Total", "SGPT", "SGOT", "ALP", "Albumin"],
  "KFT": ["Creatinine", "Urea", "Uric Acid", "Sodium", "Potassium"],
  "Thyroid Profile": ["T3", "T4", "TSH"],
  "Lipid Profile": ["Total Cholesterol", "LDL", "HDL", "Triglycerides"],
  "HbA1c": ["HbA1c %", "Avg. Blood Glucose"],
  "Blood Sugar (Fasting)": ["FBS (mg/dL)"],
  "Urine Routine": ["Colour", "pH", "Protein", "Sugar", "Pus Cells"],
};

export const CONSULT_TEMPLATES: Record<string, { complaint: string; symptoms: string; diagnosis: string; advice: string; meds: { name: string; dose: string; frequency: string; duration: string; instructions: string }[] }> = {
  "Fever Template": {
    complaint: "Fever since 2 days",
    symptoms: "High-grade fever with chills, body ache, decreased appetite",
    diagnosis: "Acute viral fever",
    advice: "Plenty of fluids, tepid sponging if temp > 101°F, rest for 3 days. Report back if fever persists beyond 72 hours or bleeding/rash appears.",
    meds: [
      { name: "Paracetamol 500mg", dose: "1 tablet", frequency: "Three times daily", duration: "3 days", instructions: "After food" },
      { name: "ORS Sachet", dose: "1 sachet in 1L water", frequency: "Sip through day", duration: "3 days", instructions: "With meals" },
    ],
  },
  "Diabetes Follow-up": {
    complaint: "Diabetes follow-up visit",
    symptoms: "Review of sugar readings; check for hypoglycemia episodes, numbness or visual changes",
    diagnosis: "Type 2 Diabetes — treatment review",
    advice: "Continue medicines as advised. 30-minute brisk walk daily, repeat HbA1c after 3 months. Low-carb dinner, no sugary drinks.",
    meds: [
      { name: "Metformin 500mg", dose: "1 tablet", frequency: "Twice daily", duration: "30 days", instructions: "With meals" },
    ],
  },
  "Hypertension Follow-up": {
    complaint: "BP review visit",
    symptoms: "Review of home BP diary; check for headache, palpitations or ankle swelling",
    diagnosis: "Essential hypertension — on treatment",
    advice: "Continue antihypertensive. Low-salt diet (<5g/day), maintain BP diary twice daily, bring diary at next visit. Repeat KFT after 1 month.",
    meds: [
      { name: "Telmisartan 40mg", dose: "1 tablet", frequency: "Once daily (morning)", duration: "30 days", instructions: "Before breakfast" },
    ],
  },
};
