'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Bookmark, User as UserIcon, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { getUserSavedScholarships } from '@/lib/supabase/client';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, signOut, isConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    // Sync saved count
    const fetchCount = async () => {
      const saved = await getUserSavedScholarships(user?.id || '');
      setSavedCount(saved.length);
    };
    fetchCount();

    const interval = setInterval(fetchCount, 2500);
    return () => clearInterval(interval);
  }, [user]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/check', label: 'Check Eligibility' },
    { href: '/scholarships', label: 'Scholarships' },
    { href: '/dashboard', label: 'Dashboard', badge: savedCount },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm no-print">
      <div className="container-custom h-[72px] flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="ScholarMatch" className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-primary bg-blue-50 font-bold'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                }`}
              >
                {link.label}
                {typeof link.badge === 'number' && link.badge > 0 && (
                  <span className="bg-blue-100 text-primary text-xs px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Admin link */}
          {isAdmin && (
            <Link
              href="/admin"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${
                pathname === '/admin'
                  ? 'text-indigo-700 bg-indigo-50 font-bold'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Admin
            </Link>
          )}
        </nav>

        {/* User Auth Controls & Primary CTA */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                title={user.email}
              >
                <UserIcon className="w-3.5 h-3.5 text-primary" />
                <span className="max-w-[120px] truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs text-slate-500 hover:text-danger p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/login"
                className="font-semibold text-slate-600 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="font-semibold text-primary border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors text-xs"
              >
                Sign Up
              </Link>
            </div>
          )}

          <Link
            href="/check"
            className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all hover:-translate-y-0.5"
          >
            Check Eligibility
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                pathname === link.href ? 'text-primary bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{link.label}</span>
                {typeof link.badge === 'number' && link.badge > 0 && (
                  <span className="bg-blue-100 text-primary text-xs px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50"
            >
              <ShieldCheck className="w-4 h-4" /> Admin Portal
            </Link>
          )}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                <span className="text-xs font-semibold text-slate-700 truncate">{user.email}</span>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-danger font-semibold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-primary border border-blue-200 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
            <Link
              href="/check"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-sm font-semibold text-white bg-primary rounded-lg"
            >
              Check My Eligibility
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
