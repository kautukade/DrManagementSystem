# ITCYBER Hospital360 OS — Demo Deployment

A complete digital operating system for hospitals: public website, appointments & tokens, OPD consultation,
digital prescriptions, pharmacy (with live stock), billing & payments, IPD & beds, nursing, lab, radiology,
OT, staff/HR, accounts, analytics, patient portal, notifications, audit logs and an AI-assistant-ready shell.

Demo tenant: **Aarogyam Multispeciality Hospital, Pusad** (fully fictional data).

## Run it (Windows, beginner friendly)

1. Install **Node.js LTS** from https://nodejs.org (the installer adds `npm` automatically).
2. Open the project folder in a terminal (PowerShell / CMD):
   ```bash
   npm install
   npm run dev
   ```
3. Open the printed URL (usually `http://localhost:5173`).
4. Production build:
   ```bash
   npm run build
   ```

## The 7-minute sales demo

1. Open the public website → **Book Appointment** → Orthopaedics → Dr. Rahul Sharma → pick a slot → confirm.
2. Click **Staff Login** → *Login as Receptionist* → check the patient in → **Token 12** is issued; open *Lobby TV*.
3. Log out → *Login as Doctor* → start the consultation → apply a template → add medicines → **Save**.
4. Click **Send to Hospital Pharmacy** → log in as *Pharmacist* → Preparing → Ready → **Dispense**
   (stock decreases automatically, pharmacy amount lands on the patient's bill).
5. Log in as *Accountant* → Billing → open the invoice → **Record payment** (UPI/Card/Cash, split allowed).
6. Log in as *Owner* — today's revenue, pharmacy sales and charts have all moved.

Everything above is real state (persisted to your browser's localStorage). **Settings → Reset demo data** restores the factory dataset.

## Architecture

```
src/
  lib/        types, seed data, store (all workflows), utils
  components/ design system (ui.tsx), charts
  layouts/    PublicLayout (website), AppLayout (OS shell: sidebar, search, AI, tour)
  pages/site  public website + booking + patient portal
  pages/dash  owner, reception, doctor, pharmacy, billing, patients,
              IPD/beds/nursing/lab/radiology/OT, HR, ops, analytics, settings
supabase/     schema.sql (multi-tenant DDL) + seed.sql
```

- Multi-tenant ready: every table carries `hospital_id`; all hospital branding lives in one settings object.
- This demo runs fully client-side. Swap `lib/store.tsx` actions for Supabase calls to go live —
  the action signatures were designed as the API surface.

## Supabase (production path)

1. Create a project at https://supabase.com.
2. Run `supabase/schema.sql` in the SQL editor, then `supabase/seed.sql` for sample data.
3. Copy `.env.example` → `.env.local` and fill `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
   (never the service-role key — RLS + service keys belong server-side).

## Important notes

- All patients, doctors and records are fictional. No real medical data is used or transmitted.
- The AI assistant answers **operational** questions only — it never diagnoses, prescribes or advises emergencies.
- Government-scheme (PM-JAY/MJPJAY) sections are architecture demonstrations, not empanelment claims.
- Before a real deployment, review applicable Indian healthcare, privacy (DPDP), tax and medical
  record-retention obligations. No automatic compliance is claimed.
