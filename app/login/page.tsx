'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { LogIn, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Invalid login credentials.');
    } else {
      router.push('/dashboard');
    }
  };

  const fillQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPass123!');
  };

  return (
    <div className="container-custom py-16 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Login</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your saved scholarships, synced profile, and application reminders.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@example.com"
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-all disabled:opacity-75"
          >
            {isLoading ? 'Signing In...' : 'Sign In to ScholarMatch'}
          </button>
        </form>

        {/* Demo Accounts Helper */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="font-bold block mb-2 text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Demo Credentials:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('student@scholarmatch.gov.in')}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 hover:bg-slate-100 truncate text-left"
            >
              Student: student@scholarmatch.gov.in
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('admin@scholarmatch.gov.in')}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded text-indigo-700 hover:bg-slate-100 truncate text-left font-bold"
            >
              Admin: admin@scholarmatch.gov.in
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Sign up here
          </Link>
        </div>

        <div className="mt-2 text-center text-xs text-slate-400">
          <Link href="/check" className="hover:underline">
            Or continue checking eligibility as Guest &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
