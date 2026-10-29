'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Registration failed. Please check your details.');
    } else {
      setSuccessMsg('Account created successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    }
  };

  return (
    <div className="container-custom py-16 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Student Account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Free forever. Save matched scholarships and sync your profile.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Student Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Gowda"
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@example.com"
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
              placeholder="At least 6 characters"
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-all disabled:opacity-75"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up Free'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Log in here
          </Link>
        </div>

        <div className="mt-2 text-center text-xs text-slate-400">
          <Link href="/check" className="hover:underline">
            Or skip login and check eligibility directly &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
