import React from 'react';
import Link from 'next/link';
import { getActiveScholarships } from '@/lib/supabase/client';
import ScholarshipCard from '@/components/ScholarshipCard';
import {
  ArrowRight,
  CheckCircle,
  Search,
  Target,
  Clock,
  Layers,
  GraduationCap,
  ShieldCheck,
  FileText,
  ExternalLink,
  Building2,
  Sparkles,
} from 'lucide-react';

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  const scholarships = await getActiveScholarships();
  const featured = scholarships.slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 pb-14 bg-gradient-to-b from-blue-50/70 via-slate-50 to-white border-b border-slate-200">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white border border-blue-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>VTU AIML Project-Based Learning • Verified Scheme Records</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Scholarship and Government Scheme{' '}
              <span className="text-accent underline decoration-blue-300">Eligibility Checker</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              A centralized web platform that helps students identify scholarship and welfare opportunities by comparing personal, academic, and financial details against published scheme rules.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/check"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm sm:text-base font-bold px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <CheckCircle className="w-5 h-5" />
                Check Eligibility
              </Link>

              <Link
                href="/scholarships"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-sm sm:text-base font-semibold px-6 py-3.5 rounded-xl shadow-sm hover:shadow transition-all"
              >
                <Search className="w-4 h-4 text-slate-500" />
                Browse Schemes
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200 text-slate-800">
              <div>
                <span className="text-2xl font-extrabold text-slate-900 block">{scholarships.length}+</span>
                <span className="text-xs text-slate-500 font-medium">Curated Schemes</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-emerald-700 block">3 Portals</span>
                <span className="text-xs text-slate-500 font-medium">NSP • SSP • myScheme</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-primary block">Rule-Based</span>
                <span className="text-xs text-slate-500 font-medium">Explicit Filtering</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 block">100% Free</span>
                <span className="text-xs text-slate-500 font-medium">No Login Needed</span>
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-illustration.svg"
              alt="ScholarMatch Eligibility Checker Overview"
              className="w-full max-w-md h-auto drop-shadow-xl rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* The Problem & Solution (Directly from Synopsis) */}
      <section className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="section-tag bg-rose-50 text-rose-800 border-rose-200">Problem Statement</span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-2 mb-3">
                Scattered Information &amp; Missed Deadlines
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Students often miss out on government financial assistance because criteria, required documents, and notifications are distributed across multiple disconnected state and central portals.
              </p>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Uncertainty about annual family income caps and category reservation quotas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Lengthy circulars with unclear document checklists.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Time lost searching individual department websites.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="section-tag bg-emerald-50 text-emerald-800 border-emerald-200">The Proposed Solution</span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-2 mb-3">
                Rule-Based Preliminary Matching
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                ScholarMatch provides an intuitive interface that evaluates your academic level, marks, family income, and state domicile against structured scheme requirements, giving clear, preliminary classifications.
              </p>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Potential Matches:</strong> Known criteria met with explicit condition breakdowns.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">?</span>
                  <span><strong>More Info Needed:</strong> Identifies unentered details or conditions needing verification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">↗</span>
                  <span><strong>Official Portals:</strong> Direct verified links to NSP and Karnataka SSP for application.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Four Simple Steps (Synopsis User Workflow) */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-14">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="section-tag">System Methodology</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              How the Eligibility Checker Works
            </h2>
            <p className="text-sm text-slate-600">
              The four-step workflow connecting students to verified official opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Enter Profile Details',
                desc: 'Enter state of residence, education level, marks percentage, and family income range.',
              },
              {
                step: '02',
                title: 'Compare Eligibility',
                desc: 'The rule engine evaluates your inputs against scheme-specific mandatory conditions.',
              },
              {
                step: '03',
                title: 'View Potential Matches',
                desc: 'Review shortlisted schemes categorized into Potential Match, Needs Info, or Unmatched.',
              },
              {
                step: '04',
                title: 'Visit Official Portal',
                desc: 'Access verified government portals (NSP, SSP, myScheme) for final guidelines and filing.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm relative hover:-translate-y-1 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-primary font-extrabold text-sm flex items-center justify-center mx-auto mb-3 border border-blue-200">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Schemes Preview */}
      <section className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="section-tag">Database Catalog</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Selected Verified Schemes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active government records stored in Supabase with verified official source links.
            </p>
          </div>
          <Link
            href="/scholarships"
            className="text-xs sm:text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 self-start sm:self-auto"
          >
            Browse All Schemes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featured.map((scholarship) => (
            <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
          ))}
        </div>
      </section>

      {/* Official Sources Reference Strip */}
      <section className="container-custom">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Verified Government Portals Referenced
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Authoritative Sources Stored in Database
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="https://scholarships.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/50 transition-all flex items-center justify-between group"
            >
              <div>
                <strong className="text-xs font-bold text-slate-900 block">National Scholarship Portal (NSP)</strong>
                <span className="text-[11px] text-slate-500">Government of India Central Schemes</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            </a>

            <a
              href="https://ssp.postmatric.karnataka.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/50 transition-all flex items-center justify-between group"
            >
              <div>
                <strong className="text-xs font-bold text-slate-900 block">Karnataka SSP Post-Matric</strong>
                <span className="text-[11px] text-slate-500">State Scholarship Portal, Karnataka</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            </a>

            <a
              href="https://www.myscheme.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/50 transition-all flex items-center justify-between group"
            >
              <div>
                <strong className="text-xs font-bold text-slate-900 block">myScheme Platform</strong>
                <span className="text-[11px] text-slate-500">National Welfare Discovery Portal</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container-custom">
        <div className="bg-gradient-to-r from-blue-900 via-primary to-blue-800 text-white rounded-2xl p-8 sm:p-12 text-center shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Check Your Eligibility in 2 Minutes
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto mb-6">
            Enter your basic academic, location, and family income details or try our one-click sample profiles. No account registration required.
          </p>
          <Link
            href="/check"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-primary text-sm sm:text-base font-bold px-7 py-3.5 rounded-xl shadow-md transition-all hover:scale-105"
          >
            Start Eligibility Check →
          </Link>
        </div>
      </section>
    </div>
  );
}
