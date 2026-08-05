import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Users, Stethoscope, AlertTriangle, CalendarRange, Clock, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/users/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        toast.error('Failed to load system overview statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Hospital Administration Workspace</h2>
        <p className="text-xs text-slate-500 mt-1">Real-time stats dashboard tracking clinical attendance, inventory status, and rosters.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Patients</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{stats?.totalPatients}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Self-registered charts</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-800 rounded-full">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Physicians</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{stats?.totalDoctors}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Attending specialist profiles</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-800 rounded-full">
              <Stethoscope className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointments Today</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{stats?.appointmentsToday}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Visits scheduled for today</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-800 rounded-full">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock Medicines</p>
              <h3 className={`text-2xl font-bold mt-2 ${stats?.lowStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {stats?.lowStockCount}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Awaiting inventory restock</p>
            </div>
            <div className={`p-3 rounded-full ${stats?.lowStockCount > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Clinical Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-4">
            <p className="text-slate-600">Review total appointment statuses processed through the clinic workflow:</p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="bg-slate-50 p-3 rounded border border-slate-150">
                <span className="text-[10px] text-slate-450 uppercase block font-medium">Total Booked</span>
                <span className="text-lg font-bold text-slate-800">{stats?.appointmentsCount}</span>
              </div>
              <div className="bg-amber-50/40 p-3 rounded border border-amber-100">
                <span className="text-[10px] text-amber-700 uppercase block font-medium">Awaiting Doc</span>
                <span className="text-lg font-bold text-amber-700">{stats?.pendingAssignment}</span>
              </div>
              <div className="bg-orange-50/40 p-3 rounded border border-orange-100">
                <span className="text-[10px] text-orange-700 uppercase block font-medium">Awaiting Appr</span>
                <span className="text-lg font-bold text-orange-700">{stats?.pendingApproval}</span>
              </div>
              <div className="bg-green-50/40 p-3 rounded border border-green-100">
                <span className="text-[10px] text-green-700 uppercase block font-medium">Scheduled</span>
                <span className="text-lg font-bold text-green-700">{stats?.approved}</span>
              </div>
              <div className="bg-emerald-50/40 p-3 rounded border border-emerald-100">
                <span className="text-[10px] text-emerald-700 uppercase block font-medium">Completed</span>
                <span className="text-lg font-bold text-emerald-700">{stats?.completed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attending Staff Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-3">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Attending Physicians</span>
              <span className="font-semibold text-slate-800">{stats?.totalDoctors}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Total Support Staff</span>
              <span className="font-semibold text-slate-800">{stats?.totalStaff}</span>
            </div>
            <p className="text-[10px] text-slate-400 italic">Support staff includes front-desk coordinators, laboratory technicians, and pharmacists.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;
