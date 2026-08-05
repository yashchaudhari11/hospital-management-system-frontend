import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartPulse, ClipboardCheck, Clock } from 'lucide-react';

const Landing = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-teal-700" />
            <span className="text-teal-700 font-semibold tracking-wider uppercase text-sm">ST. JUDE HOSPITAL</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Sign In</Link>
            <Link to="/register" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-teal-700 text-white hover:bg-teal-800 transition-colors">Register</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-20 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Calm, Professional Care You Can Trust
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
            Saint Jude Memorial Hospital offers a patient-centric, clinical approach to diagnostic and surgical procedures. Register online to book appointments, review laboratory results, and manage your prescriptions.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/register" className="px-5 py-3 rounded-md text-sm font-medium bg-teal-700 text-white hover:bg-teal-800 transition-colors">Create Patient Account</Link>
            <Link to="/login" className="text-sm font-semibold leading-6 text-slate-900">Access Portal <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-md border border-slate-200 shadow-xs">
            <ShieldCheck className="h-8 w-8 text-teal-700 mb-4" />
            <h3 className="text-base font-semibold text-slate-950">Accredited Experts</h3>
            <p className="mt-2 text-sm text-slate-600">
              Our clinical roster includes board-certified surgeons and specialists committed to safe, clinical care procedures.
            </p>
          </div>

          <div className="bg-white p-6 rounded-md border border-slate-200 shadow-xs">
            <ClipboardCheck className="h-8 w-8 text-teal-700 mb-4" />
            <h3 className="text-base font-semibold text-slate-950">Unified Medical Records</h3>
            <p className="mt-2 text-sm text-slate-600">
              Access your medical record timeline, clinical diagnostic notes, prescriptions, and lab test results securely online.
            </p>
          </div>

          <div className="bg-white p-6 rounded-md border border-slate-200 shadow-xs">
            <Clock className="h-8 w-8 text-teal-700 mb-4" />
            <h3 className="text-base font-semibold text-slate-950">Efficient Management</h3>
            <p className="mt-2 text-sm text-slate-600">
              Schedule visits, receive automatic doctor assignments, and track prescription dispensing without administrative delays.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="bg-white border-t border-slate-200 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Clinical Departments & Specialties</h2>
            <p className="mt-4 text-sm text-slate-600">
              We provide clinical expertise across specialized units with modern laboratory and pharmacy support facilities.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 border border-slate-150 rounded-md bg-slate-50">
              <span className="font-semibold text-slate-800 text-sm">Cardiology</span>
            </div>
            <div className="p-4 border border-slate-150 rounded-md bg-slate-50">
              <span className="font-semibold text-slate-800 text-sm">Pediatrics</span>
            </div>
            <div className="p-4 border border-slate-150 rounded-md bg-slate-50">
              <span className="font-semibold text-slate-800 text-sm">Orthopedics</span>
            </div>
            <div className="p-4 border border-slate-150 rounded-md bg-slate-50">
              <span className="font-semibold text-slate-800 text-sm">General Medicine</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-teal-500" />
            <span className="text-white font-semibold text-xs tracking-wider uppercase">ST. JUDE HOSPITAL</span>
          </div>
          <span className="text-xs">© 2026 Saint Jude Memorial Hospital. All clinical rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
