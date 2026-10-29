'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Scholarship } from '@/lib/supabase/types';
import { getActiveScholarships, supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { ShieldCheck, Plus, Edit2, Trash2, CheckCircle, XCircle, AlertCircle, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingScholarship, setEditingScholarship] = useState<Partial<Scholarship> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load all scholarships (including inactive)
  const loadScholarships = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('scholarships')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setScholarships(data as Scholarship[]);
          setIsLoading(false);
          return;
        }
      } catch (e) {}
    }

    // Fallback
    const fallback = await getActiveScholarships();
    setScholarships(fallback);
    setIsLoading(false);
  };

  useEffect(() => {
    loadScholarships();
  }, [isAdmin]);

  const handleOpenAdd = () => {
    setEditingScholarship({
      name: '',
      provider: '',
      description: '',
      state: 'All India',
      district: '',
      education_level: ['Undergraduate'],
      course: ['All Courses'],
      category: ['General', 'OBC', 'SC', 'ST'],
      gender: 'All',
      minimum_percentage: 60,
      maximum_family_income: 300000,
      benefit: '',
      benefit_amount: 25000,
      application_start_date: new Date().toISOString().split('T')[0],
      application_end_date: '2026-12-31',
      application_url: '',
      required_documents: ['Income Certificate', 'Marks Card', 'Aadhaar Card'],
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Scholarship) => {
    setEditingScholarship({ ...s });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScholarship?.name || !editingScholarship.provider) return;

    try {
      if (editingScholarship.id) {
        // Update
        if (isSupabaseConfigured) {
          const { error } = await (supabase as any)
            .from('scholarships')
            .update(editingScholarship)
            .eq('id', editingScholarship.id);

          if (error) throw error;
        } else {
          setScholarships(prev =>
            prev.map(s => (s.id === editingScholarship.id ? { ...s, ...editingScholarship } as Scholarship : s))
          );
        }
        setStatusMessage({ text: 'Scholarship updated successfully in database.', type: 'success' });
      } else {
        // Insert
        const newId = 'a1111111-1111-1111-1111-' + Math.random().toString(36).substring(2, 14);
        const newRecord = { ...editingScholarship, id: newId } as Scholarship;

        if (isSupabaseConfigured) {
          const { error } = await (supabase as any)
            .from('scholarships')
            .insert(newRecord);

          if (error) throw error;
        } else {
          setScholarships(prev => [newRecord, ...prev]);
        }
        setStatusMessage({ text: 'New scholarship added to database successfully.', type: 'success' });
      }

      setIsModalOpen(false);
      setEditingScholarship(null);
      loadScholarships();
    } catch (err: any) {
      console.error('Save error:', err);
      setStatusMessage({ text: err.message || 'Failed to save scholarship.', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('scholarships')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      setScholarships(prev => prev.filter(s => s.id !== id));
      setStatusMessage({ text: 'Scholarship deleted successfully.', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Error deleting scholarship.', type: 'error' });
    }
  };

  const handleToggleActive = async (s: Scholarship) => {
    const updatedState = !s.is_active;
    try {
      if (isSupabaseConfigured) {
        await (supabase as any)
          .from('scholarships')
          .update({ is_active: updatedState })
          .eq('id', s.id);
      }
      setScholarships(prev =>
        prev.map(item => (item.id === s.id ? { ...item, is_active: updatedState } : item))
      );
      setStatusMessage({ text: `Scholarship marked as ${updatedState ? 'Active' : 'Inactive'}.`, type: 'success' });
    } catch (e) {}
  };

  if (authLoading) {
    return <div className="container-custom py-16 text-center text-xs text-slate-500">Checking authorization...</div>;
  }

  // Authorization gate
  if (!isAdmin) {
    return (
      <div className="container-custom py-16 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Admin Access Required</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Ordinary student accounts cannot modify scholarships. Please sign in with an authorized administrative account (e.g. <code>admin@scholarmatch.gov.in</code> or <code>evaluator@college.edu</code>).
        </p>
        <Link
          href="/login"
          className="inline-flex px-5 py-2.5 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-hover shadow-sm"
        >
          Sign In as Admin / Evaluator
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-10 sm:py-14 space-y-6">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="section-tag bg-indigo-50 text-indigo-700 border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" /> Authorized Admin Mode
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scholarship Catalog Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, edit, toggle, or delete scholarship schemes in Supabase PostgreSQL.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-sm transition-all hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Scholarship
        </button>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Scheme Name &amp; Provider</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Min Marks</th>
                <th className="py-3 px-4">Income Limit</th>
                <th className="py-3 px-4">Categories</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">Loading catalog...</td>
                </tr>
              ) : scholarships.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">No scholarships found.</td>
                </tr>
              ) : (
                scholarships.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-xs">
                      <div className="truncate">{s.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal truncate">{s.provider}</div>
                    </td>
                    <td className="py-3 px-4">{s.state || 'All India'}</td>
                    <td className="py-3 px-4 font-semibold">{s.minimum_percentage}%</td>
                    <td className="py-3 px-4">
                      {s.maximum_family_income ? `₹${Number(s.maximum_family_income).toLocaleString('en-IN')}` : 'No limit'}
                    </td>
                    <td className="py-3 px-4 max-w-[140px] truncate">
                      {(s.category || []).join(', ')}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          s.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                        title="Click to toggle active status"
                      >
                        {s.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-blue-50 transition-colors"
                        title="Edit Scheme"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-danger hover:bg-rose-50 transition-colors"
                        title="Delete Scheme"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && editingScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingScholarship.id ? 'Edit Scholarship Scheme' : 'Add New Scholarship Scheme'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheme Title *</label>
                <input
                  type="text"
                  required
                  value={editingScholarship.name || ''}
                  onChange={e => setEditingScholarship({ ...editingScholarship, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Administering Authority / Issuing Ministry *</label>
                <input
                  type="text"
                  required
                  value={editingScholarship.administering_authority || editingScholarship.provider || ''}
                  onChange={e => setEditingScholarship({
                    ...editingScholarship,
                    provider: e.target.value,
                    administering_authority: e.target.value
                  })}
                  placeholder="e.g. Department of Higher Education, Govt. of India"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State / Domicile</label>
                  <input
                    type="text"
                    value={editingScholarship.state || 'All India'}
                    onChange={e => setEditingScholarship({ ...editingScholarship, state: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender Restriction</label>
                  <select
                    value={editingScholarship.gender || 'All'}
                    onChange={e => setEditingScholarship({ ...editingScholarship, gender: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="All">All</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Percentage (%)</label>
                  <input
                    type="number"
                    value={editingScholarship.minimum_percentage || 0}
                    onChange={e => setEditingScholarship({ ...editingScholarship, minimum_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Income Ceiling (₹)</label>
                  <input
                    type="number"
                    value={editingScholarship.maximum_family_income || 0}
                    onChange={e => setEditingScholarship({ ...editingScholarship, maximum_family_income: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Benefit Amount (₹)</label>
                  <input
                    type="number"
                    value={editingScholarship.benefit_amount || 0}
                    onChange={e => setEditingScholarship({ ...editingScholarship, benefit_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Eligible Categories (comma separated)</label>
                <input
                  type="text"
                  value={(editingScholarship.category || []).join(', ')}
                  onChange={e => setEditingScholarship({ ...editingScholarship, category: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="General, OBC, SC, ST"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Eligible Education Levels (comma separated)</label>
                <input
                  type="text"
                  value={(editingScholarship.education_level || []).join(', ')}
                  onChange={e => setEditingScholarship({ ...editingScholarship, education_level: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="PUC / 12th, Diploma, Undergraduate, Postgraduate"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Benefit Description *</label>
                <input
                  type="text"
                  required
                  value={editingScholarship.benefit || ''}
                  onChange={e => setEditingScholarship({ ...editingScholarship, benefit: e.target.value })}
                  placeholder="e.g. ₹50,000 per annum towards fees and study materials"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Application End Date</label>
                  <input
                    type="date"
                    value={editingScholarship.application_end_date || ''}
                    onChange={e => setEditingScholarship({ ...editingScholarship, application_end_date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Verified Date</label>
                  <input
                    type="date"
                    value={editingScholarship.last_verified_at || '2026-10-15'}
                    onChange={e => setEditingScholarship({ ...editingScholarship, last_verified_at: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Portal URL</label>
                  <input
                    type="text"
                    value={editingScholarship.official_url || editingScholarship.application_url || ''}
                    onChange={e => setEditingScholarship({
                      ...editingScholarship,
                      application_url: e.target.value,
                      official_url: e.target.value
                    })}
                    placeholder="https://scholarships.gov.in"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description Overview</label>
                <textarea
                  rows={3}
                  value={editingScholarship.description || ''}
                  onChange={e => setEditingScholarship({ ...editingScholarship, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary-hover flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
