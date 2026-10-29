import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-14 pb-8 mt-auto border-t border-slate-800 no-print">
      <div className="container-custom">
        {/* Statutory Disclaimer Box */}
        <div className="bg-slate-800/80 border-l-4 border-accent p-4 rounded-md text-xs leading-relaxed text-slate-300 mb-10">
          <strong className="text-white block mb-1">⚠️ Preliminary Screening Notice:</strong>
          ScholarMatch is a preliminary decision support platform designed to assist students in discovering scholarship opportunities. Results are indicative only and do not promise scholarship approval or claim official status. Students must check current circulars, quotas, and deadlines on official portals (National Scholarship Portal, Karnataka State Scholarship Portal, or myScheme) before submitting actual applications.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div>
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="ScholarMatch" className="h-9 brightness-0 invert" />
            </div>
            <p className="text-xs leading-relaxed text-slate-400 mb-4">
              Find the scholarships and government welfare schemes you are eligible for. Transparent, fast, and student-focused.
            </p>
            <div className="inline-block bg-slate-800 px-2.5 py-1 rounded text-[11px] font-medium text-slate-400">
              VTU Project-Based Learning • KNSIT AIML 2026–2027
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">Portal Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/check" className="hover:text-white transition-colors">Check Eligibility</Link></li>
              <li><Link href="/scholarships" className="hover:text-white transition-colors">Scholarships Directory</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Key Welfare Schemes */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">Key Schemes Covered</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/scholarships" className="hover:text-white transition-colors">Central Sector Scheme</Link></li>
              <li><Link href="/scholarships" className="hover:text-white transition-colors">Post-Matric SC/ST Welfare</Link></li>
              <li><Link href="/scholarships" className="hover:text-white transition-colors">State OBC Concessions</Link></li>
              <li><Link href="/scholarships" className="hover:text-white transition-colors">AICTE Pragati (For Girls)</Link></li>
              <li><Link href="/scholarships" className="hover:text-white transition-colors">Minority Welfare Scholarships</Link></li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">Engineering Architecture</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-white transition-colors">System Architecture &amp; RLS</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Rule-Based 3-Outcome Engine</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Student Support &amp; FAQ</Link></li>
              <li><span className="text-slate-500">Supabase PostgreSQL + Vercel</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            &copy; 2026 ScholarMatch. All rights reserved. Open for academic demonstration.
          </div>
          <div>
            Built with Next.js, TypeScript, Tailwind CSS &amp; Supabase
          </div>
        </div>
      </div>
    </footer>
  );
}
