'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'Eligibility Query',
    message: '',
  });

  const [ticketId, setTicketId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const generated = 'SM-' + Math.floor(100000 + Math.random() * 900000);
      setTicketId(generated);
      setIsSubmitting(false);
      setFormData({ name: '', email: '', topic: 'Eligibility Query', message: '' });
    }, 600);
  };

  return (
    <div className="container-custom py-12 sm:py-16 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="section-tag">Student Helpdesk</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Contact &amp; Assistance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have an inquiry regarding eligibility criteria, required documents, or technical issues? Send our team a message.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Submit an Inquiry</h2>
          <p className="text-xs text-slate-500 mb-6">Our student support desk usually responds within 24-48 hours.</p>

          {ticketId && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-emerald-900">
                  Inquiry Ticket Registered (#{ticketId})
                </strong>
                <span>
                  Thank you! Your inquiry has been logged in our helpdesk system. We will follow up via your email shortly.
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Student Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Gowda"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. rahul@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Topic / Query Category</label>
              <select
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                <option value="Eligibility Query">Eligibility Criteria Clarification</option>
                <option value="Income/Caste Certificate">Income / Caste Certificate Question</option>
                <option value="Application Technical Issue">Application Technical Issue</option>
                <option value="Scheme Information Correction">Scheme Information Update Suggestion</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Message *</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please describe your question or issue in detail..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-75"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending Inquiry...' : 'Submit Inquiry'}
            </button>
          </form>
        </div>

        {/* FAQ Accordion */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <details className="bg-white p-4 rounded-xl border border-slate-200 group" open>
              <summary className="font-bold text-slate-800 cursor-pointer list-none flex items-center justify-between">
                <span>What is an RD Number on Karnataka/Maharashtra certificates?</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                An RD (Revenue Department) number is a 15-character electronic barcode reference issued by state revenue offices (e.g. Nadakacheri in Karnataka, MahaDBT in Maharashtra). It allows government portals to fetch verified caste and income certificates directly without requiring physical attestation.
              </p>
            </details>

            <details className="bg-white p-4 rounded-xl border border-slate-200 group">
              <summary className="font-bold text-slate-800 cursor-pointer list-none flex items-center justify-between">
                <span>Why is Aadhaar Bank Seeding (NPCI Mapping) mandatory?</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                All Central and State welfare scholarships disburse grants exclusively through Direct Benefit Transfer (DBT) directly into the student&apos;s active bank account via the NPCI Aadhaar payment bridge to prevent fraud and middlemen.
              </p>
            </details>

            <details className="bg-white p-4 rounded-xl border border-slate-200 group">
              <summary className="font-bold text-slate-800 cursor-pointer list-none flex items-center justify-between">
                <span>Can a student avail of multiple scholarships simultaneously?</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                As per standard Ministry of Education bylaws, students may generally receive only one government tuition fee scholarship for a given academic year. However, certain merit incentive rewards or private corporate CSR grants can be availed concurrently if scheme rules permit.
              </p>
            </details>

            <details className="bg-white p-4 rounded-xl border border-slate-200 group">
              <summary className="font-bold text-slate-800 cursor-pointer list-none flex items-center justify-between">
                <span>Do I need to sign up to check my scholarship eligibility?</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                No! The eligibility checker is 100% free and open for guest students. You only need to create a free account if you wish to bookmark scholarships and sync your profile to the cloud across devices.
              </p>
            </details>
          </div>
        </div>

      </div>
    </div>
  );
}
