import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Target,
  Layers,
  ShieldCheck,
  Database,
  Server,
  Cpu,
  CheckCircle2,
  ExternalLink,
  Users,
  Award,
  HelpCircle,
  XCircle,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container-custom py-12 sm:py-16 space-y-14">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-primary border border-blue-200">
          <GraduationCap className="w-3.5 h-3.5" />
          VTU Project-Based Learning (PBL) Synopsis
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Scholarship and Government Scheme Eligibility Checker
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Submitted in partial fulfillment of the requirements for the degree of{' '}
          <strong>Bachelor of Engineering in Artificial Intelligence and Machine Learning</strong>, Visvesvaraya Technological University (VTU), Belgaum.
        </p>
      </div>

      {/* College & Project Credentials Card */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              K.N.S. Institute of Technology, Bangalore
            </h2>
            <p className="text-xs text-slate-500">
              Hegde Nagar, Kogilu Road, Yelahanka Hobli, Bangalore - 560064 • Department of AIML
            </p>
          </div>
          <span className="text-xs font-bold text-primary bg-white border border-blue-200 px-3 py-1 rounded-full shadow-sm">
            Academic Year: 2026–2027
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Members */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" /> Project Team Members
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-slate-900 block font-bold">Basheera</strong>
                <span className="text-slate-500">USN: 1KN25CP006</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-slate-900 block font-bold">Diwakar S</strong>
                <span className="text-slate-500">USN: 1KN25CP011</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-slate-900 block font-bold">Jaishree S</strong>
                <span className="text-slate-500">USN: 1KN25CP016</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-slate-900 block font-bold">Spoorti Salotagi</strong>
                <span className="text-slate-500">USN: 1KN25CP045</span>
              </div>
            </div>
          </div>

          {/* Guide Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" /> Faculty Guidance
            </h3>
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
              <strong className="text-sm text-slate-900 block font-bold">Mrs. Ayesha Noorain</strong>
              <p className="text-xs text-slate-600">
                Assistant Professor, Department of Artificial Intelligence and Machine Learning
              </p>
              <p className="text-xs text-slate-500">
                K.N.S. Institute of Technology, Bangalore
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Abstract & Objectives Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Abstract */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <span className="section-tag">Project Abstract</span>
          <h2 className="text-xl font-bold text-slate-900">
            Simplifying Scheme Discovery for Higher Education
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Scholarships and government welfare schemes play an important role in helping students continue their education by reducing expenses such as tuition fees, examination fees, books, accommodation, and other learning costs. In India, central and state governments provide financial assistance under different schemes based on family income, state of residence, category, and academic performance.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Because information is published across various departmental portals and notifications, students often struggle to identify opportunities suited to their profile. This web-based platform compares student-provided details with a structured scheme database to display potential matches, missing criteria, document checklists, and verified links to official portals.
          </p>
        </div>

        {/* Objectives */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <span className="section-tag">Project Objectives</span>
          <h2 className="text-xl font-bold text-slate-900">Key Deliverables</h2>
          <ul className="text-xs space-y-2.5 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
              <span>Develop a web-based platform for preliminary scholarship &amp; welfare scheme eligibility checking.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
              <span>Collect and maintain structured scheme data, rules, benefits, documents, and verified official links.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
              <span>Allow students to enter academic, financial, and location details through an intuitive form without forced login.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[10px]">4</span>
              <span>Direct students to official portals (NSP, SSP, myScheme) for deadlines, verification, and filing.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[10px]">5</span>
              <span>Design a responsive, student-friendly interface accessible across computers, tablets, and phones.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Block Diagram / System Architecture (Page 6 of Synopsis) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="section-tag bg-blue-50 text-primary border-blue-200">
            <Layers className="w-3.5 h-3.5 inline mr-1" /> System Architecture
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            System Block Diagram &amp; Data Flow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Representing the modules defined in the approved synopsis: Users, Interface, Backend Processing, Scheme Database, and Results Presentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Module 1</span>
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Users className="w-5 h-5" />
            </div>
            <strong className="text-xs text-slate-900 block font-bold">USERS</strong>
            <p className="text-[11px] text-slate-600">Student profile: state, course, year, percentage, income, category.</p>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Module 2</span>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center mx-auto">
              <Layers className="w-5 h-5" />
            </div>
            <strong className="text-xs text-slate-900 block font-bold">USER INTERFACE</strong>
            <p className="text-[11px] text-slate-600">Next.js, React, Tailwind CSS responsive web wizard &amp; filters.</p>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Module 3</span>
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Cpu className="w-5 h-5" />
            </div>
            <strong className="text-xs text-slate-900 block font-bold">BACKEND &amp; ENGINE</strong>
            <p className="text-[11px] text-slate-600">Input validation, rule-based matching engine, missing criteria detection.</p>
          </div>

          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider">Module 4</span>
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <Database className="w-5 h-5" />
            </div>
            <strong className="text-xs text-slate-900 block font-bold">SCHEME DATABASE</strong>
            <p className="text-[11px] text-slate-600">Supabase PostgreSQL: schemes, rules, documents, and updates.</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Module 5</span>
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mx-auto">
              <ExternalLink className="w-5 h-5" />
            </div>
            <strong className="text-xs text-slate-900 block font-bold">RESULTS &amp; LINKS</strong>
            <p className="text-[11px] text-slate-600">Potential matches, missing details, document checklist, official URLs.</p>
          </div>
        </div>
      </div>

      {/* 3-Outcome Rule Engine Classification (Page 3 & 7 of Synopsis) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <span className="section-tag bg-emerald-50 text-emerald-800 border-emerald-200">
            Matching Methodology
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Rule-Based 3-Outcome Classification
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            In accordance with the synopsis methodology, the system avoids arbitrary percentage scores and instead provides deterministic, transparent rule evaluations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <strong className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                1. Potential Match
              </strong>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All known mandatory conditions (domicile, income ceiling, minimum percentage, category, education level) are satisfied based on user inputs. Shortlisted for official verification.
            </p>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <strong className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                2. More Information Needed
              </strong>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Essential profile fields are missing (e.g. unprovided family income, unverified disability status, or unconfirmed grade marks). The system flags these explicitly rather than guessing.
            </p>
          </div>

          <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <strong className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                3. Does Not Appear to Match
              </strong>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              One or more confirmed mandatory conditions failed (e.g. state domicile restriction, income cap exceeded, or marks below cutoff). Explicit reasons are displayed for transparency.
            </p>
          </div>
        </div>
      </div>

      {/* Literature Review Citations (Page 12 of Synopsis) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <span className="section-tag bg-slate-100 text-slate-700 border-slate-200">
            <BookOpen className="w-3.5 h-3.5 inline mr-1" /> Academic References
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Literature Review &amp; Published Research
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            The foundation and methodology of this project build upon the peer-reviewed works cited in the approved synopsis:
          </p>
        </div>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
            <span className="font-bold text-primary flex-shrink-0">[1]</span>
            <div>
              <p className="font-semibold text-slate-900">
                P. Dinesh Kumar &amp; V. S. Harini Sree, &ldquo;A Study on Awareness and Utilisation of Government Education Schemes in Coimbatore District&rdquo;
              </p>
              <p className="text-slate-500 mt-0.5">
                <em>International Journal of Engineering Development and Research (IJEDR)</em>, Volume 14, Issue 1, 2026.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
            <span className="font-bold text-primary flex-shrink-0">[2]</span>
            <div>
              <p className="font-semibold text-slate-900">
                M. Zakhwan &amp; G. Sharmila Sujatha, &ldquo;Gov AI Smart Government Scheme &amp; Exam Finder Using Intelligent Eligibility Filtering&rdquo;
              </p>
              <p className="text-slate-500 mt-0.5">
                <em>International Journal of Advance Research, Ideas and Innovations in Technology (IJARIIT)</em>, Volume 12, Issue 3, 2026.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
            <span className="font-bold text-primary flex-shrink-0">[3]</span>
            <div>
              <p className="font-semibold text-slate-900">
                P. A. Tijare &amp; Vishal D. Bishwas, &ldquo;Scholar Seek: Scholarship Discovery and Eligibility Checker for Indian Students&rdquo;
              </p>
              <p className="text-slate-500 mt-0.5">
                <em>International Research Journal of Modernization in Engineering Technology and Science (IRJMETS)</em>, Volume 08, Issue 04, April 2026.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
            <span className="font-bold text-primary flex-shrink-0">[4]</span>
            <div>
              <p className="font-semibold text-slate-900">
                H. D. Dhore, A. S. Pote, S. D. Amalkar &amp; P. V. Bhambere, &ldquo;National Career Scholarship Portal&rdquo;
              </p>
              <p className="text-slate-500 mt-0.5">
                <em>International Journal of Creative Research Thoughts (IJCRT)</em>, Volume 14, Issue 4, April 2026.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Official Disclaimer */}
      <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
        <strong className="block font-bold">Preliminary Eligibility Disclaimer:</strong>
        <p className="text-slate-700 leading-relaxed">
          ScholarMatch is designed as a student assistance tool for preliminary discovery and shortlisting. It does not promise scholarship approval or claim official status. Current guidelines, application windows, quotas, and final eligibility decisions are governed exclusively by the administering government authorities (NSP, SSP, and respective departments).
        </p>
      </div>
    </div>
  );
}
