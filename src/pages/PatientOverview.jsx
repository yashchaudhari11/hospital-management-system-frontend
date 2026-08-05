import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Calendar, FileText, Activity, ArrowRight, UserPlus, HeartPulse } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PatientOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/patients/history');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        toast.error('Failed to fetch patient records');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const timeline = data?.timeline || [];
  const appointments = timeline.filter(item => item.type === 'appointment');
  const upcomingApt = appointments.find(apt => 
    apt.details.status === 'approved' || apt.details.status === 'pending_approval' || apt.details.status === 'pending_assignment'
  );
  
  const recentPrescriptions = timeline.filter(item => item.type === 'prescription');
  const recentReports = timeline.filter(item => item.type === 'lab_report');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Welcome, {data?.patient?.name}</h2>
          <p className="text-xs text-slate-500 mt-1">St. Jude Medical Record Number: <span className="font-mono text-slate-700 font-medium">{data?.patient?._id}</span></p>
        </div>
        <Link to="/patient/book" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-teal-700 text-white hover:bg-teal-800 transition-colors">
          <Calendar className="mr-2 h-4 w-4" /> Book New Appointment
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Consultations</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{appointments.length}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Total recorded bookings</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-800 rounded-full">
              <Calendar className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Prescriptions</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                {recentPrescriptions.filter(rx => rx.details.status === 'pending').length}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Awaiting pharmacy pick up</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-full">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Diagnostic Lab Reports</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{recentReports.length}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Processed results</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-800 rounded-full">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next/Upcoming Appointment */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Medical Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingApt ? (
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-md">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Scheduled Date</p>
                      <h4 className="text-sm font-semibold text-slate-800 mt-1">
                        {new Date(upcomingApt.details.preferredDate).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </h4>
                      <p className="text-xs text-slate-500 mt-3"><span className="font-semibold text-slate-600">Assigned Doctor:</span> {upcomingApt.details.doctorName}</p>
                      <p className="text-xs text-slate-500 mt-1"><span className="font-semibold text-slate-600">Reported Symptoms:</span> "{upcomingApt.details.symptoms}"</p>
                    </div>
                    <Badge status={upcomingApt.details.status}>{upcomingApt.details.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  No upcoming consultations scheduled. Need medical advice?
                  <div className="mt-3">
                    <Link to="/patient/book" className="inline-flex items-center text-teal-700 font-semibold hover:text-teal-900 text-xs">
                      Book a consultation now <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Timeline Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Recent Care Timeline</CardTitle>
              <Link to="/patient/timeline" className="text-xs font-semibold text-teal-700 hover:text-teal-950 hover:underline flex items-center">
                Full Record <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {timeline.length > 1 ? (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {timeline.slice(0, 3).map((event, eventIdx) => (
                      <li key={event.id}>
                        <div className="relative pb-8">
                          {eventIdx !== 2 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center ring-8 ring-white font-bold text-xs">
                                {event.type.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5">
                              <p className="text-xs font-semibold text-slate-900">{event.title}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-center py-6 text-slate-500 text-xs">Only registration recorded. Use book actions to schedule visits.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Card Summary & Allergies */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-medium">Allergies Warning</span>
                <p className={`font-semibold mt-1 ${data?.profile?.allergies ? 'text-red-600' : 'text-slate-700'}`}>
                  {data?.profile?.allergies || 'No allergies recorded'}
                </p>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-medium">Blood Group</span>
                <p className="font-semibold text-slate-800 mt-1">
                  {data?.profile?.bloodGroup || 'Not set'}
                </p>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-medium">Emergency Contact</span>
                {data?.profile?.emergencyContact ? (
                  <div className="mt-1 space-y-0.5 text-slate-700">
                    <p className="font-semibold">{data.profile.emergencyContact.name} ({data.profile.emergencyContact.relationship})</p>
                    <p>Phone: {data.profile.emergencyContact.phone}</p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic mt-1">No emergency contact configured</p>
                )}
              </div>
              <div>
                <Link to="/patient/profile" className="inline-flex items-center text-teal-700 font-semibold hover:text-teal-900 hover:underline">
                  Edit Profile Details <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientOverview;
