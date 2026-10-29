# Scholarship and Government Scheme Eligibility Checker (ScholarMatch)

> **VTU Project-Based Learning (PBL) — Academic Year 2026–2027**  
> **Degree:** Bachelor of Engineering in Artificial Intelligence and Machine Learning (AIML)  
> **Institution:** K.N.S. Institute of Technology, Bangalore (Affiliated to Visvesvaraya Technological University, Belgaum)  
> **Guide:** Mrs. Ayesha Noorain, Asst. Prof, Dept. of AIML, K.N.S.I.T.  
> **Project Team:**
> - Basheera (`1KN25CP006`)
> - Diwakar S (`1KN25CP011`)
> - Jaishree S (`1KN25CP016`)
> - Spoorti Salotagi (`1KN25CP045`)

---

## 📌 Project Overview

Scholarships and government welfare schemes play an important role in helping students continue their education by reducing expenses such as tuition fees, examination fees, books, accommodation, and other learning costs. In India, central and state governments provide financial assistance under diverse schemes. However, because information is distributed across disconnected state and central portals, gazettes, and notifications, students often struggle to identify schemes relevant to their circumstances.

**ScholarMatch** is a web-based preliminary eligibility checker that compares student profile details against published government scheme rules and directs students to official portals for verification and application.

---

## 🌟 Key Features & Synopsis Alignment

1. **Rule-Based 3-Outcome Classification Engine (`lib/eligibilityEngine.ts`)**
   - Strictly conforms to the approved synopsis methodology:
     - 🟢 **Potential Match (`potential_match`):** All known applicable criteria (domicile, income ceiling, percentage, category, education level) are satisfied based on user inputs.
     - 🟡 **More Information Needed (`more_info_needed`):** Essential criteria are missing or unverified (e.g., student did not provide income, marks, or disability status).
     - 🔴 **Does Not Appear to Match (`does_not_match`):** One or more confirmed mandatory conditions failed.
   - Treats missing details as requiring verification rather than assuming eligibility.
   - Eliminates arbitrary or fabricated percentage scores.

2. **Supabase PostgreSQL Database (`supabase/schema.sql`)**
   - Implements the exact relational schema defined in Page 8 of the approved synopsis:
     - **`schemes` (`scholarships`):** Scheme ID, scheme name, administering authority, summary, benefit details, official URL, source URL, last-verified date, application deadline.
     - **`eligibility_rules`:** Rule ID, scheme ID, criterion type, condition / operator (`lte`, `gte`, `eq`, `in`, `contains`), comparison value, and mandatory/optional status (`is_mandatory`).
     - **`required_documents`:** Document ID, scheme ID, document name, mandatory flag, and notes.
     - **`scheme_updates`:** Update ID, scheme ID, source URL, last-verified date, and update notes.
     - **`student_profiles`:** Profile ID, education level, year of study, state, income range, percentage, category, certificates, disability status.
     - **`admin_users`:** Admin ID, username, email, and role.
     - **`saved_scholarships`:** Student bookmark management.
   - **Row Level Security (RLS):** Fully enabled. Public users can query active schemes; private student profiles and saved bookmarks are isolated to authenticated users; administrative functions are restricted to authorized administrators.

3. **Anonymous / Guest Checking**
   - Students can check their eligibility immediately **without creating an account or logging in**.
   - Login via Supabase Auth is strictly optional for saving bookmarks and syncing profiles across devices.

4. **Verified Government Source Links**
   - Direct attribution to official administering authorities (Department of Higher Education, Ministry of Social Justice & Empowerment, Karnataka Backward Classes Welfare Dept, AICTE).
   - Authoritative official links:
     - **National Scholarship Portal (NSP):** `https://scholarships.gov.in`
     - **Karnataka State Scholarship Portal (SSP):** `https://ssp.postmatric.karnataka.gov.in`
     - **myScheme Platform:** `https://www.myscheme.gov.in`
   - Every scheme displays its official administering authority and `last_verified_at` timestamp.

5. **Administrator Dashboard (`/admin`)**
   - Authorized admins can manage schemes, update circular information, review required documents, and refresh `last_verified_at` dates.

---

## 🏗️ System Architecture & Workflow

```
[USERS]
Student profile: state, course, year, percentage, income, category
         │
         ▼
[USER INTERFACE]
Next.js 14, React 18, TypeScript, Tailwind CSS responsive web pages
         │
         ▼
[BACKEND APPLICATION]
API routes, input validation, rule-based matching engine
         │
         ▼
[SCHEME DATABASE]
Supabase PostgreSQL: schemes, eligibility_rules, required_documents, scheme_updates
         │
         ▼
[RESULTS AND OFFICIAL LINKS]
Potential matches, missing details, criteria summary, document checklist, official portals (NSP/SSP)
```

### The 4-Step Student Workflow
1. **01 Enter Profile Details:** Provide state of residence, education level, course stream, marks percentage, and family income range.
2. **02 Compare Eligibility:** The rule engine evaluates your inputs against scheme-specific mandatory conditions.
3. **03 View Potential Matches:** Review shortlisted schemes categorized into Potential Match, Needs Info, or Unmatched.
4. **04 Visit Official Portal:** Access verified government portals (NSP, SSP, myScheme) for final guidelines and application filing.

---

## 📚 Literature Review References (Page 12 of Synopsis)

1. **P. Dinesh Kumar & V. S. Harini Sree**, *"A Study on Awareness and Utilisation of Government Education Schemes in Coimbatore District"*, International Journal of Engineering Development and Research (IJEDR), Volume 14, Issue 1, 2026.
2. **M. Zakhwan & G. Sharmila Sujatha**, *"Gov AI Smart Government Scheme & Exam Finder Using Intelligent Eligibility Filtering"*, International Journal of Advance Research, Ideas and Innovations in Technology (IJARIIT), Volume 12, Issue 3, 2026.
3. **P. A. Tijare & Vishal D. Bishwas**, *"Scholar Seek: Scholarship Discovery and Eligibility Checker for Indian Students"*, International Research Journal of Modernization in Engineering Technology and Science (IRJMETS), Volume 08, Issue 04, April 2026.
4. **H. D. Dhore, A. S. Pote, S. D. Amalkar & P. V. Bhambere**, *"National Career Scholarship Portal"*, International Journal of Creative Research Thoughts (IJCRT), Volume 14, Issue 4, April 2026.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18.17+ or v20.x recommended)
- npm (v9+ or v10+)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/spoorti-salotagi/scholar-match.git
cd scholar-match

# Install dependencies
npm install
```

### 2. Environment Variables (`.env.local`)
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
*(If Supabase credentials are not provided initially, the application automatically runs in standalone local mode with verified seed data).*

### 3. Database Setup (Supabase)
1. Open your Supabase Project dashboard.
2. Go to the **SQL Editor**.
3. Run `supabase/schema.sql` to create all tables, indexes, and Row Level Security policies.
4. Run `supabase/seed.sql` to populate benchmark Central and State government schemes.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 📄 License & Disclaimer

This project is submitted in partial fulfillment of the academic requirements for Bachelor of Engineering in Artificial Intelligence and Machine Learning at Visvesvaraya Technological University (VTU) Belgaum, K.N.S. Institute of Technology, Bangalore.

**Statutory Notice:** ScholarMatch is a preliminary decision support tool. It does not promise scholarship approval or claim official status. All eligibility guidelines and application deadlines must be confirmed with the official scholarship or government portal (e.g., National Scholarship Portal, Karnataka State Scholarship Portal) before submitting applications.
